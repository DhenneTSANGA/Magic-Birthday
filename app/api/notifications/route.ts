import { NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// GET /api/notifications - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/notifications - Début de la requête")

    // Créer un client Supabase pour le middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set(name, value, options)
          },
          remove(name: string, options: any) {
            cookies().delete(name, options)
          },
        },
      }
    )

    console.log("GET /api/notifications - Client Supabase créé")

    // Vérifier la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error("GET /api/notifications - Erreur de session:", sessionError)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (!session) {
      console.error("GET /api/notifications - Pas de session")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    console.log("GET /api/notifications - Session valide, userId:", session.user.id)

    try {
      const notifications = await notificationService.getForUser(session.user.id)
      console.log("GET /api/notifications - Notifications récupérées:", notifications.length)
      return NextResponse.json(notifications)
    } catch (dbError) {
      console.error("GET /api/notifications - Erreur base de données:", dbError)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des notifications" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("GET /api/notifications - Erreur générale:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set(name, value, options)
          },
          remove(name: string, options: any) {
            cookies().delete(name, options)
          },
        },
      }
    )

    // Vérifier la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const notification = await notificationService.create({
      ...body,
      userId: session.user.id,
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Marquer les notifications comme lues
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set(name, value, options)
          },
          remove(name: string, options: any) {
            cookies().delete(name, options)
          },
        },
      }
    )

    // Vérifier la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { notificationIds } = await request.json()
    await notificationService.markAsRead(notificationIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Supprimer des notifications
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set(name, value, options)
          },
          remove(name: string, options: any) {
            cookies().delete(name, options)
          },
        },
      }
    )

    // Vérifier la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { notificationIds } = await request.json()
    await notificationService.delete(notificationIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression des notifications:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
} 