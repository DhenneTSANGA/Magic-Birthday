import { Metadata } from 'next'
import { EventList } from '@/components/EventList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Mes événements | Crée ton anniversaire',
  description: 'Gérez vos événements et invitations',
}

export default function MesEvenementsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes événements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos événements et invitations
          </p>
        </div>
        <Button asChild>
          <Link href="/creer-evenement">
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Chargement des événements...</div>}>
        <EventList />
      </Suspense>
    </div>
  )
} 