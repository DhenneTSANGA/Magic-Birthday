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
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    fetch('/api/communaute-events')
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  // Charger les commentaires quand un événement est sélectionné
  useEffect(() => {
    if (!selectedEvent) return setComments([])
    setCommentsLoading(true)
    fetch(`/api/events/${selectedEvent.code}/comments`)
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false))
  }, [selectedEvent])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedEvent) return

    setSendingMessage(true)
    try {
      const response = await fetch(`/api/events/${selectedEvent.code}/comments`, {
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
      setComments(prev => [newComment, ...prev])
      setNewMessage("")
      toast.success('Message envoyé avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible d\'envoyer le message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  if (!events.length) return <div className="text-center py-12 text-muted-foreground">Aucun événement public pour le moment.</div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.code} className={`flex flex-col cursor-pointer transition-shadow ${selectedEvent?.code === event.code ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedEvent(event)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.createdBy.avatar || undefined} alt={event.createdBy.firstName} />
                  <AvatarFallback>
                    {event.createdBy.firstName?.[0]}{event.createdBy.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="line-clamp-1 text-base">{event.name}</CardTitle>
                  <CardDescription className="text-xs">par {event.createdBy.firstName} {event.createdBy.lastName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>👥 {event._count.invites} invités</span>
                <span>💬 {event._count.comments} commentaires</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={selectedEvent?.code === event.code ? 'default' : 'outline'}>
                <span>Sélectionner</span>
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
              {selectedEvent 
                ? `Discussions autour de "${selectedEvent.title}"`
                : "Sélectionnez un événement pour voir les discussions associées"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center text-muted-foreground py-8">Chargement des commentaires...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Aucun commentaire pour cet événement.</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.name} />
                        <AvatarFallback>
                          {comment.author.name?.split(' ').map((n: string) => n[0]).join('')}
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
    </div>
  )
}
