"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Calendar, Check, Clock, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from "sonner"

interface Notification {
  id: string
  type: "invitation" | "update" | "comment"
  message: string
  read: boolean
  eventId: string | null
  createdAt: Date
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Récupérer les notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des notifications")
        }
        const data = await response.json()
        setNotifications(data.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt)
        })))
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Impossible de charger les notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la notification")
      }

      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ))
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de marquer la notification comme lue")
    }
  }

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des notifications")
      }

      setNotifications(notifications.map(notif => ({ ...notif, read: true })))
      toast.success("Toutes les notifications ont été marquées comme lues")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de marquer toutes les notifications comme lues")
    }
  }

  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la notification")
      }

      setNotifications(notifications.filter(notif => notif.id !== notificationId))
      toast.success("Notification supprimée")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de supprimer la notification")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invitation":
        return <Mail className="h-4 w-4" />
      case "update":
        return <Calendar className="h-4 w-4" />
      case "comment":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Toutes
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Pas de notifications</h3>
                <p className="text-muted-foreground">
                  Vous n'avez aucune notification pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-60" : ""}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-full p-2 ${
                    notification.type === 'invitation'
                      ? 'bg-blue-100 text-blue-600'
                      : notification.type === 'update'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{notification.message}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.eventId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/evenement/${notification.eventId}`)}
                      >
                        Voir
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marquer comme lu
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadCount === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Check className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Tout est lu !</h3>
                <p className="text-muted-foreground">
                  Vous n'avez aucune notification non lue.
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications
              .filter(n => !n.read)
              .map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`rounded-full p-2 ${
                      notification.type === 'invitation'
                        ? 'bg-blue-100 text-blue-600'
                        : notification.type === 'update'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.message}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                          locale: fr
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.eventId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/evenement/${notification.eventId}`)}
                        >
                          Voir
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marquer comme lu
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 