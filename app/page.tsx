import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Gift, MessageCircle, PartyPopper, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-blue-50 data-[theme=green]:from-emerald-50 data-[theme=green]:to-green-50 data-[theme=purple]:from-violet-50 data-[theme=purple]:to-purple-50 data-[theme=orange]:from-amber-50 data-[theme=orange]:to-orange-50 data-[theme=red]:from-rose-50 data-[theme=red]:to-red-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 py-20 text-white">
        {/* Decorative elements */}
        <div className="absolute left-0 top-0 h-full w-full overflow-hidden opacity-20">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white"></div>
          <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-white"></div>
          <div className="absolute left-1/4 top-1/3 h-20 w-20 rounded-full bg-white"></div>
          <div className="absolute bottom-1/4 right-1/3 h-32 w-32 rounded-full bg-white"></div>
          <div className="absolute left-2/3 top-1/2 h-24 w-24 rounded-full bg-white"></div>
        </div>

        {/* Confetti pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-3 w-3 rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.5,
                transform: `scale(${Math.random() * 0.8 + 0.2})`,
              }}
            ></div>
          ))}
        </div>

        <div className="container relative px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Organisez des anniversaires inoubliables
                </h1>
                <p className="max-w-[600px] text-white/90 md:text-xl">
                  Créez, personnalisez et partagez vos événements d&apos;anniversaire en quelques clics. Invitez vos
                  amis et votre famille facilement.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row ">
                <Button className="bg-white text-primary hover:bg-white/90">
                  <Link href="/creer-evenement" passHref>
                    Créer un événement
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                  En savoir plus
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/anniv1.avif"
                  alt="Célébration d'anniversaire"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-white">
                  <h3 className="text-xl font-bold">Créez des moments mémorables</h3>
                  <p className="mt-2 text-sm text-white/90">Commencez dès maintenant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-blue-100 py-20 data-[theme=green]:from-emerald-100 data-[theme=green]:to-green-100 data-[theme=purple]:from-violet-100 data-[theme=purple]:to-purple-100 data-[theme=orange]:from-amber-100 data-[theme=orange]:to-orange-100 data-[theme=red]:from-rose-100 data-[theme=red]:to-red-100">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="confetti" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="8" r="2" fill="currentColor" className="text-primary/60" />
                <circle cx="12" cy="22" r="3" fill="currentColor" className="text-primary/60" />
                <circle cx="25" cy="5" r="2" fill="currentColor" className="text-primary/60" />
                <circle cx="30" cy="30" r="4" fill="currentColor" className="text-primary/60" />
                <circle cx="35" cy="15" r="2" fill="currentColor" className="text-primary/60" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#confetti)" />
          </svg>
        </div>

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl">
                Tout ce dont vous avez besoin
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Des outils simples et efficaces pour organiser des anniversaires parfaits
              </p>
            </div>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">Création d&apos;événements</h3>
              <p className="text-center text-gray-600">
                Formulaire simple pour ajouter un événement avec options de personnalisation
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">Gestion des invités</h3>
              <p className="text-center text-gray-600">
                Envoyez des invitations et suivez les confirmations facilement
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">Idées d&apos;activités</h3>
              <p className="text-center text-gray-600">Découvrez des idées d&apos;activités pour votre événement</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-xl border border-primary/20 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">Espace communautaire</h3>
              <p className="text-center text-gray-600">
                Échangez des conseils et astuces avec d&apos;autres organisateurs
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-slate-50 to-primary/10 p-8 text-center shadow-lg">
                <PartyPopper className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-bold text-primary">Prêt à créer des souvenirs inoubliables ?</h3>
                <p className="text-gray-600">
                  Rejoignez notre communauté et commencez à organiser des anniversaires mémorables dès aujourd&apos;hui.
                </p>
                <Link href="/creer-evenement" passHref>
                  <Button className="mt-2">Créer mon premier événement</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-blue-100 py-20 data-[theme=green]:from-emerald-100 data-[theme=green]:to-green-100 data-[theme=purple]:from-violet-100 data-[theme=purple]:to-purple-100 data-[theme=orange]:from-amber-100 data-[theme=orange]:to-orange-100 data-[theme=red]:from-rose-100 data-[theme=red]:to-red-100">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="stars" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M10 10L15 20L10 30L20 25L30 30L25 20L30 10L20 15L10 10Z"
                  fill="currentColor"
                  className="text-primary/60"
                />
                <path
                  d="M40 40L35 30L40 20L30 25L20 20L25 30L20 40L30 35L40 40Z"
                  fill="currentColor"
                  className="text-primary/60"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#stars)" />
          </svg>
        </div>

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl">
                Ce que disent nos utilisateurs
              </h2>
              <p className="max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Découvrez les expériences de ceux qui ont utilisé notre plateforme
              </p>
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-xl border border-primary/20 bg-white p-6 shadow-xl"
              >
                <div>
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={i < testimonial.rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-gray-600">{testimonial.text}</p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10"></div>
                  <div className="ml-3">
                    <p className="font-medium text-primary">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 py-20 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-16 w-16 rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.3 + 0.1,
                transform: `scale(${Math.random() * 1 + 0.5})`,
              }}
            ></div>
          ))}
        </div>

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Prêt à créer votre anniversaire ?
              </h2>
              <p className="mx-auto max-w-[700px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Rejoignez des milliers d&apos;utilisateurs qui organisent des événements mémorables
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button className="bg-white text-primary hover:bg-white/90">
                <Link href="/creer-evenement" passHref>
                  Créer un événement
                </Link>
              </Button>
              <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
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
