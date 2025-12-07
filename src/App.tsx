import { authService } from '@/services/auth.service'
import { authStore } from '@/store/auth.store'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import './App.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  const syncUser = authStore((state) => state.syncUser)
  const setAuthToken = authStore((state) => state.setAuthToken)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.refreshToken()
        setAuthToken(response.data.accessToken)
        await syncUser()
      } catch {}
    }

    initAuth()
  }, [setAuthToken, syncUser])

  return (
    <ThemeProvider>
      <AppRoutes />
      <Toaster richColors closeButton expand={false} position='top-right' />
    </ThemeProvider>
  )
}

export default App
