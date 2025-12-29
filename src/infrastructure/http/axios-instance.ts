import { apiEndpoints } from '@/api/apiEndpoints'
import { environment } from '@/api/environment'
import type { AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    const skipRefreshUrls = [
      '/auth/refresh',
      '/auth/me',
      '/auth/login',
      '/auth/signup',
    ]
    const shouldSkipRefresh = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url)
    )

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      console.info('[axios] 401 received, attempting token refresh')
      if (isRefreshing) {
        console.info('[axios] Refresh in progress, queueing request')
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return axiosInstance(originalRequest)
          })
          .catch((error) => {
            return Promise.reject(error)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.info('[axios] Refresh request start')
        await axiosInstance.post(
          apiEndpoints.auth.refresh,
          {},
          {
            withCredentials: true,
          }
        )

        console.info('[axios] Refresh request success')
        processQueue()
        isRefreshing = false

        return axiosInstance(originalRequest)
      } catch (refreshError: unknown) {
        console.error('[axios] Token refresh failed:', refreshError)
        processQueue(refreshError)
        isRefreshing = false

        let refreshStatus: number | undefined
        if (
          typeof refreshError === 'object' &&
          refreshError !== null &&
          'response' in refreshError &&
          typeof (refreshError as { response?: { status?: number } })
            .response === 'object' &&
          (refreshError as { response?: { status?: number } }).response !== null
        ) {
          refreshStatus = (refreshError as { response?: { status?: number } })
            .response?.status
        }

        if (refreshStatus === 401 || refreshStatus === 403) {
          const { useAuthStore } = await import('@/domain/auth/auth.store')
          setTimeout(() => {
            useAuthStore.getState().logout(true)
          }, 1000)
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export { axiosInstance }
