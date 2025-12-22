import { environment } from '@/api/environment'
import { useAuthStore } from '@/domain/auth/auth.store'
import { io, Socket } from 'socket.io-client'
import type {
  ChainOfThoughtsEvent,
  MessageChunkEvent,
  MessageEvent,
  MessageProgressEvent,
  SendMessageRequest,
} from './websocket.types'

class WebSocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { isAuthenticated } = useAuthStore.getState()

      if (!isAuthenticated) {
        reject(new Error('User not authenticated'))
        return
      }

      const wsUrl = environment.apiBaseUrl.replace('/api/v1', '')

      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 30000,
        forceNew: true,
        withCredentials: true,
      })

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('connected', (data) => {
        console.log('[WebSocket] Server confirmed connection:', data)
      })

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection failed:', error.message)
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason)

        if (reason === 'io server disconnect') {
          this.handleReconnect()
        }
      })

      this.socket.on('error', (error) => {
        console.error('[WebSocket] Socket error:', error)
      })

      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('WebSocket connection timeout'))
        }
      }, 15000)
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `[WebSocket] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )

      setTimeout(() => {
        if (this.socket) {
          this.socket.connect()
        }
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('[WebSocket] Max reconnection attempts reached')
    }
  }

  sendMessage(data: SendMessageRequest): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('WebSocket not connected'))
        return
      }

      const messageId = `msg_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      const handleReceived = (event: MessageEvent) => {
        if (event.messageId === messageId) {
          resolve(event.messageId)
          cleanup()
        }
      }

      const handleError = (event: MessageEvent) => {
        if (event.messageId === messageId) {
          cleanup()
          reject(new Error(event.error?.message || 'Message failed'))
        }
      }

      const cleanup = () => {
        this.socket?.off('message:received', handleReceived)
        this.socket?.off('message:error', handleError)
      }

      this.socket.on('message:received', handleReceived)
      this.socket.on('message:error', handleError)

      this.socket.emit('message:create', {
        ...data,
        messageId,
      })

      setTimeout(() => {
        cleanup()
        reject(new Error('Message sending timeout'))
      }, 30000)
    })
  }

  onMessageProgress(callback: (progress: MessageProgressEvent) => void) {
    this.socket?.on('message:progress', callback)
  }

  onMessageProcessing(callback: (event: MessageEvent) => void) {
    this.socket?.on('message:processing', callback)
  }

  onMessageCompleted(callback: (event: MessageEvent) => void) {
    this.socket?.on('message:completed', callback)
  }

  onMessageError(callback: (event: MessageEvent) => void) {
    this.socket?.on('message:error', callback)
  }

  onMessageChunk(callback: (chunk: MessageChunkEvent) => void) {
    this.socket?.on('message:chunk', callback)
  }

  onChainOfThoughts(callback: (data: ChainOfThoughtsEvent) => void) {
    this.socket?.on('message:chain_of_thoughts', callback)
  }

  offMessageProgress(callback?: (progress: MessageProgressEvent) => void) {
    this.socket?.off('message:progress', callback)
  }

  offMessageProcessing(callback?: (event: MessageEvent) => void) {
    this.socket?.off('message:processing', callback)
  }

  offMessageCompleted(callback?: (event: MessageEvent) => void) {
    this.socket?.off('message:completed', callback)
  }

  offMessageError(callback?: (event: MessageEvent) => void) {
    this.socket?.off('message:error', callback)
  }

  offMessageChunk(callback?: (chunk: MessageChunkEvent) => void) {
    this.socket?.off('message:chunk', callback)
  }

  offChainOfThoughts(callback?: (data: ChainOfThoughtsEvent) => void) {
    this.socket?.off('message:chain_of_thoughts', callback)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected'
    return this.socket.connected ? 'connected' : 'disconnected'
  }
}

export const webSocketClient = new WebSocketClient()
