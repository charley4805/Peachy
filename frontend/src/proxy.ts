import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always call getUser() — this refreshes the session cookie
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes that never require auth
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/employee-portal') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/partner')

  // Unauthenticated user trying to reach a protected route
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (user) {
    // Let the callback and verify pages through without extra checks
    if (pathname.startsWith('/auth/callback') || pathname === '/auth/verify') {
      return supabaseResponse
    }

    // For all other routes that need an onboarding check, fetch the profile once
    const needsOnboardingCheck =
      pathname === '/auth' ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding')

    if (needsOnboardingCheck) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single()

      const isOnboarded = profile?.onboarding_complete ?? false

      // Logged-in user on /auth → send them where they belong
      if (pathname === '/auth') {
        return NextResponse.redirect(
          new URL(isOnboarded ? '/dashboard' : '/onboarding/profile', request.url)
        )
      }

      // Dashboard requires completed onboarding
      if (pathname.startsWith('/dashboard') && !isOnboarded) {
        return NextResponse.redirect(new URL('/onboarding/profile', request.url))
      }

      // Completed onboarding users don't need to redo it
      if (pathname.startsWith('/onboarding') && isOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
