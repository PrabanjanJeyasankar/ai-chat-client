import { BrowserRouter, Navigate, useRoutes } from 'react-router-dom'
import { privateRoutes } from './private-routes'
import { publicRoutes } from './public-routes'

function AppRoutesInner() {
  return useRoutes([
    ...publicRoutes,
    ...privateRoutes,
    { path: '/', element: <Navigate to='/login' replace /> },
    { path: '*', element: <Navigate to='/login' replace /> },
  ])
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AppRoutesInner />
    </BrowserRouter>
  )
}
