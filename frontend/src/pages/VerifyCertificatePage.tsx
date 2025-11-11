import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { certificatesAPI } from '@/lib/api'
import { Award, CheckCircle, XCircle } from 'lucide-react'

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>()

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['verify-certificate', code],
    queryFn: async () => {
      const response = await certificatesAPI.verify(code!)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Verifying certificate...</div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
          <p className="text-gray-600">
            This certificate could not be verified. Please check the verification code and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="card">
          {/* Success Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Certificate Verified</h1>
            <p className="text-gray-600">This is a valid AI Certification Platform certificate</p>
          </div>

          {/* Certificate Details */}
          <div className="border-t border-b py-6 my-6 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Student Name:</span>
              <span className="font-semibold text-right">{certificate.student_name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold text-right">{certificate.course_title}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Certificate Number:</span>
              <span className="font-mono text-right">{certificate.certificate_number}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Exam Score:</span>
              <span className="font-semibold text-green-600 text-right">{certificate.exam_score}%</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Issue Date:</span>
              <span className="font-semibold text-right">
                {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Verification Code:</span>
              <span className="font-mono text-sm text-right break-all">{certificate.verification_code}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
              <Award className="h-5 w-5" />
              <span className="font-semibold">AI Certification Platform</span>
            </div>
            <p className="text-sm text-gray-500">
              This certificate verifies that the holder has successfully completed the course and passed the examination.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
