"use client"

import { useState } from "react"
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
import { generateEventCode, createEvent } from "@/utils/event"
import { supabase } from "@/lib/supabase"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Utilisateur non connecté')
      }

      console.log('User data:', user)

      const eventData = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        maxGuests: formData.maxGuests ? parseInt(formData.maxGuests) : undefined,
        type: formData.type,
        userId: user.id,
      }

      console.log('Creating event with data:', eventData)

      const event = await createEvent(eventData)
      console.log('Event created:', event)

      setEventData({
        id: event.id,
        title: event.name,
        date: formatDate(event.date),
        location: event.location,
        description: event.description,
        code: event.code,
      })

      setShowSummary(true)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Erreur lors de la création de l\'événement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/mes-evenements" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à mes événements
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Créer un événement</CardTitle>
            <CardDescription>
              Partagez votre événement avec la communauté
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Titre de l'événement</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Anniversaire surprise de Marie"
                  required
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création en cours..." : "Créer l'événement"}
              </Button>
            </CardFooter>
          </form>
        </Card>
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
