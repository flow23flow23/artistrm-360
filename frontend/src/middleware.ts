import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                       path === '/register' || 
                       path === '/forgot-password' ||
                       path.startsWith('/api/public');
  
  // Get the token from the cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Redirect logic
  if (isPublicPath && token) {
    // If user is authenticated and tries to access public path, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (!isPublicPath && !token) {
    // If user is not authenticated and tries to access protected path, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure the paths that should be checked by the middleware
export const config = {
  matcher: [
    // Match all paths except for:
    // - api routes that don't need auth
    // - static files (images, fonts, etc)
    // - favicon.ico
    '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
  ],
};
