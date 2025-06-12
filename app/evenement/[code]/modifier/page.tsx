"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase"

export default function ModifierEvenementPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxGuests: "",
    type: "PUBLIC" as const,
  })

  // Charger les données de l'événement
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.code}`)
        if (!response.ok) {
          throw new Error('Événement non trouvé')
        }
        const event = await response.json()
        
        // Formater la date pour le formulaire
        const date = new Date(event.date)
        const formattedDate = date.toISOString().split('T')[0]
        
        setFormData({
          name: event.name,
          description: event.description || "",
          date: formattedDate,
          time: event.time,
          location: event.location,
          maxGuests: event.maxGuests.toString(),
          type: event.type,
        })
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Erreur lors du chargement de l\'événement')
        router.push('/mes-evenements')
      }
    }

    fetchEvent()
  }, [params.code, router])

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        toast.error('Veuillez vous connecter pour modifier un événement')
        router.push('/sign-in?callbackUrl=/evenement/' + params.code + '/modifier')
      }
    }
    checkAuth()
  }, [params.code, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Formater la date
      const formattedDate = new Date(formData.date + 'T' + formData.time).toISOString()

      const response = await fetch(`/api/events/${params.code}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: formattedDate,
          maxGuests: parseInt(formData.maxGuests),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour de l\'événement')
      }

      toast.success('Événement mis à jour avec succès')
      router.push(`/evenement/${params.code}`)
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'événement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${params.code}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression de l\'événement')
      }

      toast.success('Événement supprimé avec succès')
      router.push('/mes-evenements')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'événement')
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
        <Link href={`/evenement/${params.code}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'événement
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Modifier l'événement</CardTitle>
            <CardDescription>
              Modifiez les détails de votre événement
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

            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Mise à jour..." : "Mettre à jour l'événement"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Suppression..." : "Supprimer l'événement"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 