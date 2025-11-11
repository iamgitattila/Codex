import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { authAPI } from './lib/api'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import DashboardPage from './pages/DashboardPage'
import ExamPage from './pages/ExamPage'
import CertificatesPage from './pages/CertificatesPage'
import VerifyCertificatePage from './pages/VerifyCertificatePage'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const { setAuth, token } = useAuthStore()

  useEffect(() => {
    if (token) {
      authAPI.getMe().then((res) => {
        setAuth(res.data, token)
      }).catch(() => {
        useAuthStore.getState().logout()
      })
    }
  }, [token])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:slug" element={<CourseDetailPage />} />
        <Route path="verify/:code" element={<VerifyCertificatePage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="exam/:courseId" element={<ExamPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
