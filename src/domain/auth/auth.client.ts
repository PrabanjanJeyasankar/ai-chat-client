import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/infrastructure/http/axios-instance'
import type {
  AuthResponse,
  LoginRequest,
  MeResponse,
  SignupRequest,
} from './auth.types'

export const authClient = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      apiEndpoints.auth.signup,
      data
    )
    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      apiEndpoints.auth.login,
      data
    )
    return response.data
  },

  getProfile: async (): Promise<MeResponse> => {
    const response = await axiosInstance.get<MeResponse>(apiEndpoints.auth.me)
    return response.data
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      apiEndpoints.auth.refresh,
      {},
      { withCredentials: true }
    )
    return response.data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(
      apiEndpoints.auth.logout,
      {},
      { withCredentials: true }
    )
  },
}
