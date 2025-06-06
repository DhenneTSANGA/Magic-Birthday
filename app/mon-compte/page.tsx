"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, User } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function MonComptePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await auth.getCurrentUser();
                if (!currentUser) {
                    router.push("/sign-in");
                    return;
                }
                setUser(currentUser);
                setName(currentUser.name || "");
            } catch (error) {
                console.error("Erreur lors de la vérification de l'utilisateur:", error);
                router.push("/sign-in");
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setUpdating(true);

        try {
            await auth.updateProfile(name);
            setSuccess("Profil mis à jour avec succès");
            setUser((prev) => prev ? { ...prev, name } : null);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setUpdating(true);

        try {
            await auth.updatePassword(currentPassword, newPassword);
            setSuccess("Mot de passe mis à jour avec succès");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour du mot de passe");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const initials = user.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
        : user.email?.[0].toUpperCase() || "U";

    return (
        <div className="container max-w-4xl py-8">
            <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="" alt={user.name || user.email || ""} />
                                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h2 className="text-xl font-semibold">{user.name || "Utilisateur"}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="space-y-6">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Profil</TabsTrigger>
                            <TabsTrigger value="security">Sécurité</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profil</CardTitle>
                                    <CardDescription>
                                        Mettez à jour vos informations personnelles
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleUpdateProfile}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nom</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}
                                        {success && (
                                            <Alert>
                                                <AlertDescription>{success}</AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={updating}
                                        >
                                            {updating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Mise à jour...
                                                </>
                                            ) : (
                                                "Mettre à jour le profil"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mot de passe</CardTitle>
                                    <CardDescription>
                                        Mettez à jour votre mot de passe
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleUpdatePassword}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">
                                                Mot de passe actuel
                                            </Label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) =>
                                                    setCurrentPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">
                                                Nouveau mot de passe
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">
                                                Confirmer le mot de passe
                                            </Label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}
                                        {success && (
                                            <Alert>
                                                <AlertDescription>{success}</AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={updating}
                                        >
                                            {updating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Mise à jour...
                                                </>
                                            ) : (
                                                "Mettre à jour le mot de passe"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
} 