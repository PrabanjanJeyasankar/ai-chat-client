export type UserProfile = {
  id: string
  email: string
  name?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SignupRequest = {
  email: string
  password: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  success: boolean
  message: string
  data: {
    user: {
      id: string
      email: string
    }
  }
}

export type MeResponse = {
  success: boolean
  message: string
  data: {
    user: UserProfile
  }
}
