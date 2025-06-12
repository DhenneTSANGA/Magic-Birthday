import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Link from "next/link"
import { PartyPopper, Calendar, Gift, MessageCircle } from "lucide-react"
import { ThemeSelector } from "@/components/theme-selector"
import { UserButton } from "@/components/UserButton"
import Image from "next/image"
import { NotificationButton } from "@/components/NotificationButton"
import { AuthProvider } from "@/context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MAGIC BIRTHDAY - Organisez des événements mémorables",
  description:
    "Plateforme dédiée à l'organisation d'anniversaires. Créez, personnalisez et partagez vos événements d'anniversaire en quelques clics."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
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
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/logo anniv.png"
                      alt="Logo Magic Birthday"
                      width={36}
                      height={36}
                      className="h-8 w-8 md:h-10 md:w-10"
                    />
                    <span className="text-lg md:text-xl font-bold text-primary">MAGIC BIRTHDAY</span>
                  </Link>
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
                  <Link
                    href="/communaute"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-primary"
                  >
                    Communauté
                  </Link>
                </nav>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="block">
                    <ThemeSelector />
                  </div>
                  <NotificationButton />
                  <UserButton />
                </div>
              </div>
            </header>

            {/* Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
              <div className="grid grid-cols-4 items-center">
                <Link href="/" className="flex flex-col items-center py-2">
                  <PartyPopper className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Accueil</span>
                </Link>
                <Link href="/creer-evenement" className="flex flex-col items-center py-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Créer</span>
                </Link>
                <Link href="/mes-evenements" className="flex flex-col items-center py-2">
                  <Gift className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Événements</span>
                </Link>
                <Link href="/communaute" className="flex flex-col items-center py-2">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-xs text-gray-600">Communauté</span>
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>

            {/* Footer */}
            <footer className="border-t bg-white py-6 md:py-0">
              <div className="container px-4 md:px-6">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Navigation principale */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Navigation</h3>
                    <ul className="space-y-3">
                      {[
                        { href: "/", label: "Accueil" },
                        { href: "/creer-evenement", label: "Créer un événement" },
                        { href: "/mes-evenements", label: "Mes événements" },
                        { href: "/communaute", label: "Communauté" },
                      ].map((item, index) => (
                        <li key={`nav-${index}`}>
                          <Link
                            href={item.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ressources */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Ressources</h3>
                    <ul className="space-y-3">
                      {[
                        { href: "#", label: "Centre d'aide" },
                        { href: "#", label: "Guide d'utilisation" },
                        { href: "#", label: "Blog" },
                        { href: "#", label: "FAQ" },
                      ].map((item, index) => (
                        <li key={`resources-${index}`}>
                          <Link
                            href={item.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Légal */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Légal</h3>
                    <ul className="space-y-3">
                      {[
                        { href: "#", label: "Conditions d'utilisation" },
                        { href: "#", label: "Politique de confidentialité" },
                        { href: "#", label: "Mentions légales" },
                        { href: "#", label: "Cookies" },
                      ].map((item, index) => (
                        <li key={`legal-${index}`}>
                          <Link
                            href={item.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</h3>
                    <ul className="space-y-3">
                      {[
                        { href: "#", label: "Support" },
                        { href: "#", label: "Commercial" },
                        { href: "#", label: "Presse" },
                        { href: "#", label: "Carrières" },
                      ].map((item, index) => (
                        <li key={`contact-${index}`}>
                          <Link
                            href={item.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t pt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    © 2024 MAGIC BIRTHDAY. Tous droits réservés.
                  </p>
                </div>
              </div>
            </footer>

            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
