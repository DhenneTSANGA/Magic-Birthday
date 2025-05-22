"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, User } from "@/utils/supabase";
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

export function UserButton() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await auth.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Erreur lors de la vérification de l'utilisateur:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.logout();
            router.push("/sign-in");
            router.refresh();
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
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

    const initials = user.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
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
                        <AvatarImage src="" alt={user.name || user.email || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.name || "Utilisateur"}
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