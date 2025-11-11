import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { certificatesAPI, examsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Award, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const location = useLocation()
  const [examResult, setExamResult] = useState<any>(null)

  useEffect(() => {
    if (location.state?.examResult) {
      setExamResult(location.state.examResult)
      // Clear the state
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const { data: certificates } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const response = await certificatesAPI.getMyCertificates()
      return response.data
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.full_name}!</h1>
          <p className="text-gray-600 mt-2">Track your progress and manage your certifications</p>
        </div>

        {/* Exam Result Alert */}
        {examResult && (
          <div className={`card mb-8 ${examResult.passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
            <div className="flex items-start gap-4">
              {examResult.passed ? (
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {examResult.passed ? 'Congratulations!' : 'Keep Trying!'}
                </h2>
                <p className="text-lg mb-4">
                  {examResult.passed
                    ? `You passed with a score of ${examResult.score.toFixed(1)}%! Your certificate has been issued.`
                    : `You scored ${examResult.score.toFixed(1)}%. You need 70% to pass. You can retake the exam after 24 hours.`}
                </p>
                {examResult.passed && (
                  <Link to="/certificates" className="btn btn-primary">
                    View Certificate
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Award className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificates?.length || 0}</div>
                <div className="text-gray-600">Certificates Earned</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificates?.length || 0}</div>
                <div className="text-gray-600">Courses Completed</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {certificates?.reduce((sum, cert) => sum + cert.exam_score, 0) / (certificates?.length || 1) || 0}%
                </div>
                <div className="text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Certificates</h2>
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>

          {certificates && certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{cert.course_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Certificate No: {cert.certificate_number}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Score: <strong className="text-green-600">{cert.exam_score}%</strong>
                        </span>
                        <span className="text-gray-600">
                          Issued: {new Date(cert.issued_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/certificates"
                        className="btn btn-outline text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No certificates yet</p>
              <Link to="/courses" className="btn btn-primary">
                Start a Course
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
