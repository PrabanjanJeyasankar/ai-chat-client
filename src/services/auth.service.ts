import { apiEndpoints } from '@/api/apiEndpoints'
import type { UserProfile } from '@/store/auth.store'
import { axiosInstance } from '../lib/axiosInstance'

export type SignupRequest = {
  email: string
  password: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthSuccessResponse = {
  success: boolean
  message: string
  data: {
    user: {
      id: string
      email: string
    }
    accessToken: string
  }
}

export type MeResponse = {
  success: boolean
  message: string
  data: {
    user: UserProfile
  }
}

async function signup(
  requestData: SignupRequest
): Promise<AuthSuccessResponse> {
  const response = await axiosInstance.post<AuthSuccessResponse>(
    apiEndpoints.auth.signup,
    requestData
  )

  return response.data
}

async function login(requestData: LoginRequest): Promise<AuthSuccessResponse> {
  const response = await axiosInstance.post<AuthSuccessResponse>(
    apiEndpoints.auth.login,
    requestData
  )

  return response.data
}

async function getMe(): Promise<MeResponse> {
  const response = await axiosInstance.get<MeResponse>(apiEndpoints.auth.me)
  return response.data
}

async function refreshToken(): Promise<AuthSuccessResponse> {
  const response = await axiosInstance.post<AuthSuccessResponse>(
    apiEndpoints.auth.refresh,
    {},
    { withCredentials: true }
  )
  return response.data
}

async function logout(): Promise<void> {
  await axiosInstance.post(
    apiEndpoints.auth.logout,
    {},
    { withCredentials: true }
  )
}

export const authService = {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
}
