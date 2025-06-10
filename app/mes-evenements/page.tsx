"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { formatDate } from "@/utils/event"
import { supabase } from "@/lib/supabase"
import { EventEditDialog } from "@/components/EventEditDialog"
import { cn } from "@/lib/utils"

// Définition des couleurs pour les événements
const eventColors = [
  "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
  "bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800",
  "bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-800",
  "bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800",
  "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800",
  "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800",
]

// Fonction pour obtenir une couleur basée sur le code de l'événement
function getEventColor(code: string) {
  const index = Math.abs(code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % eventColors.length
  return eventColors[index]
}

export default function MesEvenementsPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const fetchEvents = async () => {
    try {
      console.log('Début de la récupération des événements...')
      const response = await fetch('/api/events', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      console.log('Réponse de l\'API:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erreur API:', errorData)
        throw new Error(errorData.error || 'Erreur lors de la récupération des événements')
      }

      const data = await response.json()
      console.log('Événements récupérés:', data)
      setEvents(data)
    } catch (error) {
      console.error('Erreur détaillée:', error)
      toast.error('Erreur lors de la récupération des événements')
      setEvents([]) // Réinitialiser les événements en cas d'erreur
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkAuthAndFetchEvents = async () => {
      try {
        console.log('Vérification de l\'authentification...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Erreur d\'authentification:', authError)
          throw authError
        }

        if (!user) {
          console.log('Utilisateur non connecté')
          toast.error('Veuillez vous connecter pour voir vos événements')
          router.push('/sign-in?callbackUrl=/mes-evenements')
          return
        }

        console.log('Utilisateur authentifié:', user.id)
        await fetchEvents()
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        toast.error('Erreur d\'authentification')
        setIsLoading(false)
      }
    }

    checkAuthAndFetchEvents()
  }, [router])

  const handleEdit = (event) => {
    setSelectedEvent(event)
    setShowEditDialog(true)
  }

  const handleDelete = async (code: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${code}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression de l\'événement')
      }

      toast.success('Événement supprimé avec succès')
      fetchEvents() // Rafraîchir la liste
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'événement')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Chargement de vos événements...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes événements</h1>
        <Link href="/creer-evenement">
          <Button>Créer un événement</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card 
            key={event.code}
            className={cn(
              "transition-colors duration-300",
              getEventColor(event.code)
            )}
          >
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription className="dark:text-gray-300">
                {formatDate(event.date)} à {event.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 dark:text-gray-300">
                <span className="font-medium">Lieu :</span> {event.location}
              </p>
              <p className="text-sm mb-2 dark:text-gray-300">
                <span className="font-medium">Créé par :</span>{' '}
                {event.createdBy.firstName} {event.createdBy.lastName}
              </p>
              <p className="text-sm dark:text-gray-300">{event.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/evenement/${event.code}`)}
                className="bg-white/80 dark:bg-gray-800/80"
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(event)}
                className="bg-white/80 dark:bg-gray-800/80"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(event.code)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedEvent && (
        <EventEditDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setSelectedEvent(null)
          }}
          eventData={selectedEvent}
          onEventUpdated={fetchEvents}
        />
      )}

      {events.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vous n'avez pas encore créé d'événement.</p>
          <Link href="/creer-evenement" className="mt-4 inline-block">
            <Button>Créer mon premier événement</Button>
          </Link>
        </div>
      )}
    </div>
  )
} 