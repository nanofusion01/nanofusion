import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  // Basic security for cron
  if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profileUrl = process.env.FIRMY_CZ_PROFILE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!profileUrl || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 }
    })
    const html = await response.text()

    // 1. Scrape overall score
    const ratingMatch = html.match(/class="score-value">([\d,.]+)</)
    const countMatch = html.match(/class="score-count">(\d+)/)

    const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : 0
    const count = countMatch ? parseInt(countMatch[1]) : 0

    // Persist stats
    await supabase.from('firmy_stats').insert({
      rating,
      review_count: count,
      updated_at: new Date().toISOString()
    })

    // 2. Scrape individual reviews (simplified implementation)
    // Note: Firmy.cz often loads reviews via JS, but some might be in the initial HTML or a hidden JSON
    // For now we persist the stats. In a real scenario, we'd use a more complex parser for the review list.
    
    return NextResponse.json({
      success: true,
      data: { rating, count },
      updated_at: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Firmy.cz scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape reviews' }, { status: 500 })
  }
}
