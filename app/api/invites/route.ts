import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Créer un client Supabase côté serveur
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
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur existe dans Prisma
    const prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!prismaUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer toutes les invitations de l'utilisateur avec les détails de l'événement
    const invitations = await prisma.invite.findMany({
      where: {
        userId: prismaUser.id
      },
      include: {
        event: {
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater les données pour l'affichage
    const formattedInvitations = invitations.map(invitation => ({
      id: invitation.id,
      status: invitation.status,
      createdAt: invitation.createdAt,
      event: {
        id: invitation.event.id,
        code: invitation.event.code,
        name: invitation.event.name,
        date: invitation.event.date,
        time: invitation.event.time,
        location: invitation.event.location,
        description: invitation.event.description || '',
        maxGuests: invitation.event.maxGuests,
        createdBy: {
          firstName: invitation.event.createdBy.firstName,
          lastName: invitation.event.createdBy.lastName
        }
      }
    }))

    return NextResponse.json(formattedInvitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    )
  }
} 