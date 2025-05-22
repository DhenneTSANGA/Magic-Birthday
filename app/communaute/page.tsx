"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, PartyPopper, Plus, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Données statiques d'exemple pour les événements
const events = [
  {
    id: 1,
    title: "Anniversaire surprise de Marie",
    description: "Venez célébrer les 30 ans de Marie dans une ambiance festive !",
    date: "2024-04-15",
    time: "19:00",
    location: "123 Rue de la Fête, Paris",
    maxGuests: 30,
  },
  {
    id: 2,
    title: "Soirée d'anniversaire de Thomas",
    description: "Une soirée déguisée pour les 25 ans de Thomas. Thème : années 80 !",
    date: "2024-04-20",
    time: "20:00",
    location: "45 Avenue des Festivités, Lyon",
    maxGuests: 50,
  },
  {
    id: 3,
    title: "Anniversaire de Sophie",
    description: "Célébration des 40 ans de Sophie avec un dîner gastronomique.",
    date: "2024-04-25",
    time: "19:30",
    location: "78 Boulevard des Célébrations, Marseille",
    maxGuests: 25,
  },
]

// Données statiques d'exemple pour les messages
const initialMessages = [
  {
    id: 1,
    user: {
      name: "Marie D.",
      avatar: "/avatars/marie.jpg",
      initials: "MD"
    },
    content: "Je suis super excitée pour mon anniversaire surprise ! Qui a des idées de déco ? 🎉",
    timestamp: "2024-03-20T10:30:00",
    eventId: 1
  },
  {
    id: 2,
    user: {
      name: "Thomas L.",
      avatar: "/avatars/thomas.jpg",
      initials: "TL"
    },
    content: "Pour la soirée années 80, j'ai trouvé un super DJ ! Il a une collection impressionnante de vinyles.",
    timestamp: "2024-03-20T11:15:00",
    eventId: 2
  },
  {
    id: 3,
    user: {
      name: "Sophie M.",
      avatar: "/avatars/sophie.jpg",
      initials: "SM"
    },
    content: "Pour mon anniversaire, j'ai réservé un traiteur spécialisé en cuisine méditerranéenne. Vous allez adorer !",
    timestamp: "2024-03-20T14:45:00",
    eventId: 3
  },
  {
    id: 4,
    user: {
      name: "Jean P.",
      avatar: "/avatars/jean.jpg",
      initials: "JP"
    },
    content: "Je peux apporter des ballons et des guirlandes pour la déco de l'anniversaire de Marie !",
    timestamp: "2024-03-20T15:20:00",
    eventId: 1
  }
]

export default function CommunautePage() {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedEvent) return

    const message = {
      id: messages.length + 1,
      user: {
        name: "Vous",
        avatar: "/avatars/user.jpg",
        initials: "VO"
      },
      content: newMessage,
      timestamp: new Date().toISOString(),
      eventId: selectedEvent
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const filteredMessages = selectedEvent
    ? messages.filter(msg => msg.eventId === selectedEvent)
    : messages

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
              <CardTitle className="line-clamp-1">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">{event.description}</CardDescription>
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
              <div className="flex items-center text-sm text-muted-foreground">
                <PartyPopper className="mr-2 h-4 w-4" />
                {event.maxGuests} invités maximum
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir les détails
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
                ? `Discussions autour de "${events.find(e => e.id === selectedEvent)?.title}"`
                : "Sélectionnez un événement pour voir les discussions associées"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={message.user.avatar} alt={message.user.name} />
                      <AvatarFallback>{message.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{message.user.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder={selectedEvent ? "Écrivez votre message..." : "Sélectionnez un événement pour discuter"}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!selectedEvent}
              />
              <Button type="submit" disabled={!selectedEvent || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
