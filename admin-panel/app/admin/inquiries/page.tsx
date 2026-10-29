import { createAdminClient } from '@/lib/supabase/server'
import { InquiriesClient } from './inquiries-client'

export default async function InquiriesPage() {
  const supabase = await createAdminClient()
  if (!supabase) {
    return <InquiriesClient initialInquiries={[]} />
  }

  // Poptávky z webu + AI analýzy (tabulka ai_analyses)
  const [inquiriesResult, leadsResult] = await Promise.all([
    supabase.from('inquiries').select('*'),
    supabase.from('ai_analyses').select('*')
  ])

  const rawInquiries = inquiriesResult.data || []
  const leads = leadsResult.data || []

  // Extrakce názvu souboru pro bucket inquiries (z URL i z textové zprávy)
  const extractInquiryFileName = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.includes('inquiries/')) {
      return url.split('inquiries/').pop()?.split('?')[0] || null
    }
    const match = url.match(/(kalkulace_[a-zA-Z0-9_]+\.[a-zA-Z]{3,4}|inquiry_[a-zA-Z0-9_]+\.[a-zA-Z]{3,4})/)
    if (match) return match[1]
    return null
  }

  // Hromadná příprava cest pro 1 společný batch podpis (createSignedUrls)
  const filePathsToSign = new Set<string>()
  rawInquiries.forEach((inq: any) => {
    let p = inq.original_photo_url || inq.photo_url || inq.image_url
    if (!p && inq.message) {
      const match = inq.message.match(/(https?:\/\/[^\s\n]+inquiries\/[^\s\n]+|kalkulace_[a-zA-Z0-9_]+\.[a-zA-Z]{3,4}|inquiry_[a-zA-Z0-9_]+\.[a-zA-Z]{3,4})/)
      if (match) p = match[1]
    }
    const fn = extractInquiryFileName(p)
    if (fn) filePathsToSign.add(fn)
  })

  leads.forEach((lead) => {
    const fn = extractInquiryFileName(lead.original_photo_url)
    if (fn) filePathsToSign.add(fn)
  })

  const signedUrlMap = new Map<string, string>()
  if (filePathsToSign.size > 0) {
    try {
      const { data: signedResults, error: signedError } = await supabase.storage
        .from('inquiries')
        .createSignedUrls(Array.from(filePathsToSign), 86400) // 24 hodin
      
      if (!signedError && signedResults) {
        signedResults.forEach((res: any) => {
          if (res.signedUrl && res.path) {
            signedUrlMap.set(res.path, res.signedUrl)
          }
        })
      }
    } catch (e) {
      console.warn('Batch createSignedUrls error:', e)
    }
  }

  const resolvePhoto = (url: string | null | undefined): string | null => {
    if (!url) return null
    const fn = extractInquiryFileName(url)
    if (fn && signedUrlMap.has(fn)) {
      return signedUrlMap.get(fn)!
    }
    return url
  }

  // Ensure photo URLs are mapped for standard inquiries
  const inquiries = rawInquiries.map((inq: any) => {
    let photoUrl = inq.original_photo_url || inq.photo_url || inq.image_url || null
    if (!photoUrl && inq.message && /Fotografie/i.test(inq.message)) {
      const match = inq.message.match(/(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s\n]+)/)
      if (match) photoUrl = match[1]
    }
    return {
      ...inq,
      original_photo_url: resolvePhoto(photoUrl),
    }
  })

  // Map leads to match the inquiries structure
  const mappedLeads = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    service: `AI Analýza - ${lead.object_type || lead.analysis_type || 'Fasáda'}`,
    message: lead.analysis_result || '',
    status: lead.status || 'new',
    source: 'ai_analyzer',
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    // poznámky administrátora - stejný sloupec jako v sekci AI Analyzér
    notes: lead.additional_notes || '',
    original_photo_url: resolvePhoto(lead.original_photo_url) || '',
  }))

  // Combine and sort by created_at DESC
  const allInquiries = [...inquiries, ...mappedLeads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <InquiriesClient
      initialInquiries={allInquiries as any[]}
    />
  )
}
