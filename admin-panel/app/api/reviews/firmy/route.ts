import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseFirmyReviews, parseFirmyStats } from '@/lib/firmy-scraper'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  // Vercel Cron automaticky posílá "Authorization: Bearer <CRON_SECRET>" -
  // to je primární cesta. ?key= zůstává jen pro ruční/manuální spuštění.
  const authHeader = request.headers.get('authorization')

  // Auth: cron nebo admin
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    key === process.env.CRON_SECRET ||
    process.env.NODE_ENV !== 'production'
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profileUrl = process.env.FIRMY_CZ_PROFILE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!profileUrl || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Chybí konfigurace: FIRMY_CZ_PROFILE_URL, NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Stáhni HTML profilu Firmy.cz
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'cs-CZ,cs;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Firmy.cz odpověděl: ${response.status}` }, { status: 502 })
    }

    const html = await response.text()

    // 2. Celkové hodnocení (pro stats)
    const { rating: overallRating, reviewCount } = parseFirmyStats(html)

    // 3. Recenze - viz komentář u parseFirmyReviews v lib/firmy-scraper.ts
    const reviews = parseFirmyReviews(html)

    // 4. Upsert recenzí do external_reviews (skip duplicity přes external_id)
    let imported = 0
    let skipped = 0

    for (const rev of reviews) {
      const { error } = await supabase.from('external_reviews').upsert({
        source: 'firmy.cz',
        external_id: rev.external_id,
        author: rev.author,
        rating: rev.rating,
        content: rev.content,
        published_at: rev.published_at,
        approved: false, // Čeká na schválení v admin panelu
        fetched_at: new Date().toISOString(),
      }, { onConflict: 'external_id', ignoreDuplicates: true })

      if (error) {
        skipped++
      } else {
        imported++
      }
    }

    // 5. Ulož celkové hodnocení do firmy_stats (pro dashboard)
    if (overallRating > 0) {
      try {
        await supabase.from('firmy_stats').upsert({
          rating: overallRating,
          review_count: reviewCount,
          updated_at: new Date().toISOString(),
        })
      } catch (_) {} // Tabulka nemusí existovat
    }

    console.log(`Firmy.cz sync: ${imported} nových, ${skipped} přeskočeno, ${reviews.length} celkem`)

    return NextResponse.json({
      ok: true,
      overall_rating: overallRating,
      total_on_firmy: reviewCount,
      parsed_reviews: reviews.length,
      imported,
      skipped,
      note: imported > 0
        ? `${imported} nových recenzí čeká na schválení v admin panelu`
        : 'Žádné nové recenze k importu (buď žádné nové, nebo Firmy.cz zase změnili HTML strukturu)',
    })

  } catch (error: any) {
    console.error('Firmy.cz scrape error:', error)
    return NextResponse.json({ error: 'Scraping selhal: ' + error.message }, { status: 500 })
  }
}
