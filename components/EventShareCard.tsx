'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Mail, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Event } from '@/types/event'

interface EventShareCardProps {
  event: Event
}

export function EventShareCard({ event }: EventShareCardProps) {
  const [copying, setCopying] = useState(false)

  const inviteLink = `${window.location.origin}/invitation/${event.code}`

  const copyToClipboard = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(inviteLink)
      toast.success("Lien copié dans le presse-papiers")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast.error("Impossible de copier le lien")
    } finally {
      setCopying(false)
    }
  }

  const shareEvent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invitation : ${event.name}`,
          text: `Vous êtes invité(e) à l'événement "${event.name}"`,
          url: inviteLink,
        })
      } else {
        await copyToClipboard()
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // L'utilisateur a annulé le partage, pas besoin d'afficher une erreur
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partager l'invitation</CardTitle>
        <CardDescription>Invitez vos amis à rejoindre l'événement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3">
          <span className="text-sm text-blue-800 truncate">{inviteLink}</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            onClick={copyToClipboard}
            disabled={copying}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Mail className="mr-2 h-4 w-4" />
            Envoyer par email
          </Button>
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={shareEvent}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Partager le lien
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 