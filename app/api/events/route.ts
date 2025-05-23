import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getUserEvents } from '@/utils/event'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'

// GET /api/events - Récupérer tous les événements de l'utilisateur
export async function GET(request: NextRequest) {
  try {
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
    const events = await getUserEvents(user.id);
    
    // Transformer les données pour correspondre à l'interface attendue
    const transformedEvents = events.map(event => ({
      id: event.id,
      code: event.code,
      name: event.title,
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
      _count: event._count
    }));

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
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
    const data = await request.json();
    
    // Transformer les données pour correspondre au schéma attendu
    const eventData = {
      title: data.name,
      date: data.date,
      time: data.time,
      location: data.location,
      description: data.description,
      type: data.type || 'PUBLIC',
      maxGuests: data.maxGuests || 0,
      userId: user.id
    };

    const event = await createEvent(eventData);

    // Transformer la réponse pour correspondre à l'interface attendue
    const transformedEvent = {
      id: event.id,
      code: event.code,
      name: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      type: event.type,
      status: event.status,
      maxGuests: event.maxGuests,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };

    // Revalidate the events list page
    revalidatePath('/mes-evenements');
    revalidatePath('/evenement/[code]');

    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
} 