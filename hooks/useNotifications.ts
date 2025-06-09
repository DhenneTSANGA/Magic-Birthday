import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface Notification {
  id: string
  userId: string
  type: string
  message: string
  read: boolean
  eventId: string
  createdAt: Date
  updatedAt: Date
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      if (!user) {
        setNotifications([])
        return
      }

      const response = await fetch("/api/notifications")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }))
        throw new Error(errorData.error || "Erreur lors du chargement des notifications")
      }
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de charger les notifications")
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Marquer des notifications comme lues
  const markAsRead = async (notificationIds: string[]) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non authentifié")
      }

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }))
        throw new Error(errorData.error || "Erreur lors de la mise à jour des notifications")
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif.id)
            ? { ...notif, read: true }
            : notif
        )
      )
    } catch (error) {
      console.error("Erreur lors de la mise à jour des notifications:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de marquer les notifications comme lues")
    }
  }

  // Supprimer des notifications
  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non authentifié")
      }

      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }))
        throw new Error(errorData.error || "Erreur lors de la suppression des notifications")
      }

      setNotifications((prev) =>
        prev.filter((notif) => !notificationIds.includes(notif.id))
      )
    } catch (error) {
      console.error("Erreur lors de la suppression des notifications:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de supprimer les notifications")
    }
  }

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    loadNotifications()

    // S'abonner aux nouvelles notifications via Supabase Realtime
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [...prev, payload.new as Notification])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    deleteNotifications,
    refresh: loadNotifications,
  }
} 