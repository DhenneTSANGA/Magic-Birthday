import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getUserEvents } from '@/utils/event'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { generateEventCode } from '@/utils/event'

const prisma = new PrismaClient()

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
    console.log('API - Début de la récupération des événements')
    
    // Créer une réponse
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Créer un client Supabase pour le middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Vérifier la session avec Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('API - Erreur de session:', sessionError);
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('API - Erreur utilisateur:', userError);
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    console.log('API - Utilisateur authentifié:', user.id);
    
    try {
      const events = await getUserEvents(user.id);
      console.log('API - Événements récupérés:', events.length);
      
      // Transformer les données pour correspondre à l'interface attendue
      const transformedEvents = events.map(event => ({
        id: event.id,
        code: event.code,
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description,
        type: event.type,
        status: event.status,
        maxGuests: event.maxGuests,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        _count: event._count,
        invites: event.invites || []
      }));

      console.log('API - Événements transformés:', transformedEvents.length);
      return NextResponse.json(transformedEvents);
    } catch (dbError) {
      console.error('API - Erreur base de données:', dbError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API - Erreur générale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/events - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    console.log('[API] Début de la création d\'événement')
    
    // Créer un client Supabase côté serveur
    const cookieStore = cookies()
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
      console.error('[API] Erreur d\'authentification:', authError)
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les données de l'événement
    const data = await request.json()
    console.log('[API] Données reçues:', data)

    // Vérifier si l'utilisateur existe dans Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    // Extraire les informations utilisateur depuis Supabase
    const userInfo = extractUserInfo(user)

    // Créer l'utilisateur s'il n'existe pas
    if (!prismaUser) {
      console.log('[API] Création d\'un nouvel utilisateur dans Prisma avec les informations:', userInfo)
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          password: '',
        }
      })
    } else {
      // Mettre à jour les informations de l'utilisateur si elles ont changé dans Supabase
      console.log('[API] Mise à jour des informations utilisateur dans Prisma:', userInfo)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
        }
      })
    }

    // Générer un code unique pour l'événement
    const code = generateEventCode()

    // S'assurer que la date est un objet Date valide
    const eventDate = new Date(data.date)
    if (isNaN(eventDate.getTime())) {
      console.error('[API] Date invalide:', data.date)
      return NextResponse.json(
        { error: 'Date invalide' },
        { status: 400 }
      )
    }

    console.log('[API] Création de l\'événement avec les données:', {
      name: data.name,
      date: eventDate,
      time: data.time,
      location: data.location,
      description: data.description,
      type: data.type || 'PUBLIC',
      maxGuests: data.maxGuests || 0,
      code,
      userId: prismaUser.id
    })

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        name: data.name,
        date: eventDate,
        time: data.time,
        location: data.location,
        description: data.description,
        type: data.type || 'PUBLIC',
        maxGuests: data.maxGuests || 0,
        code,
        status: 'DRAFT',
        userId: prismaUser.id
      },
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

    console.log('[API] Événement créé avec succès:', {
      id: event.id,
      code: event.code,
      name: event.name,
      date: event.date,
      userId: event.userId,
      createdBy: event.createdBy
    })

    return NextResponse.json({
      ...event,
      createdBy: {
        ...event.createdBy,
        firstName: event.createdBy.firstName || userInfo.firstName,
        lastName: event.createdBy.lastName || userInfo.lastName,
      }
    })
  } catch (error) {
    console.error('[API] Erreur lors de la création de l\'événement:', {
      error,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
} 