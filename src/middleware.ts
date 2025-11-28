import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes
    const protectedRoutes = ['/app', '/study', '/player', '/profile', '/library'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isProfileSetup = request.nextUrl.pathname === '/profile/setup';

    // 1. If accessing protected route without user -> Login
    if (isProtectedRoute && !user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // 2. If user is logged in
    if (user) {
        // Optimization: Only check profile if NOT already on setup page and NOT on a static asset
        if (!isProfileSetup && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            // If no profile -> Force Setup
            if (!profile) {
                const redirectUrl = request.nextUrl.clone();
                redirectUrl.pathname = '/profile/setup';
                return NextResponse.redirect(redirectUrl);
            }
        }

        // If on Auth pages -> Home (or redirect back if param exists)
        if (isAuthRoute) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/';
            return NextResponse.redirect(redirectUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
