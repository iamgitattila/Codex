import { useQuery } from '@tanstack/react-query'
import { certificatesAPI } from '@/lib/api'
import { Download, Share2, Award } from 'lucide-react'

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const response = await certificatesAPI.getMyCertificates()
      return response.data
    },
  })

  const handleDownload = async (certificateId: number, certificateNumber: string) => {
    try {
      const response = await certificatesAPI.download(certificateId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `certificate_${certificateNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download certificate')
    }
  }

  const handleShare = (verificationCode: string) => {
    const url = `${window.location.origin}/verify/${verificationCode}`
    navigator.clipboard.writeText(url)
    alert('Verification link copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading certificates...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-gray-600 mt-2">Download and share your achievements</p>
        </div>

        {certificates && certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Award className="h-8 w-8 text-primary-600" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2">{cert.course_title}</h3>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-semibold text-green-600">{cert.exam_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certificate No:</span>
                    <span className="font-mono text-xs">{cert.certificate_number}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(cert.id, cert.certificate_number)}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleShare(cert.verification_code)}
                    className="btn btn-outline flex items-center justify-center"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Verification code: <span className="font-mono">{cert.verification_code.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No certificates yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Complete a course and pass the exam to earn your first certificate
            </p>
            <a href="/courses" className="btn btn-primary">
              Browse Courses
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
