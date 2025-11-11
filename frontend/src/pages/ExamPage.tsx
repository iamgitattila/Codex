import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { examsAPI, coursesAPI } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

export default function ExamPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [started, setStarted] = useState(false)

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await coursesAPI.getById(Number(courseId))
      return response.data
    },
  })

  const { data: questions } = useQuery({
    queryKey: ['exam-questions', courseId],
    queryFn: async () => {
      const response = await examsAPI.getQuestions(Number(courseId))
      return response.data
    },
    enabled: started,
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await examsAPI.submitExam(Number(courseId), answers)
    },
    onSuccess: (response) => {
      const result = response.data
      navigate('/dashboard', {
        state: {
          examResult: {
            score: result.score,
            passed: result.passed,
          },
        },
      })
    },
  })

  useEffect(() => {
    if (started && course) {
      setTimeLeft(course.exam_duration * 60)
    }
  }, [started, course])

  useEffect(() => {
    if (timeLeft > 0 && started) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, started])

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex })
  }

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam?')) {
      submitMutation.mutate()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions?.length || 0

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="card">
            <h1 className="text-3xl font-bold mb-4">Ready to take the exam?</h1>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Duration:</strong> {course?.exam_duration} minutes
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Passing Score:</strong> {course?.pass_percentage}%
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Note:</strong> You can retake the exam after 24 hours if you don't pass
                </div>
              </div>
            </div>
            <button onClick={() => setStarted(true)} className="btn btn-primary w-full">
              Start Exam
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Timer and Progress */}
        <div className="card mb-6 sticky top-20 z-10 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                <span className="text-lg font-semibold">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {answeredCount} / {totalQuestions} answered
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions?.map((question, index) => (
            <div key={question.id} className="card">
              <div className="mb-4">
                <span className="text-sm text-gray-500">Question {index + 1}</span>
                <h3 className="text-lg font-semibold mt-1">{question.question_text}</h3>
              </div>

              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[question.id] === optionIndex
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswerSelect(question.id, optionIndex)}
                      className="mt-1"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
