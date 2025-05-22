import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ["/mon-compte", "/creer-evenement"];
// Routes d'authentification
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const res = NextResponse.next();
    
    // Créer un client Supabase pour le middleware
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Vérifier la session
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    // Rediriger vers la connexion si l'utilisateur n'est pas authentifié
    if (protectedRoutes.includes(pathname) && !isAuthenticated) {
        const url = new URL("/sign-in", request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    // Rediriger vers la page d'accueil si l'utilisateur est authentifié
    if (authRoutes.includes(pathname) && isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return res;
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
    matcher: [...protectedRoutes, ...authRoutes],
}; 