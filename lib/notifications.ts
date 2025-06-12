import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import { Prisma } from "@prisma/client"
import { ensureUserExists } from "@/utils/event"

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
      console.log("[NotificationService] create - Début de la création", {
        userId: data.userId,
        type: data.type,
        eventId: data.eventId
      })
      
      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true }
      })

      if (!user) {
        console.error("[NotificationService] create - Utilisateur non trouvé:", data.userId)
        throw new NotificationError(`Utilisateur non trouvé: ${data.userId}`)
      }

      // Si un eventId est fourni, vérifier que l'événement existe
      if (data.eventId) {
        const event = await prisma.event.findUnique({
          where: { id: data.eventId },
          select: { id: true }
        })

        if (!event) {
          console.error("[NotificationService] create - Événement non trouvé:", data.eventId)
          throw new NotificationError(`Événement non trouvé: ${data.eventId}`)
        }
      }
      
      // Créer la notification dans Prisma
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          message: data.message,
          eventId: data.eventId,
        },
      })

      console.log("[NotificationService] create - Notification créée:", {
        id: notification.id,
        type: notification.type,
        userId: notification.userId,
        eventId: notification.eventId
      })
      return notification
    } catch (error) {
      console.error("[NotificationService] create - Erreur détaillée:", {
        error,
        data,
        message: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })
      
      if (error instanceof NotificationError) {
        throw error
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotificationError("Utilisateur ou événement non trouvé", error)
        }
        if (error.code === 'P2002') {
          throw new NotificationError("Violation de contrainte unique", error)
        }
      }
      
      throw new NotificationError("Erreur lors de la création de la notification", error)
    }
  },

  // Récupérer les notifications d'un utilisateur
  async getForUser(userId: string) {
    console.log("[NotificationService] getForUser - Début", { userId })
    
    try {
      // S'assurer que l'utilisateur existe
      console.log("[NotificationService] Vérification de l'existence de l'utilisateur")
      const user = await ensureUserExists(userId)

      console.log("[NotificationService] Récupération des notifications")
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      })

      console.log("[NotificationService] getForUser - Notifications récupérées:", {
        count: notifications.length,
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt,
          eventId: n.eventId,
          eventName: n.event?.name
        }))
      })
      
      return notifications
    } catch (error) {
      console.error("[NotificationService] getForUser - Erreur détaillée:", {
        error,
        userId,
        message: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })
      
      if (error instanceof NotificationError) {
        throw error
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotificationError("Utilisateur non trouvé", error)
        }
        if (error.code === 'P2002') {
          throw new NotificationError("Violation de contrainte unique", error)
        }
      }
      
      throw new NotificationError("Erreur lors de la récupération des notifications", error)
    }
  },

  // Marquer des notifications comme lues
  async markAsRead(notificationIds: string[]) {
    try {
      console.log("[NotificationService] markAsRead - Début de la mise à jour pour les IDs:", notificationIds)
      
      const result = await prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { read: true },
      })

      console.log("[NotificationService] markAsRead - Notifications mises à jour:", result.count)
      return result
    } catch (error) {
      console.error("[NotificationService] markAsRead - Erreur détaillée:", {
        error,
        notificationIds,
        message: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })
      throw new NotificationError("Erreur lors du marquage des notifications", error)
    }
  },

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId: string) {
    try {
      console.log("[NotificationService] markAllAsRead - Début de la mise à jour pour userId:", userId)
      
      const result = await prisma.notification.updateMany({
        where: { userId },
        data: { read: true },
      })

      console.log("[NotificationService] markAllAsRead - Notifications mises à jour:", result.count)
      return result
    } catch (error) {
      console.error("[NotificationService] markAllAsRead - Erreur détaillée:", {
        error,
        userId,
        message: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })
      throw new NotificationError("Erreur lors du marquage des notifications", error)
    }
  },

  // Supprimer des notifications
  async delete(notificationIds: string[]) {
    try {
      console.log("[NotificationService] delete - Début de la suppression pour les IDs:", notificationIds)
      
      const result = await prisma.notification.deleteMany({
        where: { id: { in: notificationIds } },
      })

      console.log("[NotificationService] delete - Notifications supprimées:", result.count)
      return result
    } catch (error) {
      console.error("[NotificationService] delete - Erreur détaillée:", {
        error,
        notificationIds,
        message: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })
      throw new NotificationError("Erreur lors de la suppression des notifications", error)
    }
  },

  // Supprimer toutes les notifications lues d'un utilisateur
  async deleteRead(userId: string) {
    try {
      console.log("[NotificationService] deleteRead - Début de la suppression pour userId:", userId)
      
      const result = await prisma.notification.deleteMany({
        where: { userId, read: true },
      })

      console.log("[NotificationService] deleteRead - Notifications supprimées:", result.count)
      return result
    } catch (error) {
      console.error("[NotificationService] deleteRead - Erreur détaillée:", {
        error,
        userId,
        message: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
        isPrismaError: error instanceof Prisma.PrismaClientKnownRequestError,
        prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })
      throw new NotificationError("Erreur lors de la suppression des notifications", error)
    }
  }
} 