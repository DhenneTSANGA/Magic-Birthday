import { createBrowserClient } from '@supabase/ssr';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Types pour l'authentification
export interface User {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
}

// Initialisation du client Supabase
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getOAuthRedirectUrl(callbackUrl: string) {
    const isLocal = typeof window !== 'undefined' && window.location.origin.includes('localhost');
    const base = isLocal
        ? 'http://localhost:3000'
        : 'https://magic-birthday.vercel.app';
    return `${base}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

// Service d'authentification
export const auth = {
    supabase,

    async createAccount(email: string, password: string, name: string, firstName: string, lastName: string) {
        try {
            console.log('Auth - Création du compte...');
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { 
                        name,
                        firstName,
                        lastName
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;

            // Vérifier si l'email de confirmation a été envoyé
            if (data?.user?.identities?.length === 0) {
                throw new Error("Un compte existe déjà avec cet email");
            }

            console.log('Auth - Compte créé avec succès');
            return {
                user: data.user ? {
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata.name,
                    firstName: data.user.user_metadata.firstName,
                    lastName: data.user.user_metadata.lastName
                } : null,
                session: data.session
            };
        } catch (error) {
            console.error('Auth - Erreur lors de la création du compte:', error);
            throw error;
        }
    },

    async login(email: string, password: string) {
        try {
            console.log('Auth - Tentative de connexion...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('Auth - Connexion réussie');
            return {
                user: data.user ? {
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata.name
                } : null,
                session: data.session
            };
        } catch (error) {
            console.error('Auth - Erreur lors de la connexion:', error);
            throw error;
        }
    },

    async loginWithGitHub(callbackUrl = '/') {
        try {
            console.log('Auth - Tentative de connexion avec GitHub...');
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: getOAuthRedirectUrl(callbackUrl)
                }
            });

            if (error) throw error;

            console.log('Auth - Redirection vers GitHub...');
            return data;
        } catch (error) {
            console.error('Auth - Erreur lors de la connexion avec GitHub:', error);
            throw error;
        }
    },

    async loginWithGoogle(callbackUrl = '/') {
        try {
            const redirectTo = getOAuthRedirectUrl(callbackUrl);
            console.log('[OAuth Google] callbackUrl:', callbackUrl, '| redirectTo:', redirectTo);
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo
                }
            });

            if (error) throw error;

            console.log('Auth - Redirection vers Google...');
            return data;
        } catch (error) {
            console.error('Auth - Erreur lors de la connexion avec Google:', error);
            throw error;
        }
    },

    async logout() {
        try {
            console.log('Auth - Déconnexion...');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            console.log('Auth - Déconnexion réussie');
        } catch (error) {
            console.error('Auth - Erreur lors de la déconnexion:', error);
            throw error;
        }
    },

    async getCurrentUser(): Promise<User | null> {
        try {
            console.log('Auth - Récupération de l\'utilisateur actuel...');
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            if (!session) {
                console.log('Auth - Aucune session active');
                return null;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) {
                console.log('Auth - Aucun utilisateur trouvé');
                return null;
            }

            console.log('Auth - Utilisateur récupéré avec succès');
            return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata.name,
                firstName: user.user_metadata.firstName,
                lastName: user.user_metadata.lastName
            };
        } catch (error) {
            console.error('Auth - Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }
    },

    async isAuthenticated(): Promise<boolean> {
        try {
            console.log('Auth - Vérification de l\'authentification...');
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            const isAuth = !!session;
            console.log('Auth - État de l\'authentification:', isAuth ? 'Authentifié' : 'Non authentifié');
            return isAuth;
        } catch (error) {
            console.error('Auth - Erreur lors de la vérification de l\'authentification:', error);
            return false;
        }
    },

    async updateProfile(name: string) {
        try {
            console.log('Auth - Mise à jour du profil...');
            const { data: { user }, error } = await supabase.auth.updateUser({
                data: { name }
            });

            if (error) throw error;
            if (!user) throw new Error('Utilisateur non trouvé');

            console.log('Auth - Profil mis à jour avec succès');
            return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata.name
            };
        } catch (error) {
            console.error('Auth - Erreur lors de la mise à jour du profil:', error);
            throw error;
        }
    },

    async updatePassword(newPassword: string) {
        try {
            console.log('Auth - Mise à jour du mot de passe...');
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            console.log('Auth - Mot de passe mis à jour avec succès');
        } catch (error) {
            console.error('Auth - Erreur lors de la mise à jour du mot de passe:', error);
            throw error;
        }
    }
}; 