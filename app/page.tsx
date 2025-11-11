export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            AI Mastery for Teams
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn AI skills. Get certified. Level up your team.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Start Free Trial
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              View Courses
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">🎓 Structured Learning</h3>
            <p className="text-gray-600">
              Curated AI courses with video lessons, quizzes, and hands-on projects
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">📜 Certifications</h3>
            <p className="text-gray-600">
              Get recognized certificates upon course completion to boost your career
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">👥 Team Plans</h3>
            <p className="text-gray-600">
              Upskill your entire team with corporate subscriptions and analytics
            </p>
          </div>
        </div>

        {/* Course Preview */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "ChatGPT for Business",
                level: "Beginner",
                duration: "3 hours",
                description: "Master ChatGPT for business use cases and productivity"
              },
              {
                title: "Prompt Engineering Mastery",
                level: "Intermediate",
                duration: "4 hours",
                description: "Learn advanced prompt engineering techniques"
              },
              {
                title: "AI Tools for Marketing",
                level: "Intermediate",
                duration: "3.5 hours",
                description: "Leverage AI tools for content creation and marketing"
              }
            ].map((course, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {course.level}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {course.duration}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm">{course.description}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-12">Start learning today from $29/month</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            View Pricing Plans
          </button>
        </div>
      </div>
    </main>
  );
}
