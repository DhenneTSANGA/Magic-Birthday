import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/notifications"

// GET /api/invitations/[code] - Vérifier une invitation
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Récupérer l'événement par son code
    const event = await prisma.event.findUnique({
      where: { code: params.code },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST /api/invitations/[code] - Accepter une invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name, options)
          },
        },
      }
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Récupérer l'événement
    const event = await prisma.event.findUnique({
      where: { code: params.code },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        invites: {
          where: { userId: user.id },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur est déjà invité
    if (event.invites.length > 0) {
      const invite = event.invites[0]
      if (invite.status === "ACCEPTED") {
        return NextResponse.json(
          { error: "Vous avez déjà accepté cette invitation" },
          { status: 400 }
        )
      }
    }

    // Créer ou mettre à jour l'invitation
    const invite = await prisma.invite.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
      update: {
        status: "ACCEPTED",
      },
      create: {
        eventId: event.id,
        userId: user.id,
        status: "ACCEPTED",
      },
    })

    // Notifier le créateur de l'événement
    await notificationService.create({
      userId: event.createdBy.id,
      type: "update",
      message: `${user.user_metadata.firstName} ${user.user_metadata.lastName} a accepté votre invitation à l'événement "${event.name}"`,
      eventId: event.id,
    })

    return NextResponse.json({ invite })
  } catch (error) {
    console.error("Erreur lors de l'acceptation de l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
} 