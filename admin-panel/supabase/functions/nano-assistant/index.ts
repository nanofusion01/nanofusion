import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    
    // 1. Setup Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. FETCH LIVE PRICES FROM DB
    const { data: prices } = await supabase
      .from('configurator_prices')
      .select('item_key, label, price, unit')

    // Format prices for the prompt
    const priceList = prices?.map(p => `- ${p.label}: ${p.price} Kč/${p.unit || 'm2'}`).join('\n') || 
      'Ceny jsou k dispozici na vyžádání.';

    const systemPrompt = `
      Jsi Nano-asistent pro firmu NANOfusion s.r.o., specialista na hloubkové čištění a nano-ochranu povrchů.
      
      AKTUÁLNÍ CENÍK (synchronizováno z Admin Panelu):
      ${priceList}
      
      DŮLEŽITÉ INFORMACE:
      - Záruka na nano-ochranu: až 10 let.
      - Termíny realizace: obvykle do 14 dnů.
      - Zaměření a konzultace: ZDARMA.
      - Sídlo: Blučina (jižní Morava), působíme po celé ČR.
      
      TVŮJ CÍL:
      1. Odpovídat na technické dotazy.
      2. Pomoci s kalkulací (vždy počítej s plochou a cenou z ceníku výše).
      3. ZÍSKAT KONTAKT (Jméno, Adresa, Plocha, Telefon).
      
      PRAVIDLA:
      - Buď profesionální, stručný a přátelský.
      - Pokud získáš klíčové údaje, uveď je na konci v tagu: [LEAD: Jméno, Telefon, Adresa, Plocha].
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
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message);

    const botMessage = data.choices[0].message.content
    
    return new Response(JSON.stringify({ reply: botMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
