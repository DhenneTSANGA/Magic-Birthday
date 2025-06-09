import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { eventService } from "@/lib/events"

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
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

    const { content } = await request.json()
    const comment = await eventService.addComment(
      params.code,
      session.user.id,
      content
    )

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
} 