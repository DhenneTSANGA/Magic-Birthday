"use client"

import { Bell, Check, Loader2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@/hooks/useAuth"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

export function NotificationButton() {
  const { user } = useAuth()
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    deleteNotifications,
  } = useNotifications()

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead([id])
    } catch (error) {
      toast.error("Erreur lors du marquage de la notification")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id)
      await markAsRead(unreadIds)
      toast.success("Toutes les notifications ont été marquées comme lues")
    } catch (error) {
      toast.error("Erreur lors du marquage des notifications")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotifications([id])
      toast.success("Notification supprimée")
    } catch (error) {
      toast.error("Erreur lors de la suppression de la notification")
    }
  }

  const handleDeleteRead = async () => {
    try {
      const readIds = notifications
        .filter(n => n.read)
        .map(n => n.id)
      await deleteNotifications(readIds)
      toast.success("Notifications lues supprimées")
    } catch (error) {
      toast.error("Erreur lors de la suppression des notifications")
    }
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm font-medium">Notifications</div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="mr-1 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleDeleteRead}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Nettoyer
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`relative flex cursor-pointer flex-col items-start gap-1 p-4 ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
              >
                <div className="text-sm font-medium">{notification.message}</div>
                <div className="text-xs text-muted-foreground">
                  {notification.type === "invitation"
                    ? "Invitation à un événement"
                    : notification.type === "comment"
                    ? "Nouveau commentaire"
                    : "Mise à jour d'événement"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 