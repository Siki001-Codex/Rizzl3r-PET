import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import WeighbridgePage from './pages/WeighbridgePage'
import { getAuthSession } from './lib/api'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = getAuthSession()
  if (!session) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  const [_ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/weighbridge"
        element={
          <RequireAuth>
            <WeighbridgePage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

