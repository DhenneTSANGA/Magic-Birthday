import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          throw error
        }
        setUser(user)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // S'abonner aux changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut: () => supabase.auth.signOut(),
  }
} 