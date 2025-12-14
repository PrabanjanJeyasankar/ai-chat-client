import { create } from 'zustand'
import { authClient } from './auth.client'
import type { UserProfile } from './auth.types'

type AuthState = {
  currentUser: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  setCurrentUser: (user: UserProfile | null) => void
  logout: (force?: boolean) => Promise<void>
  syncUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
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

  logout: async (force = false) => {
    if (!force) {
      try {
        await authClient.logout()
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
      const response = await authClient.getProfile()
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
