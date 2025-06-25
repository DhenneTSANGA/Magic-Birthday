import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      where: { type: 'PUBLIC', status: 'PUBLISHED' },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        _count: { select: { invites: true, comments: true } }
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 