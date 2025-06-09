import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import { Prisma } from "@prisma/client"

export type NotificationType = "invitation" | "comment" | "update"

export interface NotificationData {
  userId: string
  type: NotificationType
  message: string
  eventId?: string
}

export class NotificationError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = "NotificationError"
  }
}

export const notificationService = {
  // Créer une nouvelle notification
  async create(data: NotificationData) {
    try {
      console.log("notificationService.create - Début de la création", data)
      
      // Créer la notification dans Prisma
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          message: data.message,
          eventId: data.eventId,
        },
      })

      console.log("notificationService.create - Notification créée:", notification.id)
      return notification
    } catch (error) {
      console.error("notificationService.create - Erreur détaillée:", {
        error,
        data,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new NotificationError("Erreur lors de la création de la notification", error)
    }
  },

  // Récupérer les notifications d'un utilisateur
  async getForUser(userId: string) {
    try {
      console.log("notificationService.getForUser - Début de la récupération pour userId:", userId)
      
      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      })

      if (!user) {
        throw new NotificationError(`Utilisateur non trouvé: ${userId}`)
      }

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      })

      console.log("notificationService.getForUser - Notifications récupérées:", notifications.length)
      return notifications
    } catch (error) {
      console.error("notificationService.getForUser - Erreur détaillée:", {
        error,
        userId,
        stack: error instanceof Error ? error.stack : undefined
      })
      
      if (error instanceof NotificationError) {
        throw error
      }
      
      throw new NotificationError("Erreur lors de la récupération des notifications", error)
    }
  },

  // Marquer des notifications comme lues
  async markAsRead(notificationIds: string[]) {
    try {
      console.log("notificationService.markAsRead - Début de la mise à jour pour les IDs:", notificationIds)
      
      const result = await prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { read: true },
      })

      console.log("notificationService.markAsRead - Notifications mises à jour:", result.count)
      return result
    } catch (error) {
      console.error("notificationService.markAsRead - Erreur détaillée:", {
        error,
        notificationIds,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new NotificationError("Erreur lors du marquage des notifications", error)
    }
  },

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId: string) {
    try {
      console.log("notificationService.markAllAsRead - Début de la mise à jour pour userId:", userId)
      
      const result = await prisma.notification.updateMany({
        where: { userId },
        data: { read: true },
      })

      console.log("notificationService.markAllAsRead - Notifications mises à jour:", result.count)
      return result
    } catch (error) {
      console.error("notificationService.markAllAsRead - Erreur détaillée:", {
        error,
        userId,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new NotificationError("Erreur lors du marquage des notifications", error)
    }
  },

  // Supprimer des notifications
  async delete(notificationIds: string[]) {
    try {
      console.log("notificationService.delete - Début de la suppression pour les IDs:", notificationIds)
      
      const result = await prisma.notification.deleteMany({
        where: { id: { in: notificationIds } },
      })

      console.log("notificationService.delete - Notifications supprimées:", result.count)
      return result
    } catch (error) {
      console.error("notificationService.delete - Erreur détaillée:", {
        error,
        notificationIds,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new NotificationError("Erreur lors de la suppression des notifications", error)
    }
  },

  // Supprimer toutes les notifications lues d'un utilisateur
  async deleteRead(userId: string) {
    try {
      console.log("notificationService.deleteRead - Début de la suppression pour userId:", userId)
      
      const result = await prisma.notification.deleteMany({
        where: { userId, read: true },
      })

      console.log("notificationService.deleteRead - Notifications supprimées:", result.count)
      return result
    } catch (error) {
      console.error("notificationService.deleteRead - Erreur détaillée:", {
        error,
        userId,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new NotificationError("Erreur lors de la suppression des notifications", error)
    }
  },
} 