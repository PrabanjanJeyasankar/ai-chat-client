import { environment } from '@/api/environment'
import { authStore } from '@/store/auth.store'
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = authStore.getState().authToken
    config.headers = config.headers ?? {}

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logoutUser()
    }

    return Promise.reject(error)
  }
)

export { axiosInstance }
