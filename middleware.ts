import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTE_PATHS } from './constants';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  const { data: { user } } = await supabase.auth.getUser();

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
    // Allow access to login page
    if (pathname === ROUTE_PATHS.LOGIN) {
      return response;
    }
    // For any other page, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = ROUTE_PATHS.LOGIN;
    return NextResponse.redirect(url);
  }

  // If user is authenticated
  if (user) {
    // If trying to access login page, redirect to dashboard
    if (pathname === ROUTE_PATHS.LOGIN) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTE_PATHS.DASHBOARD;
      return NextResponse.redirect(url);
    }
  }

  return response;
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
