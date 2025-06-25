"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, MapPin, PartyPopper, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Event {
  id: string
  code: string
  name: string
  date: string
  time: string
  location: string
  description: string
  createdBy: {
    firstName: string
    lastName: string
  }
}

export default function InvitationPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/invitations/${params.code}`)
        if (!response.ok) {
          throw new Error("Événement non trouvé")
        }
        const data = await response.json()
        setEvent(data.event)
      } catch (error) {
        console.error("Error fetching event:", error)
        toast.error("Impossible de charger l'invitation")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.code])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push(`/sign-in?callbackUrl=/invitation/${params.code}`)
      }
    }
    checkAuth()
  }, [params.code, router])

  const handleAccept = async () => {
    try {
      setAccepting(true)
      const response = await fetch(`/api/invitations/${params.code}`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de l'acceptation de l'invitation")
      }

      toast.success("Invitation acceptée avec succès")
      router.push(`/evenement/${params.code}`)
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'acceptation de l'invitation")
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    try {
      setDeclining(true)
      const response = await fetch(`/api/invitations/${params.code}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'decline' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors du refus de l'invitation")
      }

      toast.success("Invitation refusée")
      router.push('/invitations')
    } catch (error) {
      console.error("Error declining invitation:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors du refus de l'invitation")
    } finally {
      setDeclining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-2 md:py-8 md:px-4">
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-2 md:py-8 md:px-4">
        <div className="w-full max-w-md mx-auto text-center">
          <PartyPopper className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">Invitation non trouvée</h2>
          <p className="mt-2 text-gray-600">
            Cette invitation n'existe pas ou a expiré.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 md:py-8 md:px-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="text-center">
            <Image
              src="/logo anniv.png"
              alt="Logo Magic Birthday"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <CardTitle className="text-xl md:text-2xl">Vous êtes invité(e) !</CardTitle>
            <CardDescription className="text-sm">
              {event.createdBy.firstName} {event.createdBy.lastName} vous invite à participer à un événement
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg bg-primary/5 p-4">
              <h3 className="text-lg md:text-xl font-semibold text-primary break-words">{event.name}</h3>
              <p className="mt-2 text-sm text-gray-600 break-words">{event.description}</p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">
                  {format(new Date(event.date), "EEEE d MMMM yyyy", { locale: fr })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{event.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm break-words">{event.location}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 p-4 md:p-6">
            <Button
              className="w-full"
              size="lg"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? "Acceptation en cours..." : "Accepter l'invitation"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleDecline}
              disabled={declining}
            >
              {declining ? "Refus en cours..." : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Refuser l'invitation
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 