import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Restrict the post-auth redirect target to *paths on our own origin*. The
// previous implementation appended any `?next=` value to `origin`, which
// allowed payloads like `next=//evil.com` or `next=/\evil.com` (which some
// browsers normalise into a cross-origin redirect) to turn this endpoint
// into an open-redirect / phishing helper.
function safeNext(next: string | null): string {
  if (!next) return '/dashboard'
  // Must look like an absolute path with a single leading slash.
  if (!next.startsWith('/')) return '/dashboard'
  // Reject protocol-relative ("//evil.com") and backslash-bypass ("/\\evil.com")
  // patterns that historically have escaped naive same-origin checks.
  if (
    next.startsWith('//') ||
    next.startsWith('/\\') ||
    next.includes('\r') ||
    next.includes('\n')
  ) {
    return '/dashboard'
  }
  return next
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
