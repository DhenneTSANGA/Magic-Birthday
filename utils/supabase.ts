import { createClient } from '@supabase/supabase-js';

// Types pour l'authentification
export interface User {
    id: string;
    email: string;
    name?: string;
}

// Initialisation du client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonctions d'authentification
export const auth = {
    // Créer un compte
    async createAccount(email: string, password: string, name: string) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    },
                },
            });

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Se connecter
    async login(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Se déconnecter
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            throw error;
        }
    },

    // Obtenir l'utilisateur actuel
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            
            if (!user) return null;

            return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata.name,
            } as User;
        } catch (error) {
            return null;
        }
    },

    // Vérifier si l'utilisateur est connecté
    async isAuthenticated() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return !!user;
        } catch (error) {
            return false;
        }
    },

    // Mettre à jour le profil
    async updateProfile(name: string) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { name },
            });

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour le mot de passe
    async updatePassword(newPassword: string) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
            return data;
        } catch (error) {
            throw error;
        }
    },
}; 