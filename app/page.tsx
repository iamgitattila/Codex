import Link from 'next/link';
import { Brain, Trophy, Target, Sparkles, Users, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 text-transparent bg-clip-text">
              NeuroLearn
            </span>
          </div>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-md"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
            Learning That Adapts to Your Unique Brain
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered coaching and educational tools designed specifically for neurodivergent learners.
            Build skills, track progress, and unlock your potential.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-lg text-lg font-semibold"
            >
              Start Learning Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition shadow-lg text-lg font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white/80 backdrop-blur-sm py-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">15-20%</div>
              <div className="text-gray-600">of population is neurodivergent</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-gray-600">Personalized learning modules</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">AI-Powered</div>
              <div className="text-gray-600">Adaptive coaching system</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Built for Neurodivergent Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-primary-600" />}
            title="Personalized Learning Paths"
            description="Customized content for ADHD, Autism, Dyslexia, and more. Learn in a way that works with your brain, not against it."
          />
          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-purple-600" />}
            title="AI Coaching"
            description="Get real-time, personalized feedback and encouragement from our AI coach that understands neurodivergent learning styles."
          />
          <FeatureCard
            icon={<Trophy className="h-10 w-10 text-yellow-600" />}
            title="Gamification"
            description="Earn points, badges, and maintain streaks. Stay motivated with engaging rewards designed to work with your brain."
          />
          <FeatureCard
            icon={<Target className="h-10 w-10 text-green-600" />}
            title="Progress Tracking"
            description="Visual dashboards show your growth and achievements. See your progress in ways that make sense to you."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-pink-600" />}
            title="Parent Dashboard"
            description="Parents and guardians can monitor progress and celebrate achievements together with their learners."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-blue-600" />}
            title="Adaptive Content"
            description="Content difficulty adjusts based on performance. Always learning at the right level for you."
          />
        </div>
      </section>

      {/* Neurodivergent Types Section */}
      <section className="bg-white/80 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Supporting All Neurodivergent Profiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProfileCard
              title="ADHD"
              description="Focus techniques, organization strategies, and time management tools"
              color="blue"
            />
            <ProfileCard
              title="Autism Spectrum"
              description="Social skills, sensory support, and communication strategies"
              color="purple"
            />
            <ProfileCard
              title="Dyslexia"
              description="Reading strategies, phonics practice, and comprehension tools"
              color="green"
            />
            <ProfileCard
              title="Mixed & Other"
              description="Customized approaches combining multiple strategies"
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Unlock Your Potential?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of neurodivergent learners who are thriving with personalized education.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition shadow-lg text-lg font-semibold"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">NeuroLearn</span>
          </div>
          <p className="text-gray-400">
            Empowering neurodivergent learners with personalized education
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2024 NeuroLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ProfileCard({ title, description, color }: { title: string; description: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}
