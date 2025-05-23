import { useState } from 'react'
import { toast } from 'sonner'
import { Event, CreateEventData, UpdateEventData } from '@/utils/event'

export function useEvents() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Récupérer tous les événements
  const fetchEvents = async () => {
    try {
      console.log('useEvents - Début de la récupération des événements')
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/events')
      console.log('useEvents - Réponse du serveur:', response.status)
      
      const data = await response.json()
      console.log('useEvents - Données reçues:', data)
      
      if (!response.ok) {
        console.error('useEvents - Erreur serveur:', data)
        throw new Error(data.error || 'Erreur lors de la récupération des événements')
      }
      
      if (!Array.isArray(data)) {
        console.error('useEvents - Données invalides:', data)
        throw new Error('Format de données invalide')
      }

      setEvents(data)
      console.log('useEvents - Événements mis à jour:', data.length)
    } catch (error) {
      console.error('useEvents - Erreur détaillée:', error)
      const message = error instanceof Error ? error.message : 'Impossible de récupérer les événements'
      setError(message)
      toast.error(message)
      setEvents([])
    } finally {
      setLoading(false)
      console.log('useEvents - État final:', { loading: false, eventsCount: events.length, error: null })
    }
  }

  // Récupérer un événement spécifique
  const fetchEvent = async (code: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/events/${code}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Événement non trouvé')
      }
      
      setCurrentEvent(data)
      return data
    } catch (error) {
      console.error('Erreur:', error)
      const message = error instanceof Error ? error.message : 'Impossible de récupérer l\'événement'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Créer un événement
  const createEvent = async (data: CreateEventData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors de la création de l\'événement')
      }
      
      setEvents((prev) => [...prev, responseData])
      toast.success('Événement créé avec succès')
      return responseData
    } catch (error) {
      console.error('Erreur:', error)
      const message = error instanceof Error ? error.message : 'Impossible de créer l\'événement'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour un événement
  const updateEvent = async (code: string, data: UpdateEventData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/events/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erreur lors de la mise à jour de l\'événement')
      }
      
      setEvents((prev) => prev.map((event) => (event.code === code ? responseData : event)))
      setCurrentEvent(responseData)
      toast.success('Événement mis à jour avec succès')
      return responseData
    } catch (error) {
      console.error('Erreur:', error)
      const message = error instanceof Error ? error.message : 'Impossible de mettre à jour l\'événement'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un événement
  const deleteEvent = async (code: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/events/${code}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Erreur lors de la suppression de l\'événement')
      }
      
      setEvents((prev) => prev.filter((event) => event.code !== code))
      setCurrentEvent(null)
      toast.success('Événement supprimé avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      const message = error instanceof Error ? error.message : 'Impossible de supprimer l\'événement'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    events,
    currentEvent,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  }
} 