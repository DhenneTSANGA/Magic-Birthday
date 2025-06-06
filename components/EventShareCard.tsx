'use client'

import { Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Event } from '@/types/event'

interface EventShareCardProps {
  event: Event
}

export function EventShareCard({ event }: EventShareCardProps) {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/evenement/${event.code}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(event.code)
    toast.success('Code copié dans le presse-papiers')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Lien copié dans le presse-papiers')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitation à ${event.name}`,
          text: `Tu es invité(e) à ${event.name} ! Utilise le code ${event.code} pour accéder à l'événement.`,
          url: shareUrl,
        })
      } catch (error) {
        // L'utilisateur a annulé le partage
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partage</CardTitle>
        <CardDescription>
          Partagez cet événement avec vos invités
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Code de l'événement</label>
          <div className="flex gap-2">
            <Input
              value={event.code}
              readOnly
              className="font-mono text-center h-8 text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0 h-8 w-8"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Lien de partage</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="text-xs h-8"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0 h-8 w-8"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full h-8 text-sm"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-3 w-3" />
          Partager l'événement
        </Button>
      </CardContent>
    </Card>
  )
} 