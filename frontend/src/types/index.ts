export interface User {
  id: number
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
}

export interface Course {
  id: number
  title: string
  slug: string
  description: string
  short_description?: string
  price: number
  level: string
  duration: string
  pass_percentage: number
  exam_duration: number
  syllabus?: string
  learning_outcomes?: string
  is_published: boolean
  created_at?: string
}

export interface ExamQuestion {
  id: number
  question_text: string
  options: string[]
}

export interface ExamAttempt {
  id: number
  course_id: number
  score: number
  passed: boolean
  started_at: string
  completed_at: string
}

export interface Certificate {
  id: number
  certificate_number: string
  verification_code: string
  issued_at: string
  exam_score: number
  course_title: string
  student_name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}
