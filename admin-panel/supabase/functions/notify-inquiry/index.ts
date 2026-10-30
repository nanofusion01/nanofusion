import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

/**
 * E-mailová notifikace o nové poptávce.
 *
 * Volá ji Supabase Database Webhook při INSERT do tabulky inquiries
 * (payload { type, table, record }). Webhook musí posílat hlavičku
 * `x-webhook-secret` se stejnou hodnotou jako tajemství WEBHOOK_SECRET -
 * jinak by funkci mohl zavolat kdokoli a posílat e-maily na firemní adresu.
 *
 * Tajemství funkce (supabase secrets set ...):
 *   RESEND_API_KEY      - klíč k Resend
 *   WEBHOOK_SECRET      - sdílené tajemství s databázovým webhookem
 *   NOTIFICATION_EMAIL  - kam notifikace chodí (výchozí info@nanofusion.cz)
 *   RESEND_FROM         - odesílatel, doména musí být ověřená v Resend
 *   ADMIN_URL           - adresa administrace pro odkaz v e-mailu
 */

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (!secret || req.headers.get('x-webhook-secret') !== secret) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await req.json()
    if (payload?.table && payload.table !== 'inquiries') return json({ ok: true, skipped: 'other table' })
    if (payload?.type && payload.type !== 'INSERT') return json({ ok: true, skipped: payload.type })
    const record = payload?.record ?? {}

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.warn('RESEND_API_KEY není nastaven - e-mail přeskočen')
      return json({ ok: false, reason: 'no key' })
    }
    const notifyEmail = Deno.env.get('NOTIFICATION_EMAIL') ?? 'info@nanofusion.cz'
    const from = Deno.env.get('RESEND_FROM') ?? 'NANOfusion Notifikace <noreply@nanofusion.cz>'
    const adminUrl = (Deno.env.get('ADMIN_URL') ?? 'https://nanofusion-j3bs.vercel.app').replace(/\/$/, '')

    const name = String(record.name || 'Neznámý').slice(0, 200)
    const email = String(record.email || '').slice(0, 200)
    const phone = String(record.phone || '').slice(0, 50)
    const service = String(record.service || '').slice(0, 200)
    const message = String(record.message || '').slice(0, 5000)
    const source = String(record.source || 'Web').slice(0, 100)
    const createdAt = new Date(record.created_at ?? Date.now()).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })

    const row = (label: string, value: string) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; color: #94a3b8; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; width: 120px; vertical-align: top;">${label}</td>
          <td style="padding: 12px 0; color: #1e293b; font-weight: 600;">${value}</td>
        </tr>`

    const html = `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: system-ui, sans-serif; background: #f8fafc; padding: 0; margin: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 1.5rem; font-weight: 800;">Nová poptávka</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 0.9rem;">${escapeHtml(createdAt)} · ${escapeHtml(source)}</p>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${row('Jméno', escapeHtml(name))}
        ${email ? row('E-mail', `<a href="mailto:${escapeHtml(email)}" style="color: #D97706;">${escapeHtml(email)}</a>`) : ''}
        ${phone ? row('Telefon', `<a href="tel:${escapeHtml(phone.replace(/\s/g, ''))}" style="color: #D97706;">${escapeHtml(phone)}</a>`) : ''}
        ${service ? row('Služba', escapeHtml(service)) : ''}
        ${message ? row('Zpráva', escapeHtml(message).replace(/\n/g, '<br>')) : ''}
      </table>
      <div style="margin-top: 28px; text-align: center;">
        <a href="${escapeHtml(adminUrl)}/admin/inquiries"
           style="display: inline-block; background: #F59E0B; color: white; padding: 14px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 0.9rem;">
          Otevřít v administraci →
        </a>
      </div>
    </div>
    <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
      <p style="margin: 0; color: #94a3b8; font-size: 0.75rem;">NANOfusion s.r.o. · Automatická notifikace · Neodpovídejte na tento e-mail</p>
    </div>
  </div>
</body>
</html>`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [notifyEmail],
        reply_to: email || undefined,
        subject: `Nová poptávka: ${name} — ${service || source}`,
        html,
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.error('Resend error:', errText)
      return json({ ok: false, error: 'Resend error' }, 502)
    }
    return json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('notify-inquiry error:', message)
    return json({ error: message }, 500)
  }
})
