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
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxGuests: "",
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const code = generateEventCode()
      const eventData = {
        name: formData.title,
        date: new Date(formData.date),
        time: formData.time,
        location: formData.location,
        description: formData.description,
        type: formData.type,
        maxGuests: parseInt(formData.maxGuests) || 0,
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création de l\'événement')
      }

      const event = await response.json()
      setEventData(event)
      toast.success('Événement créé avec succès !')
      setShowSummary(true)

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/mes-evenements')
      }, 2000)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                <Label htmlFor="title">Titre de l'événement</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
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
          onClose={() => setShowSummary(false)}
          eventData={eventData}
        />
      )}
    </div>
  )
}
