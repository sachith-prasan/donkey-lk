import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    // Create supabase client with the correct cookie store configuration
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user session after exchange
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profile')
        .select('*')
        .eq('id', session.user.id)
        .single()

      // If no profile exists, redirect to setup
      if (!profile) {
        return NextResponse.redirect(new URL('/setup', requestUrl.origin))
      }
    }
  }

  // Redirect to dashboard for handling further routing
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}