import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { coursesAPI, paymentsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { CheckCircle, Clock, Award, BookOpen } from 'lucide-react'
import { useState } from 'react'

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const [purchasing, setPurchasing] = useState(false)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const response = await coursesAPI.getBySlug(slug!)
      return response.data
    },
  })

  const { data: enrollmentStatus } = useQuery({
    queryKey: ['enrollment', course?.id],
    queryFn: async () => {
      const response = await coursesAPI.checkEnrollment(course!.id)
      return response.data
    },
    enabled: !!course?.id && isAuthenticated,
  })

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setPurchasing(true)
    try {
      const response = await paymentsAPI.createCheckoutSession(course!.id)
      window.location.href = response.data.checkout_url
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Failed to start checkout. Please try again.')
      setPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading course...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Course not found</div>
      </div>
    )
  }

  const isEnrolled = enrollmentStatus?.enrolled

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold capitalize mb-4">
              {course.level}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-primary-100 mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-6 text-primary-100">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{course.exam_duration} min exam</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Certificate included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <div className="prose max-w-none">
                {course.learning_outcomes?.split('\n').map((outcome, i) => (
                  outcome.trim() && (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{outcome.trim().replace(/^-\s*/, '')}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="prose max-w-none whitespace-pre-line">
                {course.syllabus}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  ${course.price}
                </div>
                <p className="text-gray-600">One-time payment</p>
              </div>

              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                    You're enrolled in this course!
                  </div>
                  <Link to="/dashboard" className="btn btn-primary w-full">
                    Go to Dashboard
                  </Link>
                  <Link to={`/exam/${course.id}`} className="btn btn-outline w-full">
                    Take Exam
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  className="btn btn-primary w-full mb-4"
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Enroll Now'}
                </button>
              )}

              <div className="border-t pt-4 mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Professional certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited exam retakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
