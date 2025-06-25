"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, MapPin, PartyPopper, Check, X, Clock as ClockIcon, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Invitation {
  id: string
  status: "PENDING" | "ACCEPTED" | "DECLINED"
  createdAt: string
  event: {
    id: string
    code: string
    name: string
    date: string
    time: string
    location: string
    description: string
    maxGuests: number
    createdBy: {
      firstName: string
      lastName: string
    }
  }
}

export default function InvitationsPage() {
  const router = useRouter()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/sign-in?callbackUrl=/invitations')
        return
      }
      fetchInvitations()
    }
    checkAuth()
  }, [router])

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invites')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des invitations')
      }
      const data = await response.json()
      setInvitations(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (invitationId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      setProcessingId(invitationId)
      const response = await fetch(`/api/invites/${invitationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'invitation')
      }

      // Mettre à jour l'état local
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status }
            : inv
        )
      )

      toast.success(
        status === "ACCEPTED" 
          ? "Invitation acceptée avec succès" 
          : "Invitation refusée"
      )
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de mettre à jour l\'invitation')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />En attente</Badge>
      case "ACCEPTED":
        return <Badge variant="default" className="flex items-center gap-1"><Check className="h-3 w-3" />Acceptée</Badge>
      case "DECLINED":
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" />Refusée</Badge>
      default:
        return null
    }
  }

  const pendingInvitations = invitations.filter(inv => inv.status === "PENDING")
  const acceptedInvitations = invitations.filter(inv => inv.status === "ACCEPTED")
  const declinedInvitations = invitations.filter(inv => inv.status === "DECLINED")

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold">Mes invitations</h1>
        <p className="text-muted-foreground mt-2">
          Gérez toutes vos invitations reçues
        </p>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PartyPopper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune invitation</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore reçu d'invitations.
            </p>
            <Button asChild>
              <Link href="/communaute">
                Découvrir les événements publics
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              En attente
              {pendingInvitations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Acceptées
              {acceptedInvitations.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {acceptedInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="declined">
              Refusées
              {declinedInvitations.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {declinedInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingInvitations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Check className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune invitation en attente</p>
                </CardContent>
              </Card>
            ) : (
              pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{invitation.event.name}</CardTitle>
                        <CardDescription>
                          Invitation de {invitation.event.createdBy.firstName} {invitation.event.createdBy.lastName}
                        </CardDescription>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{invitation.event.description}</p>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(invitation.event.date), "EEEE d MMMM yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.maxGuests} invités maximum</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleResponse(invitation.id, "ACCEPTED")}
                        disabled={processingId === invitation.id}
                        className="flex-1"
                      >
                        {processingId === invitation.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Accepter
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResponse(invitation.id, "DECLINED")}
                        disabled={processingId === invitation.id}
                        className="flex-1"
                      >
                        {processingId === invitation.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Refuser
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/evenement/${invitation.event.code}`}>
                          Voir détails
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedInvitations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune invitation acceptée</p>
                </CardContent>
              </Card>
            ) : (
              acceptedInvitations.map((invitation) => (
                <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{invitation.event.name}</CardTitle>
                        <CardDescription>
                          Invitation de {invitation.event.createdBy.firstName} {invitation.event.createdBy.lastName}
                        </CardDescription>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{invitation.event.description}</p>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(invitation.event.date), "EEEE d MMMM yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.location}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <Link href={`/evenement/${invitation.event.code}`}>
                          Voir l'événement
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="declined" className="space-y-4">
            {declinedInvitations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <X className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucune invitation refusée</p>
                </CardContent>
              </Card>
            ) : (
              declinedInvitations.map((invitation) => (
                <Card key={invitation.id} className="hover:shadow-md transition-shadow opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{invitation.event.name}</CardTitle>
                        <CardDescription>
                          Invitation de {invitation.event.createdBy.firstName} {invitation.event.createdBy.lastName}
                        </CardDescription>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{invitation.event.description}</p>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(invitation.event.date), "EEEE d MMMM yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.event.location}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <Link href={`/evenement/${invitation.event.code}`}>
                          Voir l'événement
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 