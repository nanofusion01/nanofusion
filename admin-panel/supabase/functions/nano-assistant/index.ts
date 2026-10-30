import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Obsah znalostí/FAQ/služeb/článků se v adminu píše přes Tiptap (rich-text
// editor), takže v DB je uložený jako HTML ("<p><span style=...">). Když se
// to takhle syrové nacpe do system promptu, AI to zbytečně žere tokeny a
// občas to i doslovně propíše do odpovědi zákazníkovi. Než cokoliv jde do
// promptu, ořízneme to na čistý text.
function stripHtml(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const rawMessages: unknown[] = Array.isArray(body?.messages) ? body.messages : []

    if (rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Nebyly poskytnuty žádné zprávy' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Bezpečnostní sanitizace zpráv:
    // 1. Povolit pouze role 'user' a 'assistant' (ochrana proti prompt injection s rolí 'system')
    // 2. Omezit délku jednotlivé zprávy na 1000 znaků (ochrana před vyčerpáním tokenů)
    // 3. Vzít maximálně posledních 8 zpráv
    const sanitizedMessages = rawMessages
      .filter((m: unknown): m is { role: 'user' | 'assistant'; content: string } =>
        typeof m === 'object' && m !== null &&
        typeof (m as { content?: unknown }).content === 'string' &&
        ['user', 'assistant'].includes((m as { role?: unknown }).role as string))
      .slice(-8)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content).slice(0, 1000),
      }))

    if (sanitizedMessages.length === 0) {
      return new Response(JSON.stringify({ reply: 'Dobrý den, jak vám mohu pomoci s čištěním nebo nano-ochranou povrchů?' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // 1. Setup Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const openAiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAiKey) {
      return new Response(JSON.stringify({ reply: 'Omlouváme se, AI asistent je momentálně dočasně nedostupný. Zanechte nám prosím zprávu přes formulář nebo volejte +420 774 509 409.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Rate limit: každá zpráva stojí peníze za OpenAI, takže jedna IP adresa
    // smí poslat nejvýš CHAT_LIMIT_PER_HOUR zpráv za hodinu (migrace 015).
    // Pokud funkce v DB ještě není, limit se přeskočí, ať chat nepřestane fungovat.
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    const limitPerHour = Number(Deno.env.get('CHAT_LIMIT_PER_HOUR') ?? 30)
    const { data: withinLimit, error: limitError } = await supabase.rpc('check_rate_limit', {
      p_key: `chat:${ip}`,
      p_limit: limitPerHour,
      p_window_seconds: 3600,
    })
    if (limitError) {
      console.warn('Rate limit check failed (chybí migrace 015?):', limitError.message)
    } else if (withinLimit === false) {
      return new Response(JSON.stringify({ reply: 'Děkujeme za zájem! Poslali jste nám dnes už hodně zpráv, zkuste to prosím za chvíli znovu, nebo nám rovnou zavolejte na +420 774 509 409.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. FETCH ALL DATA IN PARALLEL
    const [pricesRes, knowledgeRes, faqsRes, servicesRes, articlesRes] = await Promise.all([
      supabase.from('configurator_prices').select('item_key, label, price, unit'),
      supabase.from('bot_knowledge').select('title, content, category').eq('is_active', true),
      supabase.from('faqs').select('question, answer').eq('is_active', true),
      supabase.from('services').select('slug, name, description').eq('is_active', true),
      supabase.from('articles').select('title, slug, content').eq('is_published', true)
    ])

    const prices = pricesRes.data
    const knowledge = knowledgeRes.data
    const faqs = faqsRes.data
    const services = servicesRes.data
    const articles = articlesRes.data

    // Format prices for the prompt
    const priceList = prices?.map(p => `- ${p.label}: ${p.price} Kč/${p.unit || 'm2'}`).join('\n') || 
      'Ceny jsou k dispozici na vyžádání.';
    
    // Format knowledge base
    const knowledgeContext = knowledge?.map(k => `### ${k.title} (${k.category})\n${stripHtml(k.content)}`).join('\n\n') ||
      'Zatím nemáme doplňující informace.';

    // Format FAQs
    const faqContext = faqs?.map(f => `Otázka: ${f.question}\nOdpověď: ${stripHtml(f.answer)}`).join('\n\n') ||
      'Žádné FAQ.';

    // Format services
    const servicesContext = services?.map(s => `---\n${s.name} (slug: ${s.slug})\n${stripHtml(s.description)}`).join('\n\n') ||
      'Žádné služby.';

    // Format articles
    const articlesContext = articles?.map(a => `---\n${a.title}\n${stripHtml(a.content)}`).join('\n\n') ||
      'Žádné články.';

    const systemPrompt = `
      Jsi profesionální AI asistent pro firmu NANOfusion s.r.o., experta na hloubkové čištění a nano-ochranu povrchů.
      Tvá role je fungovat jako špičkový technický a obchodní konzultant.
      
      --- SLUŽBY ---
      ${servicesContext}
      
      --- ČASTÉ DOTAZY ---
      ${faqContext}
      
      --- ČLÁNKY A INFORMACE ---
      ${articlesContext}
      
      --- ZNALOSTNÍ BÁZE ---
      ${knowledgeContext}
      
      CENÍK (Kč/m2 nebo jednotku):
      ${priceList}
      
      KLÍČOVÉ INFORMACE:
      - Záruka na nano-ochranu: až 10 let
      - Termíny realizace: obvykle do 14 dnů
      - Zaměření a konzultace: ZDARMA po celé ČR
      - Sídlo: Blučina (jižní Morava), působíme po celé ČR
      
      TVÉ CÍLE:
      1. ODPovídát na technické dotazy přesně na základě výše uvedených dat
      2. POMOCI S KALKULACÍ (vždy počítej s cenou z ceníku výše)
      3. ZÍSKAT KONTAKT (Jméno, Telefon, Adresa, Plocha)
      
      PRAVIDLA:
      - Buď profesionální, stručný a přátelský
      - Odpovídej POUZE na základě poskytnutých dat — nikdy si nevymýšlej ceny, technologie nebo postupy
      - Pokud neznáš odpověď, řekni: "Tento specifický detail s vámi rád probere náš hlavní technik. Mohu vás s ním spojit?"
      - Piš stručně (max 2-3 věty na odstavec), používej odrážky pro čitelnost
      
      SKRYTÁ ZNAČKA PRO LEAD:
      Pokud získáš kontaktní údaje, přidej na ÚPLNÝ KONEC zprávy:
      [LEAD: Jméno, Telefon, Adresa, Plocha]
      (Nevyplněné údaje nahraď slovem "Neznámé")
    `;

    // 3. Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...sanitizedMessages],
        temperature: 0.2,
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message);

    const botMessage = data.choices[0].message.content
    
    return new Response(JSON.stringify({ reply: botMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Function Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
