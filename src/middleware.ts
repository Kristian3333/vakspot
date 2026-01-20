// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/client',
  '/pro',
  '/admin',
  '/messages',
  '/settings',
  '/profile',
];

// Routes that require specific roles
const roleRoutes = {
  '/client': ['CLIENT', 'ADMIN'],
  '/pro': ['PRO', 'ADMIN'],
  '/admin': ['ADMIN'],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if not authenticated
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (isLoggedIn && userRole) {
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (nextUrl.pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          const redirectUrl = userRole === 'PRO' ? '/pro/leads' : '/client/jobs';
          return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin));
        }
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    const redirectUrl = userRole === 'PRO' 
      ? '/pro/leads' 
      : userRole === 'ADMIN' 
        ? '/admin' 
        : '/client/jobs';
    return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
