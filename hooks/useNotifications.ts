import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useAuth } from "@/context/AuthContext"
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

interface ApiError {
  error: string
  details?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadNotifications = async () => {
    if (!user) {
      console.log("[useNotifications] Pas d'utilisateur connecté")
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      console.log("[useNotifications] Chargement des notifications pour l'utilisateur:", user.id)
      setLoading(true)
      setError(null)

      const response = await fetch("/api/notifications")
      console.log("[useNotifications] Réponse du serveur:", {
        status: response.status,
        ok: response.ok
      })

      if (!response.ok) {
        const errorData = await response.json() as ApiError
        console.error("[useNotifications] Erreur serveur:", {
          status: response.status,
          error: errorData
        })
        throw new Error(
          errorData.details || errorData.error || "Erreur lors de la récupération des notifications"
        )
      }

      const data = await response.json()
      console.log("[useNotifications] Notifications reçues:", {
        count: data.length,
        notifications: data.map((n: Notification) => ({
          id: n.id,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt
        }))
      })
      // Vérifier s'il y a de nouvelles notifications
      const currentNotificationIds = new Set(notifications.map(n => n.id))
      const newNotifications = data.filter((n: Notification) => !currentNotificationIds.has(n.id))
      
      if (newNotifications.length > 0) {
        // Afficher une notification toast pour chaque nouvelle notification
        newNotifications.forEach(notification => {
          toast.info(notification.message)
        })
      }

      setNotifications(data)
    } catch (err) {
      console.error("[useNotifications] Erreur lors du chargement des notifications:", {
        error: err,
        message: err instanceof Error ? err.message : "Erreur inconnue",
        stack: err instanceof Error ? err.stack : undefined
      })
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des notifications"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    if (!user) {
      console.log("[useNotifications] Pas d'utilisateur connecté pour marquer comme lu")
      return
    }

    try {
      console.log("[useNotifications] Marquage des notifications comme lues:", notificationIds)
      const response = await fetch(`/api/notifications/${notificationIds.join(",")}`, {
        method: "PATCH",
      })

      if (!response.ok) {
        const errorData = await response.json() as ApiError
        console.error("[useNotifications] Erreur lors du marquage comme lu:", {
          status: response.status,
          error: errorData
        })
        throw new Error(
          errorData.details || errorData.error || "Erreur lors du marquage des notifications"
        )
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (err) {
      console.error("[useNotifications] Erreur lors du marquage comme lu:", {
        error: err,
        message: err instanceof Error ? err.message : "Erreur inconnue",
        stack: err instanceof Error ? err.stack : undefined
      })
      const errorMessage = err instanceof Error ? err.message : "Impossible de marquer les notifications comme lues"
      toast.error(errorMessage)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!user) {
      console.log("[useNotifications] Pas d'utilisateur connecté pour supprimer")
      return
    }

    try {
      console.log("[useNotifications] Suppression des notifications:", notificationIds)
      const response = await fetch(`/api/notifications/${notificationIds.join(",")}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json() as ApiError
        console.error("[useNotifications] Erreur lors de la suppression:", {
          status: response.status,
          error: errorData
        })
        throw new Error(
          errorData.details || errorData.error || "Erreur lors de la suppression des notifications"
        )
      }

      setNotifications((prev) =>
        prev.filter((notification) => !notificationIds.includes(notification.id))
      )
    } catch (err) {
      console.error("[useNotifications] Erreur lors de la suppression:", {
        error: err,
        message: err instanceof Error ? err.message : "Erreur inconnue",
        stack: err instanceof Error ? err.stack : undefined
      })
      const errorMessage = err instanceof Error ? err.message : "Impossible de supprimer les notifications"
      toast.error(errorMessage)
    }
  }

  useEffect(() => {
    console.log("[useNotifications] Effet de chargement initial")
    loadNotifications()

    // S'abonner aux changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useNotifications] Changement d'état d'authentification:", {
        event,
        userId: session?.user?.id
      })
      if (event === "SIGNED_IN") {
        loadNotifications()
      } else if (event === "SIGNED_OUT") {
        setNotifications([])
      }
    })

    // Configurer le polling pour les notifications
    const pollingInterval = setInterval(() => {
      if (user) {
        loadNotifications()
      }
    }, 30000) // Vérifier toutes les 30 secondes

    return () => {
      console.log("[useNotifications] Nettoyage de l'effet")
      authListener?.subscription.unsubscribe()
      clearInterval(pollingInterval)
    }
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    deleteNotifications,
  }
} 