import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/events/[code] - Récupérer un événement spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    // Créer un client Supabase côté serveur
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = cookieStore.get(name)
            return cookie?.value
          },
        },
      }
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[API][events] Non authentifié', { authError, user })
      return NextResponse.json(
        { error: 'Non autorisé', details: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'événement
    const event = await prisma.event.findUnique({
      where: { code },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le propriétaire de l'événement
    if (event.userId !== user.id) {
      console.error('[API][events] Accès refusé : utilisateur non propriétaire', { eventUserId: event.userId, userId: user.id })
      return NextResponse.json(
        { error: 'Non autorisé', details: 'Vous n\'êtes pas le propriétaire de cet événement' },
        { status: 403 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error getting event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    )
  }
}

// PATCH /api/events/[code] - Modifier un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params
    console.log('Code de l\'événement à modifier:', code)

    // Créer un client Supabase côté serveur
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = cookieStore.get(name)
            return cookie?.value
          },
        },
      }
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Erreur d\'authentification:', authError)
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    if (!user) {
      console.error('Utilisateur non trouvé')
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    console.log('Utilisateur authentifié:', user.id)

    // Récupérer les données à mettre à jour
    const data = await request.json()
    console.log('Données reçues:', data)

    // Vérifier que l'événement existe et appartient à l'utilisateur
    const existingEvent = await prisma.event.findUnique({
      where: { code },
    })

    if (!existingEvent) {
      console.error('Événement non trouvé:', code)
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    if (existingEvent.userId !== user.id) {
      console.error('Utilisateur non autorisé:', user.id, 'pour l\'événement:', existingEvent.id)
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.date) updateData.date = new Date(data.date)
    if (data.time) updateData.time = data.time
    if (data.location) updateData.location = data.location
    if (data.maxGuests) updateData.maxGuests = parseInt(data.maxGuests)
    if (data.type) updateData.type = data.type
    if (data.status) updateData.status = data.status

    console.log('Données à mettre à jour:', updateData)

    try {
      // Mettre à jour l'événement
      const updatedEvent = await prisma.event.update({
        where: { code },
        data: updateData,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              email: true,
            },
          },
        },
      })

      console.log('Événement mis à jour avec succès:', updatedEvent.id)
      return NextResponse.json(updatedEvent)
    } catch (prismaError) {
      console.error('Erreur Prisma:', prismaError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour dans la base de données' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'événement' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[code] - Supprimer un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    // Créer un client Supabase côté serveur
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = cookieStore.get(name)
            return cookie?.value
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

    // Vérifier que l'événement existe et appartient à l'utilisateur
    const existingEvent = await prisma.event.findUnique({
      where: { code },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    if (existingEvent.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer l'événement
    await prisma.event.delete({
      where: { code },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'événement' },
      { status: 500 }
    )
  }
} 