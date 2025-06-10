import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getUserEvents } from '@/utils/event'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { generateEventCode } from '@/utils/event'

const prisma = new PrismaClient()

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
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les données de l'événement
    const data = await request.json()
    console.log('Received event data:', data)

    // Vérifier si l'utilisateur existe dans Prisma
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    // Créer l'utilisateur s'il n'existe pas
    if (!prismaUser) {
      prismaUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || `${user.id}@temp.com`,
          firstName: user.user_metadata?.firstName || user.email?.split('@')[0] || 'Utilisateur',
          lastName: user.user_metadata?.lastName || 'Anonyme',
          password: '',
        }
      })
    } else {
      // Mettre à jour les informations de l'utilisateur si elles ont changé
      prismaUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email || prismaUser.email,
          firstName: user.user_metadata?.firstName || prismaUser.firstName,
          lastName: user.user_metadata?.lastName || prismaUser.lastName,
        }
      })
    }

    // Générer un code unique pour l'événement
    const code = generateEventCode()

    // Créer l'événement
    const event = await prisma.event.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
        description: data.description,
        type: data.type || 'PUBLIC',
        maxGuests: data.maxGuests || 0,
        code,
        status: 'DRAFT',
        createdBy: {
          connect: {
            id: prismaUser.id
          }
        }
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

    console.log('Event créé avec créateur:', event.createdBy)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
} 