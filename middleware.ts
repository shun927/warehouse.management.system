import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTE_PATHS } from './constants';

export async function middleware(request: NextRequest) {
  console.log('Middleware started for path:', request.nextUrl.pathname);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY provided:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); // キー自体はログに出さない

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );
    console.log('Supabase client created');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Supabase auth.getUser error:', authError);
    }
    console.log('User object:', user ? `User ID: ${user.id}` : 'No user');

    const { pathname } = request.nextUrl;

    // Allow access to public assets (manifest, service worker, icons)
    // These are not excluded by the matcher below, so they need to be explicitly allowed here.
    if (
      pathname === '/manifest.json' ||
      pathname === '/sw.js' ||
      pathname.startsWith('/icons/')
    ) {
      return response;
    }

    // If user is not authenticated
    if (!user) {
      console.log('User not authenticated, current path:', pathname);
      // Allow access to login page
      if (pathname === ROUTE_PATHS.LOGIN) {
        console.log('Allowing access to login page');
        return response;
      }
      // For any other page, redirect to login
      console.log('Redirecting to login page');
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_PATHS.LOGIN;
      return NextResponse.redirect(url);
    }

    // If user is authenticated
    if (user) {
      console.log('User authenticated, current path:', pathname);
      // If trying to access login page, redirect to dashboard
      if (pathname === ROUTE_PATHS.LOGIN) {
        console.log('User authenticated and on login page, redirecting to dashboard');
        const url = request.nextUrl.clone();
        url.pathname = ROUTE_PATHS.DASHBOARD;
        return NextResponse.redirect(url);
      }
    }
    console.log('Middleware finished, returning response.');
    return response;

  } catch (e: any) {
    console.error('Error in middleware:', e);
    // Return a generic error response or re-throw to see Vercel's error page
    return new NextResponse('Internal Server Error in Middleware', { status: 500 });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (for Supabase auth routes like callback, if any in future)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Paths like /manifest.json, /sw.js, /icons/ are NOT excluded here by default,
     * so they are handled by the middleware logic above.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
