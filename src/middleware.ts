// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/client',
  '/pro',
  '/admin',
  '/messages',
];

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
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
          const redirectUrl = userRole === 'PRO' ? '/pro/jobs' : '/client/jobs';
          return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin));
        }
      }
    }
  }

  // Redirect authenticated users away from auth pages and home
  if (isLoggedIn) {
    const isAuthPage = nextUrl.pathname === '/login' || 
                       nextUrl.pathname === '/register' ||
                       nextUrl.pathname.startsWith('/register/');
    const isHomePage = nextUrl.pathname === '/';
    
    if (isAuthPage || isHomePage) {
      const redirectUrl = userRole === 'PRO' 
        ? '/pro/jobs' 
        : userRole === 'ADMIN' 
          ? '/admin' 
          : '/client/jobs';
      return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
