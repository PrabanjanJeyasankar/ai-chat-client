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
  authToken: string | null
  currentUser: UserProfile | null

  isAuthenticated: boolean

  setAuthToken: (token: string | null) => void
  setCurrentUser: (user: UserProfile | null) => void
  logoutUser: () => Promise<void>
  syncUser: () => Promise<void>
}

export const authStore = create<AuthState>((set, get) => ({
  authToken: null,
  currentUser: null,
  isAuthenticated: false,

  setAuthToken: (token: string | null) => {
    set({
      authToken: token,
      isAuthenticated: token !== null,
    })
  },

  setCurrentUser: (user: UserProfile | null) => {
    set({
      currentUser: user,
    })
  },

  logoutUser: async () => {
    try {
      const { authService } = await import('@/services/auth.service')
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({
        authToken: null,
        currentUser: null,
        isAuthenticated: false,
      })
    }
  },

  syncUser: async () => {
    const token = get().authToken
    if (!token) return

    try {
      const { authService } = await import('@/services/auth.service')
      const response = await authService.getMe()
      set({ currentUser: response.data.user })
    } catch (error) {
      await get().logoutUser()
    }
  },
}))
