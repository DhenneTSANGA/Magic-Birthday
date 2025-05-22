import { NextRequest, NextResponse } from 'next/server'
import { createEvent, getUserEvents } from '@/utils/event'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/events - Récupérer tous les événements de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Récupérer la session depuis le cookie
    const authCookie = request.cookies.get('sb-itzqchqhtcdfjxdoxpdq-auth-token')
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier la session avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await getUserEvents(user.id)
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/events - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    // Récupérer la session depuis le cookie
    const authCookie = request.cookies.get('sb-itzqchqhtcdfjxdoxpdq-auth-token')
    if (!authCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier la session avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const event = await createEvent({
      ...data,
      userId: user.id,
    })

    // Revalidate the events list page
    revalidatePath('/mes-evenements')
    revalidatePath('/evenement/[code]')

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
} 