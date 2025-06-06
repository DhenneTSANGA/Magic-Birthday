"use client"

import { useEffect, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const themes = [
  { name: "Bleu", value: "blue", color: "#3b82f6" },
  { name: "Vert", value: "green", color: "#10b981" },
  { name: "Violet", value: "purple", color: "#8b5cf6" },
  { name: "Orange", value: "orange", color: "#f97316" },
  { name: "Rouge", value: "red", color: "#ef4444" }
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 border-blue-200 pr-1 text-sm md:h-9 md:pr-2">
          <span
            className="mr-1 h-4 w-4 rounded-full"
            style={{ backgroundColor: currentTheme.color }}
            aria-hidden="true"
          />
          <span className="hidden md:inline-block">{currentTheme.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((t) => (
          <DropdownMenuItem key={t.value} className="flex items-center gap-2" onClick={() => setTheme(t.value)}>
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: t.color }} aria-hidden="true" />
            <span>{t.name}</span>
            {theme === t.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
