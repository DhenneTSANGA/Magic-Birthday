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

    const { userIds } = await request.json()
    const invites = await eventService.inviteUsers(params.code, userIds)

    return NextResponse.json(invites)
  } catch (error) {
    console.error("Erreur lors de l'invitation des utilisateurs:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
} 