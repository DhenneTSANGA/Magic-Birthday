import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { Suspense } from "react";

export default function SignUpPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Créer un compte
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Inscrivez-vous pour commencer
                    </p>
                </div>
                <Suspense fallback={<div>Chargement...</div>}>
                    <AuthForm mode="register" />
                </Suspense>
                <p className="px-8 text-center text-sm text-muted-foreground">
                    Déjà un compte ?{" "}
                    <Link
                        href="/sign-in"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
} 