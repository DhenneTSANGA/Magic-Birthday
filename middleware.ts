import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ["/mon-compte", "/creer-evenement", "/mes-evenements"];
// Routes d'authentification
const authRoutes = ["/sign-in", "/sign-up"];

const isDevelopment = process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        
        if (isDevelopment) {
            console.log('-------- Middleware Debug --------');
            console.log('Current path:', pathname);
            console.log('Cookies:', Array.from(request.cookies.getAll()).map(c => c.name));
        }

        // Créer une réponse
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        // Créer un client Supabase pour le middleware
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        const cookie = request.cookies.get(name);
                        if (isDevelopment) {
                            console.log('Reading cookie:', name, cookie ? 'found' : 'not found');
                        }
                        return cookie?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        if (isDevelopment) {
                            console.log('Setting cookie:', name);
                        }
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                            path: '/',
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            httpOnly: true
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        if (isDevelopment) {
                            console.log('Removing cookie:', name);
                        }
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                            path: '/',
                            maxAge: 0
                        });
                    },
                },
            }
        );

        // Vérifier l'authentification avec getUser()
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (isDevelopment) {
            console.log('Auth check result:');
            console.log('- User:', user ? 'found' : 'not found');
            console.log('- User ID:', user?.id);
            console.log('- Error:', userError ? userError.message : 'none');
            if (user) {
                console.log('- Email:', user.email);
                console.log('- Last sign in:', user.last_sign_in_at);
            }
        }

        const isAuthenticated = !!user;

        // Rediriger vers la connexion si l'utilisateur n'est pas authentifié
        if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
            if (isDevelopment) {
                console.log('Redirecting to sign-in because:');
                console.log('- Is protected route:', protectedRoutes.some(route => pathname.startsWith(route)));
                console.log('- Is not authenticated:', !isAuthenticated);
            }
            const url = new URL("/sign-in", request.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }

        // Rediriger vers la page d'accueil si l'utilisateur est authentifié et essaie d'accéder aux routes d'auth
        if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
            if (isDevelopment) {
                console.log('Redirecting to home because user is already authenticated');
            }
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (isDevelopment) {
            console.log('Proceeding with request');
            console.log('--------------------------------');
        }

        // Retourner la réponse avec les cookies de session
        return response;
    } catch (error) {
        if (isDevelopment) {
            console.error('Middleware error:', error);
        }
        // En cas d'erreur, rediriger vers la page de connexion
        const url = new URL("/sign-in", request.url);
        return NextResponse.redirect(url);
    }
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}; 