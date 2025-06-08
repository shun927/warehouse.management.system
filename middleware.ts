import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Simplified middleware invoked for path:', request.nextUrl.pathname);
  return NextResponse.next();
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
     * so they need to be handled if they should bypass the middleware.
     * Or, add them to the matcher's negative lookaheads below.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)',
  ],
};
