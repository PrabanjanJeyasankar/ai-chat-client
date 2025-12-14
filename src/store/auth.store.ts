import { create } from 'zustand'

export type UserProfile = {
  id: string
  email: string
  name?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type AuthState = {
  currentUser: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  setCurrentUser: (user: UserProfile | null) => void
  logoutUser: (force?: boolean) => Promise<void>
  syncUser: () => Promise<void>
}

export const authStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,

  setCurrentUser: (user: UserProfile | null) => {
    set({
      currentUser: user,
      isAuthenticated: user !== null,
      isLoading: false,
    })
  },

  logoutUser: async (force = false) => {
    console.log('[auth.store] Logout triggered, force:', force)

    if (!force) {
      try {
        const { authService } = await import('@/services/auth.service')
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    set({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  syncUser: async () => {
    try {
      const { authService } = await import('@/services/auth.service')
      const response = await authService.getMe()
      set({
        currentUser: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.error('Sync user error:', error)
      set({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
