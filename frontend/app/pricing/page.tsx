import Link from 'next/link'

export default function PricingPage() {
  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 19,
      priceAnnual: 180,
      credits: 15,
      campaigns: '~7',
      features: [
        'Full access to all features',
        'All ad types and angles',
        'Download & export',
        'Email support',
        'Campaign history (30 days)'
      ],
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      priceMonthly: 49,
      priceAnnual: 468,
      credits: 50,
      campaigns: '~33',
      features: [
        'Full access to all features',
        'All ad types and angles',
        'Brand presets',
        'API access',
        'Email support',
        'Priority support'
      ],
      popular: false,
      decoy: true
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 99,
      priceAnnual: 948,
      credits: 100,
      campaigns: '~100',
      features: [
        'Full access to all features',
        'All ad types and angles',
        'Brand presets',
        'API access',
        'Team seats (5 users)',
        'Advanced analytics',
        'Priority 24h support',
        '1:1 onboarding call'
      ],
      popular: true
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            High-CTR ads in 60 seconds. For affiliates, by affiliates.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`card relative ${
                tier.popular ? 'ring-2 ring-primary-500 shadow-xl' : ''
              } ${tier.decoy ? 'opacity-90' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${tier.priceMonthly}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">
                  or ${tier.priceAnnual}/year <span className="text-green-600">(save 20%)</span>
                </p>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {tier.credits} credits/mo
                  </div>
                  <div className="text-sm text-gray-600">
                    {tier.campaigns} campaigns
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={`block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Start Free Trial
              </Link>

              {tier.decoy && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  (Rarely purchased)
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Extra Credits */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Need Extra Credits?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">5 Credits</div>
              <div className="text-2xl font-semibold mb-4">$2.99</div>
              <p className="text-sm text-gray-600">~1 campaign</p>
            </div>

            <div className="card text-center ring-2 ring-primary-300">
              <div className="text-xs font-semibold text-primary-600 uppercase mb-2">Most Popular</div>
              <div className="text-3xl font-bold text-primary-600 mb-2">20 Credits</div>
              <div className="text-2xl font-semibold mb-4">$9.99</div>
              <p className="text-sm text-gray-600">~13 campaigns</p>
            </div>

            <div className="card text-center">
              <div className="text-xs font-semibold text-green-600 uppercase mb-2">Best Value</div>
              <div className="text-3xl font-bold text-primary-600 mb-2">100 Credits</div>
              <div className="text-2xl font-semibold mb-4">$39.99</div>
              <p className="text-sm text-gray-600">~100 campaigns</p>
            </div>
          </div>
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Money-Back Guarantee</h3>
          <p className="text-gray-700">
            Not happy with your ads? We'll refund your first month, no questions asked.
            We're confident you'll love them because we built this for ourselves first.
          </p>
        </div>
      </div>
    </main>
  )
}
