import { useAuthStore } from '@/domain/auth/auth.store'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import './App.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  const syncUser = useAuthStore((state) => state.syncUser)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    syncUser()
  }, [syncUser])

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className='flex h-screen w-full items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin text-primary' />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AppRoutes />
      <Toaster richColors closeButton expand={false} position='top-right' />
    </ThemeProvider>
  )
}

export default App
