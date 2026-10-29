import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Static files bypass
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // 2. Auth check for /admin routes
  const isLoginPath = pathname === '/admin/login' || pathname === '/admin/auth/callback'
  request.headers.set('x-current-path', pathname)

  try {
    const { supabaseResponse, user } = await updateSession(request)

    // 3. Simple auth logic
    if (pathname.startsWith('/admin')) {
      if (!user && !isLoginPath) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      if (user && isLoginPath) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    return supabaseResponse
  } catch (e) {
    console.error('Proxy auth check error:', e)
    // If supabase fails on protected admin route, redirect to login for safety
    if (pathname.startsWith('/admin') && !isLoginPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
