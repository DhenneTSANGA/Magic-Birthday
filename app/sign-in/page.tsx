import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { Suspense } from "react";

export default function SignInPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Bienvenue
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Connectez-vous à votre compte
                    </p>
                </div>
                <Suspense fallback={<div>Chargement...</div>}>
                    <AuthForm mode="login" />
                </Suspense>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    Pas encore de compte ?{" "}
                    <Link
                        href="/sign-up"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
} 