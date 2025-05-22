import { useState } from 'react'
import { toast } from 'sonner'
import { Event, CreateEventData, UpdateEventData } from '@/utils/event'

export function useEvents() {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)

  // Récupérer tous les événements
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Erreur lors de la récupération des événements')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de récupérer les événements')
    } finally {
      setLoading(false)
    }
  }

  // Récupérer un événement spécifique
  const fetchEvent = async (code: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${code}`)
      if (!response.ok) throw new Error('Événement non trouvé')
      const data = await response.json()
      setCurrentEvent(data)
      return data
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de récupérer l\'événement')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Créer un événement
  const createEvent = async (data: CreateEventData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erreur lors de la création de l\'événement')
      const newEvent = await response.json()
      setEvents((prev) => [...prev, newEvent])
      toast.success('Événement créé avec succès')
      return newEvent
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de créer l\'événement')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour un événement
  const updateEvent = async (code: string, data: UpdateEventData) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'événement')
      const updatedEvent = await response.json()
      setEvents((prev) => prev.map((event) => (event.code === code ? updatedEvent : event)))
      setCurrentEvent(updatedEvent)
      toast.success('Événement mis à jour avec succès')
      return updatedEvent
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de mettre à jour l\'événement')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un événement
  const deleteEvent = async (code: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${code}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression de l\'événement')
      setEvents((prev) => prev.filter((event) => event.code !== code))
      setCurrentEvent(null)
      toast.success('Événement supprimé avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de supprimer l\'événement')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    events,
    currentEvent,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  }
} 