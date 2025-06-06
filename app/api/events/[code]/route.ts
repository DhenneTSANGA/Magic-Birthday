import { NextRequest, NextResponse } from 'next/server'
import { getEventByCode, updateEvent, deleteEvent } from '@/utils/event'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RouteParams {
  params: {
    code: string
  }
}

// GET /api/events/[code] - Récupérer un événement spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const event = await getEventByCode(params.code)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PATCH /api/events/[code] - Mettre à jour un événement
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const event = await getEventByCode(params.code)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    const updatedEvent = await updateEvent(params.code, data)

    // Revalidate the event pages
    revalidatePath('/mes-evenements')
    revalidatePath(`/evenement/${params.code}`)

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events/[code] - Supprimer un événement
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const event = await getEventByCode(params.code)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteEvent(params.code)

    // Revalidate the events list page
    revalidatePath('/mes-evenements')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
} 