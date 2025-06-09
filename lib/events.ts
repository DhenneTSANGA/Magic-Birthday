import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/notifications"
import type { Event, Invite, Comment } from "@prisma/client"

export const eventService = {
  // Créer un événement
  async create(data: any, userId: string): Promise<Event> {
    return await prisma.event.create({
      data: {
        ...data,
        userId,
      },
    })
  },

  // Inviter des utilisateurs à un événement
  async inviteUsers(code: string, userIds: string[]) {
    const event = await prisma.event.findUnique({
      where: { code },
      include: { createdBy: true },
    })

    if (!event) throw new Error("Événement non trouvé")

    const invites = await prisma.$transaction(
      userIds.map((userId) =>
        prisma.invite.create({
          data: {
            eventId: event.id,
            userId,
          },
          include: {
            user: true,
          },
        })
      )
    )

    // Créer une notification pour chaque invité
    await Promise.all(
      invites.map((invite) =>
        notificationService.create({
          userId: invite.userId,
          type: "invitation",
          message: `${event.createdBy.firstName} ${event.createdBy.lastName} vous a invité à l'événement "${event.name}"`,
          eventId: event.id,
        })
      )
    )

    return invites
  },

  // Ajouter un commentaire à un événement
  async addComment(code: string, userId: string, content: string) {
    const [event, author] = await Promise.all([
      prisma.event.findUnique({
        where: { code },
        include: { createdBy: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ])

    if (!event || !author) throw new Error("Événement ou utilisateur non trouvé")

    const comment = await prisma.comment.create({
      data: {
        content,
        eventId: event.id,
        userId,
      },
      include: {
        author: true,
      },
    })

    // Notifier le créateur de l'événement si ce n'est pas lui qui commente
    if (event.userId !== userId) {
      await notificationService.create({
        userId: event.userId,
        type: "comment",
        message: `${author.firstName} ${author.lastName} a commenté votre événement "${event.name}"`,
        eventId: event.id,
      })
    }

    // Notifier les autres participants qui ont commenté (sauf l'auteur du commentaire)
    const uniqueCommenters = await prisma.comment.findMany({
      where: {
        eventId: event.id,
        userId: {
          not: userId, // Exclure l'auteur du commentaire
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    })

    await Promise.all(
      uniqueCommenters.map((commenter) =>
        notificationService.create({
          userId: commenter.userId,
          type: "comment",
          message: `${author.firstName} ${author.lastName} a aussi commenté l'événement "${event.name}"`,
          eventId: event.id,
        })
      )
    )

    return comment
  },

  // Mettre à jour un événement
  async update(eventId: string, data: any) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        invites: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    })

    if (!event) throw new Error("Événement non trouvé")

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data,
    })

    // Notifier tous les invités des modifications
    await Promise.all(
      event.invites.map((invite) =>
        notificationService.create({
          userId: invite.userId,
          type: "update",
          message: `${event.createdBy.firstName} ${event.createdBy.lastName} a mis à jour l'événement "${event.name}"`,
          eventId,
        })
      )
    )

    return updatedEvent
  },

  // Répondre à une invitation
  async respondToInvite(inviteId: string, status: "ACCEPTED" | "DECLINED") {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        event: {
          include: {
            createdBy: true,
          },
        },
        user: true,
      },
    })

    if (!invite) throw new Error("Invitation non trouvée")

    const updatedInvite = await prisma.invite.update({
      where: { id: inviteId },
      data: { status },
    })

    // Notifier le créateur de l'événement de la réponse
    await notificationService.create({
      userId: invite.event.userId,
      type: "update",
      message: `${invite.user.firstName} ${invite.user.lastName} a ${
        status === "ACCEPTED" ? "accepté" : "décliné"
      } votre invitation à l'événement "${invite.event.name}"`,
      eventId: invite.eventId,
    })

    return updatedInvite
  },
} 