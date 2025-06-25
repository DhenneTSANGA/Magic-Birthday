import { NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// GET /api/notifications - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  console.log("[API] GET /api/notifications - Début de la requête")
  
  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[API] Variables d'environnement manquantes")
      return NextResponse.json(
        { error: "Configuration serveur incorrecte", details: "Variables d'environnement manquantes" },
        { status: 500 }
      )
    }

    // Créer un client Supabase pour le middleware
    console.log("[API] Création du client Supabase")
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = cookies()
            const cookie = await cookieStore.get(name)
            console.log(`[API] Cookie ${name}:`, cookie?.value ? "présent" : "absent")
            return cookie?.value
          },
          async set(name: string, value: string, options: any) {
            const cookieStore = cookies()
            await cookieStore.set(name, value, options)
            console.log(`[API] Cookie ${name} défini`)
          },
          async remove(name: string, options: any) {
            const cookieStore = cookies()
            await cookieStore.delete(name, options)
            console.log(`[API] Cookie ${name} supprimé`)
          },
        },
      }
    )

    // Vérifier la session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[API][notifications] Non authentifié', { authError, user })
      return NextResponse.json({ error: 'Non autorisé', details: 'Utilisateur non authentifié' }, { status: 401 })
    }

    console.log("[API] Session valide, userId:", user.id)

    try {
      console.log("[API] Appel du service de notifications")
      const notifications = await notificationService.getForUser(user.id)
      console.log("[API] Notifications récupérées:", { count: notifications.length })
      return NextResponse.json(notifications)
    } catch (dbError) {
      console.error("[API] Erreur base de données:", {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : "Erreur inconnue",
        stack: dbError instanceof Error ? dbError.stack : undefined,
        name: dbError instanceof Error ? dbError.name : undefined
      })
      return NextResponse.json(
        { 
          error: "Erreur lors de la récupération des notifications",
          details: dbError instanceof Error ? dbError.message : "Erreur inconnue",
          code: dbError instanceof Error && 'code' in dbError ? (dbError as any).code : undefined
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[API] Erreur générale:", {
      error,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        code: error instanceof Error && 'code' in error ? (error as any).code : undefined
      },
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const notification = await notificationService.create({
      ...body,
      userId: user.id,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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