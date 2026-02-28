import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PATHS = ['/dashboard', '/marketplace', '/ops'];
const AUTH_PATHS = ['/register', '/login'];

/** Marketplace paths that are public (no auth required). */
const PUBLIC_MARKETPLACE_PATHS = ['/marketplace/developers/generator'];

/** Dashboard-style paths that are public (e.g. "See it live" landing CTA). */
const PUBLIC_PATHS = ['/ops'];

function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicMarketplacePath(pathname: string): boolean {
  return PUBLIC_MARKETPLACE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isSignedIn = !!token;

  if (
    isDashboardPath(pathname) &&
    !isPublicMarketplacePath(pathname) &&
    !isPublicPath(pathname) &&
    !isSignedIn
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/register';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath(pathname) && isSignedIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/marketplace/:path*', '/ops/:path*', '/register', '/login'],
};
