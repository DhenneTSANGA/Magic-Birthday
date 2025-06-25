"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, PartyPopper, Plus, Send, MessageSquare, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Event {
  id: string
  code: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxGuests: number
  type: string
  status: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    avatar: string | null
  }
  comments: Comment[]
  stats: {
    inviteCount: number
    commentCount: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

export default function CommunautePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  // Récupérer les événements
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des événements')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Erreur:', error)
        toast.error('Impossible de charger les événements')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedEvent) return

    setSendingMessage(true)
    try {
      const selectedEventData = events.find(e => e.id === selectedEvent)
      if (!selectedEventData) return

      const response = await fetch(`/api/events/${selectedEventData.code}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      const newComment = await response.json()
      
      // Mettre à jour les événements avec le nouveau commentaire
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === selectedEvent 
            ? {
                ...event,
                comments: [newComment, ...event.comments],
                stats: {
                  ...event.stats,
                  commentCount: event.stats.commentCount + 1
                }
              }
            : event
        )
      )

      setNewMessage("")
      toast.success('Message envoyé avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible d\'envoyer le message')
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredComments = selectedEvent
    ? events.find(e => e.id === selectedEvent)?.comments || []
    : []

  const selectedEventData = selectedEvent 
    ? events.find(e => e.id === selectedEvent)
    : null

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Section Événements */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Communauté</h1>
          <p className="text-muted-foreground mt-2">
            Découvrez et participez aux événements d'anniversaire de la communauté
          </p>
        </div>
        <Button asChild>
          <Link href="/creer-evenement" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer un événement
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PartyPopper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun événement public</h3>
            <p className="text-muted-foreground mb-4">
              Il n'y a pas encore d'événements publics dans la communauté.
            </p>
            <Button asChild>
              <Link href="/creer-evenement">
                Créer le premier événement
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedEvent === event.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedEvent(event.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{event.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {event.stats.commentCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <PartyPopper className="mr-2 h-4 w-4" />
                      {event.maxGuests} invités max
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.stats.inviteCount}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Par {event.createdBy.name}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/evenement/${event.code}`}>
                      Voir les détails
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Section Discussion */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Espace de discussion</CardTitle>
                <CardDescription>
                  {selectedEventData 
                    ? `Discussions autour de "${selectedEventData.title}"`
                    : "Sélectionnez un événement pour voir les discussions associées"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-4">
                    {filteredComments.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        {selectedEventData 
                          ? "Aucun commentaire pour cet événement. Soyez le premier à commenter !"
                          : "Sélectionnez un événement pour voir les commentaires"
                        }
                      </div>
                    ) : (
                      filteredComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.name} />
                            <AvatarFallback>
                              {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{comment.author.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    placeholder={selectedEvent ? "Écrivez votre message..." : "Sélectionnez un événement pour discuter"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={!selectedEvent || sendingMessage}
                  />
                  <Button type="submit" disabled={!selectedEvent || !newMessage.trim() || sendingMessage}>
                    {sendingMessage ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
