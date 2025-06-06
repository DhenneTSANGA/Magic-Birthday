import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ["/mon-compte", "/creer-evenement", "/mes-evenements"];
// Routes d'authentification
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        console.log('Middleware - Début du traitement pour:', pathname);
        
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
                        console.log('Middleware - Lecture cookie:', name);
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        console.log('Middleware - Écriture cookie:', name);
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        console.log('Middleware - Suppression cookie:', name);
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        });
                    },
                },
            }
        );

        // Vérifier l'authentification avec getUser()
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
            console.error('Middleware - Erreur lors de la vérification de l\'utilisateur:', userError);
        }
        
        // Logs détaillés pour le débogage
        console.log('Middleware - Route:', pathname);
        console.log('Middleware - Utilisateur présent:', !!user);
        if (user) {
            console.log('Middleware - User ID:', user.id);
            // Log des cookies présents
            console.log('Middleware - Cookies présents:', Array.from(request.cookies.getAll()).map(c => c.name));
        }
        
        const isAuthenticated = !!user;

        // Rediriger vers la connexion si l'utilisateur n'est pas authentifié
        if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
            console.log('Middleware - Redirection vers /sign-in car non authentifié');
            const url = new URL("/sign-in", request.url);
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }

        // Rediriger vers la page d'accueil si l'utilisateur est authentifié et essaie d'accéder aux routes d'auth
        if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
            console.log('Middleware - Redirection vers / car déjà authentifié');
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Retourner la réponse avec les cookies de session
        return response;
    } catch (error) {
        console.error('Middleware - Erreur inattendue:', error);
        // En cas d'erreur, on laisse passer la requête
        return NextResponse.next();
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