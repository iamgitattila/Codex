/**
 * TRIPWIRE CONFIGURATION
 *
 * Easily swap between different tripwire offers by changing the ACTIVE_TRIPWIRE constant.
 * Add new tripwires to the TRIPWIRES object below.
 *
 * Change ACTIVE_TRIPWIRE to: 'tripwire1', 'tripwire2', or 'tripwire3'
 */

const ACTIVE_TRIPWIRE = 'tripwire1'; // <-- CHANGE THIS TO SWAP OFFERS

const TRIPWIRES = {
  tripwire1: {
    id: 'tripwire1',
    name: 'Ultimate Productivity Checklist',
    price: 4.95,
    headline: 'Get More Done in Less Time',
    subheadline: 'The proven daily checklist used by 10,000+ entrepreneurs',
    description: 'Stop wasting time on tasks that don\'t move the needle. This battle-tested checklist helps you prioritize what matters and eliminate busy work.',
    benefits: [
      'Focus on high-impact tasks every single day',
      'Cut your work time by 40% while increasing output',
      'Never miss important deadlines again',
      'Reduce decision fatigue and mental overwhelm',
      'Wake up knowing exactly what to do'
    ],
    bullets: [
      '✓ Morning routine optimization framework',
      '✓ Priority matrix template (Eisenhower method)',
      '✓ Time-blocking worksheet',
      '✓ Weekly review system',
      '✓ Digital & printable versions'
    ],
    urgency: 'Limited time offer: Only $4.95 (Reg. $29)',
    cta: 'Yes! Give Me The Checklist',
    image: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Productivity+Checklist',
    guarantee: '30-day money-back guarantee. If you don\'t save at least 5 hours in your first week, we\'ll refund every penny.'
  },

  tripwire2: {
    id: 'tripwire2',
    name: 'Email Subject Line Swipe File',
    price: 4.95,
    headline: 'Double Your Email Open Rates Overnight',
    subheadline: '127 proven subject lines that get clicked every time',
    description: 'Your emails are invisible if nobody opens them. This swipe file contains the exact subject lines that generated millions in revenue for top marketers.',
    benefits: [
      'Instantly boost open rates by 50-200%',
      'Stop guessing what works (these are proven winners)',
      'Get more clicks, leads, and sales from existing list',
      'Save hours of copywriting time',
      'Works for any niche or industry'
    ],
    bullets: [
      '✓ 127 high-converting subject lines',
      '✓ Organized by category (curiosity, urgency, benefit-driven)',
      '✓ Performance data for each template',
      '✓ Customization guide included',
      '✓ Instant download (PDF + spreadsheet)'
    ],
    urgency: 'Special Launch Price: Just $4.95 (Going up to $19 soon)',
    cta: 'Yes! Send Me The Swipe File',
    image: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Email+Swipe+File',
    guarantee: 'Risk-free guarantee: If these subject lines don\'t improve your open rates within 30 days, get a full refund.'
  },

  tripwire3: {
    id: 'tripwire3',
    name: 'Social Media Content Calendar',
    price: 4.95,
    headline: 'Never Run Out of Content Ideas Again',
    subheadline: '90 days of done-for-you content prompts and posting schedules',
    description: 'Staring at a blank screen wondering what to post? This pre-planned content calendar gives you 3 months of engaging posts in any niche.',
    benefits: [
      'Post consistently without the stress',
      'Engage your audience with proven content types',
      'Save 10+ hours per month on content planning',
      'Grow your following on autopilot',
      'Works for Instagram, Facebook, LinkedIn & Twitter'
    ],
    bullets: [
      '✓ 90 days of content prompts (270+ post ideas)',
      '✓ Optimal posting times for each platform',
      '✓ Engagement-boosting caption templates',
      '✓ Hashtag strategy guide',
      '✓ Editable spreadsheet format'
    ],
    urgency: 'Flash Sale: Grab it for $4.95 before price increases',
    cta: 'Yes! I Want The Content Calendar',
    image: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Content+Calendar',
    guarantee: '100% satisfaction guaranteed. If this doesn\'t make content creation easier, we\'ll refund you immediately.'
  }
};

// Survey configuration
const SURVEY_CONFIG = {
  progressBar: true,
  showQuestionNumbers: true,
  requireAllAnswers: false, // Set to true to force all questions to be answered

  // Survey questions
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What\'s your biggest challenge right now?',
      options: [
        'Not enough time in the day',
        'Struggling to get consistent results',
        'Don\'t know what to focus on',
        'Feeling overwhelmed and stuck'
      ],
      required: true
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'How much time do you spend on this problem each week?',
      options: [
        '1-2 hours (minor annoyance)',
        '3-5 hours (moderate problem)',
        '6-10 hours (major issue)',
        '10+ hours (critical priority)'
      ],
      required: true
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What would solving this problem be worth to you?',
      options: [
        '$0-$100 (nice to have)',
        '$100-$500 (important)',
        '$500-$1,000 (very important)',
        '$1,000+ (game-changer)'
      ],
      required: false
    }
  ]
};

// Analytics tracking
const ANALYTICS_CONFIG = {
  enabled: true,
  trackPageView: true,
  trackSurveyStart: true,
  trackSurveyProgress: true,
  trackSurveyComplete: true,
  trackOfferView: true,
  trackOfferClick: true,
  storageKey: 'tripwire_analytics'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ACTIVE_TRIPWIRE, TRIPWIRES, SURVEY_CONFIG, ANALYTICS_CONFIG };
}
