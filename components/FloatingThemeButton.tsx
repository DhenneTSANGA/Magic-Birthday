import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function FloatingThemeButton() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-8">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full border-2 bg-background shadow-lg hover:bg-accent"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Changer le thème</span>
      </Button>
    </div>
  )
} 