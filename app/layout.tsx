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
                <Image src="/logo anniv.png" alt="Logo Magic Birthday" width={36} height={36} className="h-16 w-16 object-contain" />
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
                <NotificationButton />
                <UserButton />
              </div>
            </div>
          </header>

          {/* Mobile Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
            <div className="flex items-center justify-around">
              <Link href="/" className="flex flex-1 flex-col items-center py-2">
                <Image src="/logo anniv.png" alt="Logo Magic Birthday" width={24} height={24} className="h-16 w-16 object-contain" />
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

          {/* Footer moderne */}
          <footer className="relative mt-20 border-t bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
            {/* Décoration du haut du footer */}
            <div className="absolute -top-12 left-0 right-0 h-24 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-950"></div>
              <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/20 to-transparent blur-2xl"></div>
            </div>

            <div className="container relative px-4 py-16 md:px-6">
              {/* Logo et description */}
              <div className="mb-12 flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex items-center gap-2 transition-transform hover:scale-105">
                  <Image src="/logo anniv.png" alt="Logo Magic Birthday" width={36} height={36} className="h-24 w-24 object-contain" />
                  <span className="text-2xl font-bold text-primary">MAGIC BIRTHDAY</span>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  Créez des moments inoubliables avec notre plateforme d&apos;organisation d&apos;anniversaires.
                  Simplifiez la planification et célébrez en grand style.
                </p>
              </div>

              {/* Navigation et liens */}
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
                    ].map((item) => (
                      <li key={item.href}>
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
                      { href: "/blog", label: "Blog" },
                      { href: "/guides", label: "Guides pratiques" },
                      { href: "/faq", label: "FAQ" },
                      { href: "/support", label: "Support" },
                    ].map((item) => (
                      <li key={item.href}>
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
                      { href: "/mentions-legales", label: "Mentions légales" },
                      { href: "/confidentialite", label: "Confidentialité" },
                      { href: "/cgv", label: "CGV" },
                      { href: "/cookies", label: "Politique des cookies" },
                    ].map((item) => (
                      <li key={item.href}>
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

                {/* Newsletter */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Restez informé</h3>
                  <p className="text-sm text-muted-foreground">
                    Inscrivez-vous à notre newsletter pour recevoir nos dernières actualités et conseils.
                  </p>
                  <form className="flex flex-col gap-2">
                    <input
                      type="email"
                      placeholder="Votre email"
                      className="rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      S&apos;inscrire
                    </button>
                  </form>
                </div>
              </div>

              {/* Séparateur */}
              <div className="my-12 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

              {/* Copyright et réseaux sociaux */}
              <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} MAGIC BIRTHDAY. Tous droits réservés.
                </p>
                <div className="flex gap-4">
                  {[
                    { href: "#", icon: "twitter", label: "Twitter" },
                    { href: "#", icon: "facebook", label: "Facebook" },
                    { href: "#", icon: "instagram", label: "Instagram" },
                  ].map((social) => (
                    <Link
                      key={social.icon}
                      href={social.href}
                      className="text-muted-foreground transition-colors hover:text-primary"
                      aria-label={social.label}
                    >
                      <span className="sr-only">{social.label}</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {social.icon === "twitter" && (
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        )}
                        {social.icon === "facebook" && (
                          <path
                            fillRule="evenodd"
                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                            clipRule="evenodd"
                          />
                        )}
                        {social.icon === "instagram" && (
                          <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </footer>

          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
