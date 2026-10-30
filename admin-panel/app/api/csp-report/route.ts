import { NextRequest, NextResponse } from 'next/server'

/**
 * Příjem hlášení o porušení Content-Security-Policy (zatím v režimu
 * Report-Only). Hlášení se jen zapíšou do logu Vercelu - podle nich se
 * pravidla doladí, než se CSP začne vynucovat.
 */
export async function POST(req: NextRequest) {
  try {
    const text = (await req.text()).slice(0, 10_000)
    const body = JSON.parse(text)
    // report-uri posílá { 'csp-report': {...} }, Reporting API pole [{ body: {...} }]
    const reports = Array.isArray(body) ? body.map((r) => r?.body) : [body?.['csp-report']]
    for (const r of reports) {
      if (!r) continue
      console.warn('CSP violation', {
        directive: r['violated-directive'] ?? r.effectiveDirective,
        blocked: r['blocked-uri'] ?? r.blockedURL,
        page: r['document-uri'] ?? r.documentURL,
      })
    }
  } catch {
    // poškozené hlášení ignorovat
  }
  return new NextResponse(null, { status: 204 })
}
