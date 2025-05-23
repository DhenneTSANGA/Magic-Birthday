import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Link from "next/link"
import { PartyPopper, Calendar, Gift, MessageCircle } from "lucide-react"
import { ThemeSelector } from "@/components/theme-selector"
import { UserButton } from "@/components/UserButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MAGIC BIRTHDAY - Organisez des événements mémorables",
  description:
    "Plateforme dédiée à l'organisation d'anniversaires. Créez, personnalisez et partagez vos événements d'anniversaire en quelques clics.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation */}
          <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-2">
                <PartyPopper className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">MAGIC BIRTHDAY</span>
              </div>
              <nav className="hidden gap-6 md:flex">
                <Link href="/" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                  Accueil
                </Link>
                <Link
                  href="/creer-evenement"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-primary"
                >
                  Créer un événement
                </Link>
                <Link
                  href="/mes-evenements"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-primary"
                >
                  Mes événements
                </Link>
                <Link href="/communaute" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary">
                  Communauté
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <ThemeSelector />
                <UserButton />
              </div>
            </div>
          </header>

          {/* Mobile Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
            <div className="flex items-center justify-around">
              <Link href="/" className="flex flex-1 flex-col items-center py-2">
                <PartyPopper className="h-5 w-5 text-primary" />
                <span className="text-xs text-primary">Accueil</span>
              </Link>
              <Link href="/creer-evenement" className="flex flex-1 flex-col items-center py-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Créer</span>
              </Link>
              <Link href="/mes-evenements" className="flex flex-1 flex-col items-center py-2">
                <Gift className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Mes événements</span>
              </Link>
              <Link href="/communaute" className="flex flex-1 flex-col items-center py-2">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <span className="text-xs text-gray-600">Communauté</span>
              </Link>
            </div>
          </div>

          {/* Contenu de la page */}
          {children}

          {/* Footer */}
          <footer className="bg-gradient-to-br from-slate-900 to-primary-foreground py-12 text-white">
            <div className="container px-4 md:px-6">
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="h-6 w-6 text-primary/80" />
                    <span className="text-xl font-bold text-white">MAGIC BIRTHDAY</span>
                  </div>
                  <p className="text-sm text-white/70">
                    La plateforme qui rend l&apos;organisation d&apos;anniversaires accessible et agréable.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-primary/80">Liens rapides</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li>
                      <Link href="/" className="hover:text-white">
                        Accueil
                      </Link>
                    </li>
                    <li>
                      <Link href="/creer-evenement" className="hover:text-white">
                        Créer un événement
                      </Link>
                    </li>
                    <li>
                      <Link href="/communaute" className="hover:text-white">
                        Communauté
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-primary/80"> Ressources</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li>
                      <Link href="#" className="hover:text-white">
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-white">
                        Guides
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-white">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-white">
                        Support
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-primary/80"> Légal</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li>
                      <Link href="#" className="hover:text-white">
                        Conditions d&apos;utilisation
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-white">
                        Politique de confidentialité
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:text-white">
                        Mentions légales
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/50">
                <p> © 2025 MAGIC BIRTHDAY. Tous droits réservés.</p>
              </div>
            </div>
          </footer>

          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
