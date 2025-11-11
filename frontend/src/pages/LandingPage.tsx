import { Link } from 'react-router-dom'
import { CheckCircle, Award, Users, TrendingUp, Star, Shield } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Industry-Recognized Certificates',
      description: 'Earn certificates that employers trust and value',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Expert-Designed Content',
      description: 'Learn from industry professionals and AI experts',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Career Advancement',
      description: 'Boost your career with in-demand AI skills',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Verified Credentials',
      description: 'Shareable certificates with QR code verification',
    },
  ]

  const courses = [
    {
      title: 'AI Fundamentals',
      price: '$49',
      level: 'Beginner',
      features: ['Core AI concepts', 'Machine Learning basics', 'Neural networks', 'Real-world applications'],
    },
    {
      title: 'Prompt Engineering Professional',
      price: '$99',
      level: 'Intermediate',
      features: ['Advanced prompting', 'ChatGPT & Claude mastery', 'Chain of thought', 'Business applications'],
      popular: true,
    },
    {
      title: 'AI for Business Leaders',
      price: '$149',
      level: 'Advanced',
      features: ['AI strategy', 'ROI measurement', 'Team management', 'Ethics & governance'],
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'The AI Fundamentals certification helped me land my dream job. The content is practical and easy to understand.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      content: 'Prompt Engineering Professional gave me the skills to leverage AI in my daily work. ROI was immediate!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Business Analyst',
      content: 'As a business leader, the AI for Business course gave me the strategic insights I needed to drive AI adoption.',
      rating: 5,
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get Certified in AI Skills
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Professional AI certifications that validate your skills and boost your career.
              Trusted by 10,000+ professionals worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg">
                Browse Courses
              </Link>
              <Link to="/register" className="btn btn-outline border-white text-white hover:bg-white/10 text-lg">
                Get Started Free
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-100">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>5,000+ Certificates Issued</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose AI Certified?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Certification Path
            </h2>
            <p className="text-xl text-gray-600">
              Select the course that matches your career goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div
                key={index}
                className={`card relative ${
                  course.popular ? 'ring-2 ring-primary-600 shadow-xl' : ''
                }`}
              >
                {course.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-sm text-primary-600 font-semibold mb-2">
                    {course.level}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                  <div className="text-4xl font-bold text-primary-600">
                    {course.price}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {course.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/courses"
                  className={`btn w-full ${
                    course.popular ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  Enroll Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Certified?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join 10,000+ professionals who have advanced their careers with AI certifications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg">
              Start Learning Today
            </Link>
            <Link to="/courses" className="btn btn-outline border-white text-white hover:bg-white/10 text-lg">
              View All Courses
            </Link>
          </div>

          {/* Money-back guarantee */}
          <div className="mt-8 flex items-center justify-center gap-2 text-primary-100">
            <Shield className="h-5 w-5" />
            <span>30-Day Money-Back Guarantee</span>
          </div>
        </div>
      </section>
    </div>
  )
}
