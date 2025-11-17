import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-primary-600">
            BannersLanders AI
          </div>
          <div className="space-x-4">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            High-CTR Ads in{' '}
            <span className="text-primary-600">60 Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            For Affiliates. By Affiliates.
          </p>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Generate high-converting ad copy and visuals specifically optimized for affiliate marketers.
            Built by top affiliates who know what actually works.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/pricing" className="btn-secondary text-lg px-8 py-4">
              View Pricing
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card text-left">
              <div className="text-primary-600 text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate 5-10 proven ad variations with matching images in under 60 seconds.
              </p>
            </div>

            <div className="card text-left">
              <div className="text-primary-600 text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Affiliate-Optimized</h3>
              <p className="text-gray-600">
                Built-in proven angles: curiosity gaps, FOMO, social proof, and specific claims that convert.
              </p>
            </div>

            <div className="card text-left">
              <div className="text-primary-600 text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Platform-Ready</h3>
              <p className="text-gray-600">
                Optimized for Facebook, TikTok, Google, and native ads with proper character limits.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 p-8 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600 italic mb-4">
              "We tested thousands of ad variations across our own campaigns.
              We know what works. Now you get the same proven playbooks."
            </p>
            <p className="font-semibold text-gray-900">
              - The BannersLanders Team
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 BannersLanders AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
