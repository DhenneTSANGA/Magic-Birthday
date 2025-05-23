import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getUserEvents } from '@/utils/event'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'

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
    // Créer une réponse
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    console.log('API - Début de la création d\'événement');

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
    
    // Récupérer et valider les données
    const data = await request.json();
    console.log('API - Données reçues:', data);

    if (!data.name || !data.date || !data.time || !data.location) {
      console.error('API - Données manquantes:', { data });
      return NextResponse.json(
        { error: 'Données manquantes requises' },
        { status: 400 }
      );
    }

    // Transformer les données pour correspondre au schéma attendu
    const eventData = {
      name: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
      description: data.description,
      type: data.type || 'PUBLIC',
      maxGuests: data.maxGuests || 0,
      userId: user.id
    };

    console.log('API - Données transformées:', eventData);

    try {
      const event = await createEvent(eventData);
      console.log('API - Événement créé avec succès:', event);

      // Transformer la réponse pour correspondre à l'interface attendue
      const transformedEvent = {
        id: event.id,
        code: event.code,
        name: event.name,
        date: event.date.toISOString(),
        time: event.time,
        location: event.location,
        description: event.description,
        type: event.type,
        status: event.status,
        maxGuests: event.maxGuests,
        createdBy: event.createdBy,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      };

      console.log('API - Réponse transformée:', transformedEvent);

      // Revalidate the events list page
      revalidatePath('/mes-evenements');
      revalidatePath('/evenement/[code]');

      return NextResponse.json(transformedEvent);
    } catch (createError) {
      console.error('API - Erreur lors de la création de l\'événement:', createError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la création de l\'événement',
          details: createError instanceof Error ? createError.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API - Erreur générale:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 