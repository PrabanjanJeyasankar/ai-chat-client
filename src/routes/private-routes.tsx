import { type RouteObject } from 'react-router-dom'

import ChatPage from '@/pages/chat/ChatPage'
import { ProtectedRoute } from './ProtectedRoutes'

export const privateRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/chat', element: <ChatPage /> },
      { path: '/chat/:chatId', element: <ChatPage /> },
    ],
  },
]
