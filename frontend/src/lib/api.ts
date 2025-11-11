import axios from 'axios'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Course,
  ExamQuestion,
  ExamAttempt,
  Certificate,
} from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<User>('/auth/me'),
}

// Courses API
export const coursesAPI = {
  getAll: () => api.get<Course[]>('/courses/'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  getBySlug: (slug: string) => api.get<Course>(`/courses/slug/${slug}`),
  checkEnrollment: (courseId: number) =>
    api.get<{ enrolled: boolean }>(`/courses/${courseId}/enrolled`),
}

// Exams API
export const examsAPI = {
  getQuestions: (courseId: number) =>
    api.get<ExamQuestion[]>(`/exams/${courseId}/questions`),
  submitExam: (courseId: number, answers: Record<number, number>) =>
    api.post<ExamAttempt>(`/exams/${courseId}/submit`, { answers }),
  getAttempts: (courseId: number) =>
    api.get<ExamAttempt[]>(`/exams/${courseId}/attempts`),
}

// Certificates API
export const certificatesAPI = {
  getMyCertificates: () => api.get<Certificate[]>('/certificates/my-certificates'),
  getById: (id: number) => api.get<Certificate>(`/certificates/${id}`),
  verify: (code: string) => api.get<Certificate>(`/certificates/verify/${code}`),
  download: (id: number) =>
    api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
}

// Payments API
export const paymentsAPI = {
  createCheckoutSession: (courseId: number) =>
    api.post<{ checkout_url: string; session_id: string }>(
      '/payments/create-checkout-session',
      null,
      { params: { course_id: courseId } }
    ),
  checkSession: (sessionId: string) =>
    api.get<{ status: string; enrollment_id?: number }>(
      `/payments/check-session/${sessionId}`
    ),
}

export default api
