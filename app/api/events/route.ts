import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Fonction helper pour extraire les informations utilisateur depuis Supabase
function extractUserInfo(user: any) {
  console.log('[API] Extraction des informations utilisateur depuis Supabase:', {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    raw_user_meta_data: user.raw_user_meta_data
  })

  // Essayer différentes sources pour récupérer le nom et prénom
  let firstName = ''
  let lastName = ''
  let fullName = ''

  // 1. Essayer user_metadata (données personnalisées)
  if (user.user_metadata) {
    firstName = user.user_metadata.firstName || user.user_metadata.given_name || ''
    lastName = user.user_metadata.lastName || user.user_metadata.family_name || ''
    fullName = user.user_metadata.name || user.user_metadata.full_name || ''
  }

  // 2. Essayer raw_user_meta_data (données brutes des providers)
  if (!firstName && !lastName && user.raw_user_meta_data) {
    firstName = user.raw_user_meta_data.first_name || user.raw_user_meta_data.given_name || ''
    lastName = user.raw_user_meta_data.last_name || user.raw_user_meta_data.family_name || ''
    fullName = user.raw_user_meta_data.name || user.raw_user_meta_data.full_name || ''
  }

  // 3. Si on a un nom complet mais pas de prénom/nom séparés, essayer de les extraire
  if (fullName && (!firstName || !lastName)) {
    const nameParts = fullName.trim().split(' ')
    if (nameParts.length >= 2) {
      firstName = firstName || nameParts[0]
      lastName = lastName || nameParts.slice(1).join(' ')
    } else if (nameParts.length === 1) {
      firstName = firstName || nameParts[0]
    }
  }

  // 4. Fallback sur l'email si rien d'autre
  if (!firstName && !lastName) {
    const emailPrefix = user.email?.split('@')[0] || 'Utilisateur'
    firstName = emailPrefix
    lastName = 'Anonyme'
  }

  // 5. S'assurer qu'on a au moins quelque chose
  if (!firstName) firstName = 'Utilisateur'
  if (!lastName) lastName = 'Anonyme'

  console.log('[API] Informations utilisateur extraites:', {
    firstName,
    lastName,
    fullName,
    email: user.email
  })

  return {
    firstName,
    lastName,
    email: user.email || `${user.id}@temp.com`
  }
}

// GET /api/events - Récupérer tous les événements de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Authentifier l'utilisateur
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[API][events] Non authentifié', { authError, user })
      return NextResponse.json(
        { error: 'Non autorisé', details: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer uniquement les événements créés par l'utilisateur connecté
    const events = await prisma.event.findMany({
      where: {
        userId: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            invites: true,
            comments: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Formater les données pour l'affichage
    const formattedEvents = events.map(event => ({
      id: event.id,
      code: event.code,
      title: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      maxGuests: event.maxGuests,
      type: event.type,
      status: event.status,
      createdAt: event.createdAt,
      createdBy: {
        id: event.createdBy.id,
        name: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
        avatar: event.createdBy.avatar || null
      },
      comments: event.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: `${comment.author.firstName} ${comment.author.lastName}`,
          avatar: comment.author.avatar || null
        }
      })),
      stats: {
        inviteCount: event._count.invites,
        commentCount: event._count.comments
      }
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}

// POST /api/events - Créer un nouvel événement
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, date, time, location, description, maxGuests, type } = body

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

    // Générer un code unique pour l'événement
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        code,
        name,
        date: new Date(date),
        time,
        location,
        description,
        maxGuests: parseInt(maxGuests),
        type: type || 'PUBLIC',
        status: 'PUBLISHED',
        userId: prismaUser.id
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      id: event.id,
      code: event.code,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      maxGuests: event.maxGuests,
      type: event.type,
      status: event.status,
      createdBy: {
        firstName: event.createdBy.firstName,
        lastName: event.createdBy.lastName
      }
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
} 