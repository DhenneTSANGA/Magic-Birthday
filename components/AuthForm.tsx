"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
    mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "register") {
                const { user } = await auth.createAccount(email, password, name);
                if (user?.identities?.length === 0) {
                    setError("Un compte existe déjà avec cet email");
                    return;
                }
                setVerificationSent(true);
            } else {
                await auth.login(email, password);
                const callbackUrl = searchParams.get("callbackUrl") || "/";
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Vérification requise</CardTitle>
                    <CardDescription>
                        Un email de vérification a été envoyé à {email}. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertDescription>
                            Si vous ne recevez pas l'email, vérifiez votre dossier spam ou{" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto"
                                onClick={async () => {
                                    try {
                                        await auth.createAccount(email, password, name);
                                        setError("");
                                    } catch (err: any) {
                                        setError(err.message || "Erreur lors de l'envoi de l'email de vérification");
                                    }
                                }}
                            >
                                cliquez ici pour renvoyer l'email
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push("/sign-in")}
                    >
                        Retour à la connexion
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{mode === "login" ? "Connexion" : "Inscription"}</CardTitle>
                <CardDescription>
                    {mode === "login"
                        ? "Connectez-vous à votre compte"
                        : "Créez un nouveau compte"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {mode === "register" && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Votre nom"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="votre@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading
                            ? "Chargement..."
                            : mode === "login"
                            ? "Se connecter"
                            : "S'inscrire"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 