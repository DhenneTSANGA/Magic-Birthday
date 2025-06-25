"use client"
import { Bell, Check, Loader2, Trash2, X, Clock, MessageSquare, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@/context/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
      await deleteNotifications([id], { credentials: 'include' })
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
      await deleteNotifications(readIds, { credentials: 'include' })
      toast.success("Notifications lues supprimées")
    } catch (error) {
      toast.error("Erreur lors de la suppression des notifications")
    }
  }

  const handleDeleteAll = async () => {
    try {
      const allIds = notifications.map(n => n.id)
      await deleteNotifications(allIds, { credentials: 'include' })
      toast.success("Toutes les notifications ont été supprimées")
    } catch (error) {
      toast.error("Erreur lors de la suppression des notifications")
    }
  }

  const handleNotificationClick = async (notificationId: string) => {
    try {
      // Marquer la notification comme lue
      await markAsRead([notificationId])
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
    }
    
    // Rediriger vers la page de notifications
    window.location.href = '/notifications'
  }

  const getNotificationIcon = (message: string) => {
    if (message.includes("invitation")) return <Users className="h-4 w-4" />
    if (message.includes("commentaire")) return <MessageSquare className="h-4 w-4" />
    if (message.includes("événement")) return <Calendar className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative transition-all duration-200 hover:bg-accent/50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Bell className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 sm:w-96 max-h-[400px] p-0 border-0 shadow-xl"
        sideOffset={8}
      >
        {/* Header simplifié */}
        <div className="flex items-center justify-center p-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-sm font-medium text-muted-foreground">
              ({notifications.length})
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Aucune notification
              </div>
              <div className="text-xs text-muted-foreground">
                Vous recevrez des notifications ici
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 transition-all duration-200 hover:bg-accent/50 cursor-pointer",
                    !notification.read && "bg-primary/5 border-l-4 border-l-primary",
                    notification.read && "opacity-75"
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "slideInFromTop 0.3s ease-out forwards"
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full mt-0.5",
                      !notification.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {getNotificationIcon(notification.message)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-xs leading-relaxed",
                        !notification.read ? "font-medium" : "font-normal"
                      )}>
                        {notification.message}
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec bouton supprimer toutes */}
        <div className="p-2 border-t bg-muted/30">
          {notifications.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full h-8 text-xs font-medium"
              onClick={handleDeleteAll}
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Supprimer toutes les notifications
            </Button>
          )}
        </div>
      </DropdownMenuContent>

      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DropdownMenu>
  )
} 