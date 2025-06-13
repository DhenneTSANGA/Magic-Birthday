'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  eventCode: string
}

export function CommentForm({ eventCode }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventCode}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du commentaire')
      }

      setContent('')
      toast.success('Commentaire publié avec succès')
      router.refresh() // Rafraîchir la page pour afficher le nouveau commentaire
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi du commentaire')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Textarea
        placeholder="Écrivez votre commentaire..."
        className="min-h-[100px]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
      />
      <Button type="submit" className="w-full" disabled={isLoading || !content.trim()}>
        {isLoading ? 'Publication...' : 'Publier le commentaire'}
      </Button>
    </form>
  )
} 