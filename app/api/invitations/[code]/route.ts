import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

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

// POST /api/invitations/[code] - Accepter ou refuser une invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
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

    // Récupérer le body de la requête
    const body = await request.json()
    const action = body.action || 'accept' // Par défaut, accepter

    // Vérifier si l'utilisateur existe dans Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    // Créer l'utilisateur s'il n'existe pas
    if (!prismaUser) {
      const userInfo = {
        firstName: user.user_metadata?.firstName || user.user_metadata?.given_name || '',
        lastName: user.user_metadata?.lastName || user.user_metadata?.family_name || '',
        email: user.email || ''
      }
      
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          password: '',
        }
      })
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
          where: { userId: prismaUser.id },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      )
    }

    // Déterminer le statut selon l'action
    const status = action === 'decline' ? 'DECLINED' : 'ACCEPTED'

    // Vérifier si l'utilisateur est déjà invité
    if (event.invites.length > 0) {
      const invite = event.invites[0]
      if (invite.status === status) {
        return NextResponse.json(
          { error: action === 'decline' ? "Vous avez déjà refusé cette invitation" : "Vous avez déjà accepté cette invitation" },
          { status: 400 }
        )
      }
    }

    // Créer ou mettre à jour l'invitation
    const invite = await prisma.invite.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: prismaUser.id,
        },
      },
      update: {
        status: status,
      },
      create: {
        eventId: event.id,
        userId: prismaUser.id,
        status: status,
      },
    })

    // Créer une notification pour le créateur de l'événement
    const userDisplayName = `${prismaUser.firstName} ${prismaUser.lastName}`
    const actionText = action === 'decline' ? 'refusé' : 'accepté'
    
    await prisma.notification.create({
      data: {
        userId: event.createdBy.id,
        type: "update",
        message: `${userDisplayName} a ${actionText} votre invitation à l'événement "${event.name}"`,
        eventId: event.id,
      },
    })

    return NextResponse.json({ invite })
  } catch (error) {
    console.error("Erreur lors du traitement de l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
} 