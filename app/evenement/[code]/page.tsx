import { notFound } from 'next/navigation'
import { getEventByCode } from '@/utils/event'
import { formatDate } from '@/utils/event'
import { Calendar, Clock, MapPin, Users, Activity, MessageSquare, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { EventShareCard } from '@/components/EventShareCard'
import { Textarea } from '@/components/ui/textarea'
import { CommentForm } from '@/components/CommentForm'

interface EventPageProps {
  params: {
    code: string
  }
}

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    const event = await getEventByCode(params.code)
    return {
      title: `${event.name} | Magic Birthday`,
      description: event.description || `Découvrez l'événement ${event.name} sur Magic Birthday`,
      openGraph: {
        title: event.name,
        description: event.description,
        type: 'website',
      },
    }
  } catch (error) {
    return {
      title: 'Événement non trouvé | Magic Birthday',
      description: 'L\'événement que vous recherchez n\'existe pas ou a été supprimé.',
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEventByCode(params.code);
  
  if (!event) {
    notFound();
  }

  console.log('Event data:', JSON.stringify(event, null, 2));
  console.log('Creator data:', JSON.stringify(event.createdBy, null, 2));
  console.log('Creator name:', `${event.createdBy.firstName} ${event.createdBy.lastName}`);
  console.log('Creator email:', event.createdBy.email);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête de l'événement */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary">{event.name}</h1>
            <p className="mt-2 text-gray-600">{event.description}</p>
          </div>
          <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {event.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Heure</p>
                <p className="text-sm text-gray-600">{event.time}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Lieu</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Invités</p>
                <p className="text-sm text-gray-600">
                  {event.invites.length} / {event.maxGuests || '∞'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activités */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Activités prévues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.activities.length > 0 ? (
                <div className="space-y-4">
                  {event.activities.map((activity) => (
                    <div key={activity.id} className="rounded-lg border p-4">
                      <h3 className="font-medium">{activity.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>{activity.duration} minutes</span>
                        <span>•</span>
                        <span>
                          {new Date(activity.startTime).toLocaleTimeString()} -{' '}
                          {new Date(activity.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucune activité prévue pour le moment.</p>
              )}
            </CardContent>
          </Card>

          {/* Commentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Commentaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.comments.length > 0 ? (
                <div className="space-y-4">
                  {event.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={comment.author.avatar || undefined} />
                        <AvatarFallback>
                          {comment.author.firstName[0]}
                          {comment.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {comment.author.firstName} {comment.author.lastName}
                          </p>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucun commentaire pour le moment.</p>
              )}

              {/* Formulaire de commentaire */}
              <CommentForm eventCode={event.code} />
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-8">
          {/* Organisateur */}
          <Card>
            <CardHeader>
              <CardTitle>Organisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {event.createdBy.firstName} {event.createdBy.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.createdBy.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Liste des invités */}
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                {event.invites.length} invité{event.invites.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={invite.user.avatar || undefined} />
                        <AvatarFallback>
                          {invite.user.firstName[0]}
                          {invite.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {invite.user.firstName} {invite.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{invite.user.email}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        invite.status === 'ACCEPTED'
                          ? 'default'
                          : invite.status === 'DECLINED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {invite.status === 'ACCEPTED'
                        ? 'Accepté'
                        : invite.status === 'DECLINED'
                        ? 'Refusé'
                        : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code et lien de partage */}
          <EventShareCard event={event} />
        </div>
      </div>
    </div>
  )
} 