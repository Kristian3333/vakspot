// src/app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    
    // Clear NextAuth cookies
    cookieStore.delete('authjs.session-token');
    cookieStore.delete('authjs.csrf-token');
    cookieStore.delete('authjs.callback-url');
    cookieStore.delete('__Secure-authjs.session-token');
    cookieStore.delete('__Host-authjs.csrf-token');
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
