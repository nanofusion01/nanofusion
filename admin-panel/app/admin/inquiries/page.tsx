import { createAdminClient } from '@/lib/supabase/server'
import { InquiriesClient } from './inquiries-client'

export default async function InquiriesPage() {
  const supabase = await createAdminClient()
  if (!supabase) {
    return <InquiriesClient initialInquiries={[]} />
  }

  // Parallel fetch for both inquiries and AI analyzer leads
  const [inquiriesResult, leadsResult] = await Promise.all([
    supabase.from('inquiries').select('*'),
    supabase.from('leads').select('*')
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

  leads.forEach((lead: any) => {
    const fn = extractInquiryFileName(lead.original_photo_url || lead.image_url)
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
  const mappedLeads = leads.map((lead: any) => {
    let message = lead.analysis_result || ''
    if (lead.additional_notes) {
      message += `\n\nDodatečné informace poptávky:\n${lead.additional_notes}`
    }

    const photoUrl = lead.original_photo_url || lead.image_url || ''

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      service: `AI Analýza - ${lead.surface || lead.analysis_type || 'Fasáda'}`,
      message: message,
      status: lead.status || 'new',
      source: 'ai_analyzer',
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      notes: lead.description || '', // We use 'description' for admin notes on leads
      original_photo_url: resolvePhoto(photoUrl) || '',
    }
  })

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
