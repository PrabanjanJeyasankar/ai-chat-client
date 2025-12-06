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
  logoutUser: () => void
  syncUser: () => Promise<void>
}

function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem('authToken')
  } catch {
    return null
  }
}

export const authStore = create<AuthState>((set, get) => ({
  authToken: getStoredToken(),
  currentUser: null,
  isAuthenticated: getStoredToken() !== null,

  setAuthToken: (token: string | null) => {
    if (token) {
      sessionStorage.setItem('authToken', token)
    } else {
      sessionStorage.removeItem('authToken')
    }

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

  logoutUser: () => {
    sessionStorage.removeItem('authToken')

    set({
      authToken: null,
      currentUser: null,
      isAuthenticated: false,
    })
  },

  syncUser: async () => {
    const token = getStoredToken()
    if (!token) return

    try {
      const { authService } = await import('@/services/auth.service')
      const response = await authService.getMe()
      set({ currentUser: response.data.user })
    } catch (error) {
      console.error('Failed to sync user', error)
      // If token is invalid, force logout
      get().logoutUser()
    }
  },
}))
