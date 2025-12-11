import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 rounded-full backdrop-blur-xl bg-white/10 dark:bg-white/10 bg-slate-200/80 dark:bg-white/10 border border-white/20 dark:border-white/20 border-slate-300/50 dark:border-white/20 hover:bg-white/20 dark:hover:bg-white/20 hover:bg-slate-300/90 dark:hover:bg-white/20 transition-all duration-300 shadow-lg"
      aria-label={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-white dark:text-white" />
      ) : (
        <Moon className="h-5 w-5 text-slate-800 dark:text-slate-800" />
      )}
    </Button>
  )
}
