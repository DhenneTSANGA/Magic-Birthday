"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { EventSummaryDialog } from "@/components/EventSummaryDialog"
import { generateEventCode, formatDate } from "@/utils/event"
import { supabase } from "@/utils/supabase"

export default function CreerEvenementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [eventData, setEventData] = useState<{
    id: string;
    title: string;
    date: string;
    location: string;
    description?: string;
    code: string;
  } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxGuests: "",
    type: "PUBLIC" as const,
  })

  // Vérifier l'authentification au chargement de la page
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        toast.error('Veuillez vous connecter pour créer un événement')
        router.push('/sign-in?callbackUrl=/creer-evenement')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Utilisateur non connecté')
      }

      // Formater la date correctement
      const formattedDate = new Date(formData.date + 'T' + formData.time)
      console.log('Date avant envoi:', formattedDate)
      console.log('Date ISO:', formattedDate.toISOString())
      
      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formattedDate.toISOString(), // Envoyer la date au format ISO
        time: formData.time,
        location: formData.location,
        maxGuests: parseInt(formData.maxGuests) || 0,
        type: formData.type,
        userId: user.id, // Ajouter l'ID de l'utilisateur
      }

      // Appeler l'API pour créer l'événement
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création de l\'événement')
      }

      const event = await response.json()
      
      console.log('Date reçue de l\'API:', event.date)
      console.log('Event complet:', event)
      
      toast.success('Événement créé avec succès !')
      
      // Formater la date pour l'affichage en utilisant la date et l'heure d'origine
      const displayDate = new Date(`${formData.date}T${formData.time}`)
      console.log('Display date:', displayDate)
      
      setEventData({
        id: event.id,
        title: event.name,
        date: displayDate.toISOString(),
        location: event.location,
        description: event.description || undefined,
        code: event.code,
      })

      setShowSummary(true)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de l\'événement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Fermer automatiquement le calendrier après sélection d'une date
    if (name === 'date' && value) {
      // Utiliser setTimeout pour permettre à l'événement de se terminer
      setTimeout(() => {
        e.target.blur()
      }, 100)
    }
    
    // Fermer automatiquement le sélecteur d'heure après sélection d'une heure
    if (name === 'time' && value) {
      // Utiliser un délai plus long pour permettre la sélection de l'heure ET des minutes
      setTimeout(() => {
        e.target.blur()
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/mes-evenements" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 sm:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Retour à mes événements</span>
            <span className="sm:hidden">Retour</span>
          </Link>

          <Card className="w-full">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Créer un événement</CardTitle>
              <CardDescription className="text-sm">
                Partagez votre événement avec la communauté
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Titre de l'événement</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Anniversaire surprise de Marie"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez votre événement..."
                    required
                    className="w-full min-h-[100px] sm:min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      <Calendar className="inline-block mr-2 h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">
                      <Clock className="inline-block mr-2 h-4 w-4" />
                      Heure
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="inline-block mr-2 h-4 w-4" />
                    Lieu
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Adresse de l'événement"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxGuests">
                    <PartyPopper className="inline-block mr-2 h-4 w-4" />
                    Nombre maximum d'invités
                  </Label>
                  <Input
                    id="maxGuests"
                    name="maxGuests"
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    placeholder="Ex: 20"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type d'événement</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Privé</option>
                  </select>
                </div>
              </CardContent>

              <CardFooter className="px-4 sm:px-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Création en cours..." : "Créer l'événement"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {eventData && (
        <EventSummaryDialog
          isOpen={showSummary}
          onClose={() => {
            setShowSummary(false)
            // Rediriger après la fermeture du dialogue
            router.push('/mes-evenements?refresh=true')
          }}
          eventData={eventData}
        />
      )}
    </div>
  )
}
