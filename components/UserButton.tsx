"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Initialisation du client Supabase
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function UserButton() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                console.log('UserButton - Vérification de l\'utilisateur...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.error('UserButton - Erreur de session:', sessionError);
                    setUser(null);
                    return;
                }

                if (!session) {
                    console.log('UserButton - Aucune session active');
                    setUser(null);
                    return;
                }

                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error('UserButton - Erreur utilisateur:', userError);
                    setUser(null);
                    return;
                }

                console.log('UserButton - Utilisateur connecté:', user?.email);
                setUser(user);
            } catch (error) {
                console.error('UserButton - Erreur lors de la vérification:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('UserButton - Changement d\'état auth:', event);
                if (event === 'SIGNED_IN' && session) {
                    const { data: { user } } = await supabase.auth.getUser();
                    setUser(user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            console.log('UserButton - Déconnexion...');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            setUser(null);
            router.push("/sign-in");
            router.refresh();
        } catch (error) {
            console.error('UserButton - Erreur lors de la déconnexion:', error);
        }
    };

    if (loading) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/sign-in")}
                >
                    Connexion
                </Button>
                <Button
                    onClick={() => router.push("/sign-up")}
                >
                    Inscription
                </Button>
            </div>
        );
    }

    const initials = user.user_metadata?.name
        ? user.user_metadata.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
        : user.email?.[0].toUpperCase() || "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.name || "Utilisateur"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/mon-compte")}>
                    Mon compte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/creer-evenement")}>
                    Créer un événement
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    Déconnexion
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 