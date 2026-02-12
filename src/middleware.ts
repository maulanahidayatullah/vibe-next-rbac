import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/api/auth/login', '/api/auth/refresh', '/api/settings'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Allow API routes to handle their own auth
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Check for auth token in cookie/header for protected pages
    // We check localStorage on client side, so we use a lightweight approach here
    // The actual auth check happens client-side with the AuthGuard component
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
