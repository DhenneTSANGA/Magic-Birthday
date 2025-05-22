import type React from "react"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
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
        <ThemeProvider attribute="data-theme" defaultTheme="blue" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
