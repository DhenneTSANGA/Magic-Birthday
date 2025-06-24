"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Gift, MessageCircle, PartyPopper, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary to-primary-600 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            {/* Texte */}
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl xl:text-6xl">
                  Organisez des anniversaires inoubliables
                </h1>
                <p className="text-base text-white/90 md:text-lg lg:text-xl">
                  Créez, personnalisez et partagez vos événements d&apos;anniversaire en quelques clics. Invitez vos
                  amis et votre famille facilement.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row justify-center lg:justify-start">
                <Link href="/creer-evenement" passHref>
                  <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                    Créer un événement
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto border-white/40 bg-white/10 text-white hover:bg-white/20">
                  En savoir plus
                </Button>
              </div>
            </div>
            {/* Image */}
            <div className="flex items-center justify-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-[350px] aspect-square overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/anniv1.avif"
                  alt="Célébration d'anniversaire"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white">
                  <h3 className="text-lg sm:text-xl font-bold">Créez des moments inoubliables</h3>
                  <p className="mt-1 text-sm text-white/90">Commencez dès maintenant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px]">
              <h2 className="text-2xl font-bold tracking-tighter text-primary sm:text-3xl md:text-4xl">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-sm md:text-base text-gray-600 lg:text-lg">
                Des outils simples et efficaces pour organiser des anniversaires parfaits
              </p>
            </div>
          </div>
          
          <div className="mx-auto mt-8 md:mt-16 grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Cards */}
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-4 md:p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary text-center">Création d&apos;événements</h3>
              <p className="text-sm text-center text-gray-600">
                Formulaire simple pour ajouter un événement avec options de personnalisation
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-4 md:p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary text-center">Gestion des invités</h3>
              <p className="text-sm text-center text-gray-600">
                Envoyez des invitations et suivez les confirmations facilement
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-4 md:p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <Gift className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary text-center">Idées d&apos;activités</h3>
              <p className="text-sm text-center text-gray-600">
                Découvrez des idées d&apos;activités pour votre événement
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-4 md:p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary text-center">Espace communautaire</h3>
              <p className="text-sm text-center text-gray-600">
                Échangez des conseils et astuces avec d&apos;autres organisateurs
              </p>
            </div>
            
            {/* CTA Card */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-slate-50 to-primary/10 p-6 md:p-8 text-center shadow-lg">
                <PartyPopper className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold text-primary">Prêt à créer des souvenirs inoubliables ?</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Rejoignez notre communauté et commencez à organiser des anniversaires mémorables dès aujourd&apos;hui.
                </p>
                <Link href="/creer-evenement" passHref>
                  <Button className="w-full sm:w-auto">Créer mon premier événement</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-br from-primary to-primary-600 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px]">
              <h2 className="text-2xl font-bold tracking-tighter text-white sm:text-3xl md:text-4xl">
                Prêt à créer votre anniversaire ?
              </h2>
              <p className="text-sm md:text-base text-white/80 lg:text-lg">
                Rejoignez des milliers d&apos;utilisateurs qui organisent des événements mémorables
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/creer-evenement" passHref>
                <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                  Créer un événement
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto border-white/40 bg-white/10 text-white hover:bg-white/20">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const testimonials = [
  {
    name: "Sophie L.",
    event: "Anniversaire 30 ans",
    rating: 5,
    text: "Grâce à cette plateforme, j'ai pu organiser mon anniversaire sans stress. Mes amis ont adoré et tout s'est déroulé parfaitement !",
  },
  {
    name: "Thomas M.",
    event: "Anniversaire enfant",
    rating: 5,
    text: "L'anniversaire de mon fils a été un succès total. Les suggestions d'activités ont été très utiles !",
  },
  {
    name: "Julie D.",
    event: "Anniversaire surprise",
    rating: 4,
    text: "J'ai pu organiser une fête surprise pour ma meilleure amie. La gestion des invitations a été très simple et efficace.",
  },
]
