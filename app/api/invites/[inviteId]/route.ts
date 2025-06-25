import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    const cookieStore = await cookies()
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

    const { status } = await request.json()

    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invite.findFirst({
      where: {
        id: params.inviteId,
        userId: user.id
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut de l'invitation
    const updatedInvitation = await prisma.invite.update({
      where: {
        id: params.inviteId
      },
      data: {
        status: status
      },
      include: {
        event: {
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedInvitation.id,
      status: updatedInvitation.status,
      event: {
        id: updatedInvitation.event.id,
        code: updatedInvitation.event.code,
        name: updatedInvitation.event.name,
        createdBy: updatedInvitation.event.createdBy
      }
    })
  } catch (error) {
    console.error("Erreur lors de la réponse à l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
} 