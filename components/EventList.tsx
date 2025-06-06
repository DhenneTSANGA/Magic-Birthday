"use client"

import { useEffect, useState } from 'react'
import { useEvents } from '@/hooks/useEvents'
import { Event } from '@/utils/event'
import { formatDate } from '@/utils/event'
import { Calendar, Clock, MapPin, Users, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type EventStatus = 'all' | 'draft' | 'published' | 'cancelled'
type EventType = 'all' | 'public' | 'private'

export function EventList() {
  const { loading, events, fetchEvents, error } = useEvents()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all')
  const [typeFilter, setTypeFilter] = useState<EventType>('all')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('EventList - useEffect - État initial:', { loading, eventsCount: events.length, error })
    
    // Recharger les événements si on arrive avec le paramètre refresh
    if (searchParams.get('refresh') === 'true') {
      console.log('EventList - Rechargement forcé des événements')
      fetchEvents()
      // Nettoyer l'URL
      router.replace('/mes-evenements', { scroll: false })
    } else {
      console.log('EventList - Chargement initial des événements')
      fetchEvents()
    }
  }, [fetchEvents, searchParams, router])

  useEffect(() => {
    console.log('EventList - Mise à jour des événements:', { 
      loading, 
      eventsCount: events.length, 
      error,
      filteredCount: filteredEvents.length 
    })
  }, [loading, events, error])

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || event.status.toLowerCase() === statusFilter
    const matchesType = typeFilter === 'all' || event.type.toLowerCase() === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erreur: {error}</p>
        <Button onClick={() => fetchEvents()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  if (loading && events.length === 0) {
    console.log('EventList - Affichage du chargement (aucun événement)')
    return (
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
  }

  console.log('EventList - Rendu final:', { 
    eventsCount: events.length, 
    filteredCount: filteredEvents.length,
    loading 
  })

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: EventStatus) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(value: EventType) => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Privé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des événements */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {events.length === 0 ? "Vous n'avez pas encore d'événements" : "Aucun événement ne correspond à vos critères"}
          </p>
          {events.length === 0 && (
            <Button asChild className="mt-4">
              <Link href="/creer-evenement">
                Créer votre premier événement
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  console.log('EventCard - Événement:', { id: event.id, code: event.code, name: event.name });
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{event.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {event.description}
            </CardDescription>
          </div>
          <Badge
            variant={
              event.status === 'PUBLISHED'
                ? 'default'
                : event.status === 'CANCELLED'
                ? 'destructive'
                : 'secondary'
            }
          >
            {event.status === 'PUBLISHED'
              ? 'Publié'
              : event.status === 'CANCELLED'
              ? 'Annulé'
              : 'Brouillon'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {event._count?.invites || 0} / {event.maxGuests || '∞'} invités
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          className="w-full"
          onClick={() => {
            console.log('EventCard - Clic sur le bouton de détails:', { code: event.code });
          }}
        >
          <Link href={`/evenement/${event.code}`}>
            Voir les détails
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 