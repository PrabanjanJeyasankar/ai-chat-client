import { useEffect } from 'react'
import { create } from 'zustand'

type Theme = 'dark' | 'light'

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const getStoredTheme = (): Theme => {
  try {
    return (localStorage.getItem('ai-chat-theme') as Theme) || 'dark'
  } catch {
    return 'dark'
  }
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem('ai-chat-theme', theme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('ai-chat-theme', newTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newTheme)
      return { theme: newTheme }
    }),
}))

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return <>{children}</>
}
