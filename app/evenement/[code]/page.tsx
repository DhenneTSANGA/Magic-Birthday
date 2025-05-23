import { notFound } from 'next/navigation'
import { getEventByCode } from '@/utils/event'
import { formatDate } from '@/utils/event'
import { Calendar, Clock, MapPin, Users, Activity, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface EventPageProps {
  params: {
    code: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    const event = await getEventByCode(params.code)

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
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.createdBy.avatar || undefined} />
                    <AvatarFallback>
                      {event.createdBy.firstName[0]}
                      {event.createdBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {event.createdBy.firstName} {event.createdBy.lastName}
                    </p>
                    <p className="text-sm text-gray-600">Organisateur</p>
                  </div>
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
                          <p className="text-sm font-medium">
                            {invite.user.firstName} {invite.user.lastName}
                          </p>
                          <Badge
                            variant={
                              invite.status === 'ACCEPTED'
                                ? 'default'
                                : invite.status === 'DECLINED'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="mt-1"
                          >
                            {invite.status === 'ACCEPTED'
                              ? 'Accepté'
                              : invite.status === 'DECLINED'
                              ? 'Refusé'
                              : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  Partager l'événement
                </Button>
                <Button className="w-full" variant="outline">
                  Ajouter à mon calendrier
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Erreur lors du chargement de l\'événement:', error)
    notFound()
  }
} 