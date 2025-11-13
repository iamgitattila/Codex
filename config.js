/**
 * TRIPWIRE CONFIGURATION - BLACKHAT CONVERSION EDITION
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
    name: 'The 6-Figure Productivity Blueprint',
    price: 4.95,
    headline: 'WARNING: You\'re Bleeding $847/Week Without This...',
    subheadline: 'The underground "time-hacking" system 47,381 entrepreneurs use to reclaim 23+ hours per week (while their competitors burn out)',
    description: 'Let me be brutally honest: Every minute you waste on low-value tasks is COSTING you money. While you\'re drowning in busywork, your competition is scaling to $10K/month using this exact system. This isn\'t another "productivity tips" BS. This is the EXACT daily framework used by a private mastermind ($25K entry fee) that I\'m releasing for the first time ever.',
    benefits: [
      'ELIMINATE 87% of your to-do list (and make MORE money doing less)',
      'The "3-Hour Workday" protocol that generated $2.3M for our members',
      'Never waste another second on tasks that don\'t print money',
      'Wake up with crystal clarity on your ONE priority (this alone is worth $10K)',
      'Destroy "shiny object syndrome" that keeps you broke and distracted'
    ],
    bullets: [
      '✓ The "$10K Morning Routine" (10 minutes that determines your entire day)',
      '✓ "Revenue-First" Priority Matrix (stop doing poor people activities)',
      '✓ Time-Blocking Template used by 7-figure entrepreneurs',
      '✓ Weekly "Profit Audit" System (identify money leaks instantly)',
      '✓ Digital + Printable versions + Phone wallpaper reminder'
    ],
    urgency: '⚠️ PRICE INCREASES TO $97 IN: 23:47:16 - Grab it NOW at 95% OFF',
    cta: '🔥 YES! Give Me The Blueprint Before Price Jumps',
    image: 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=6-Figure+Blueprint',
    guarantee: 'INSANE 365-DAY GUARANTEE: Use this for a full year. If you don\'t save AT LEAST 20 hours per week and make more money with less stress, I\'ll refund you AND let you keep it. That\'s how confident I am this will change your life.'
  },

  tripwire2: {
    id: 'tripwire2',
    name: 'The Email Empire Swipe File',
    price: 4.95,
    headline: 'EXPOSED: The "Forbidden" Subject Lines Making $19K Per Email',
    subheadline: '237 unethical (but legal) subject lines banned from most courses... responsibly generating $47.2 MILLION in sales',
    description: 'Your list is DYING while you read this. Every email you send with boring subject lines is TRAINING your subscribers to ignore you. Meanwhile, the top 1% are using these "banned" psychological triggers to print money on demand. I spent $14,763 buying swipe files from the best copywriters alive. They\'re pissed I\'m releasing this, but screw it - you deserve to win. This is the EXACT swipe file used by clickbank platinum members and underground affiliate networks.',
    benefits: [
      'Deploy "Open Rate Cocaine" - subject lines with 67-91% open rates (industry average is 18%)',
      'The 11 "Forbidden Formulas" that bypass email filters AND the brain\'s defense mechanisms',
      'Copy-paste subject lines that generated $47.2M in verified sales (receipts included)',
      'Turn dead lists into ATM machines (one member made $8,943 from a "dead" list of 2,100)',
      'Works for ANY niche - we tested 127 industries (yes, even boring B2B)'
    ],
    bullets: [
      '✓ 237 PROVEN subject lines with performance data ($$ per send)',
      '✓ "Curiosity Crack" templates (92% avg open rate - INSANE)',
      '✓ The "Trojan Horse" method (sneaks past Gmail\'s promo filter)',
      '✓ "Pattern Interrupt" headlines that force opens',
      '✓ Instant download + BONUS: 50 pre-header text templates'
    ],
    urgency: '🚨 EMERGENCY: 127 copies left at $4.95 then GONE FOREVER (raising to $97)',
    cta: '💰 GIVE ME THE SWIPE FILE NOW - I Want $19K Emails',
    image: 'https://via.placeholder.com/400x300/FF6B00/FFFFFF?text=Email+Empire',
    guarantee: '"MAKE MONEY OR IT\'S FREE" GUARANTEE: Send 10 emails using these subject lines. If your open rates don\'t at least DOUBLE and you don\'t make more sales, just show me your stats and I\'ll refund you instantly + send you $20 for wasting your time. I\'m that confident.'
  },

  tripwire3: {
    id: 'tripwire3',
    name: 'Viral Content Factory System',
    price: 4.95,
    headline: 'STEAL My $37K/Month Content System (Copy-Paste Ready)',
    subheadline: '365 "engagement-hacked" posts that built a 847K following (while I slept) - used by faceless accounts making BANK',
    description: 'Stop posting into the void like a broke beginner. While you\'re wondering "what should I post today," the top 1% are using this EXACT calendar to go viral on demand. This is the same system that built @MillionaireMentor (847K), @EntrepreneurSecrets (1.2M), and 47 other accounts generating $10K-$90K per month. Zero guessing. Zero creativity needed. Just copy, paste, and watch the algorithm make you rich. This is the "cheat code" that Instagram tried to shut down.',
    benefits: [
      'POST ONCE, GO VIRAL - The 7 post types that get 10K-100K+ views EVERY. SINGLE. TIME.',
      'The "Engagement Pyramid" that forces followers to comment (algorithm LOVES this)',
      'Never stare at a blank screen again (365 posts = 1 full year of content)',
      'Grow from 0 to 50K followers in 90 days (our fastest student did it in 67 days)',
      'Monetize IMMEDIATELY - most users land their first $1K brand deal in week 3'
    ],
    bullets: [
      '✓ 365 days of VIRAL content (tested on 4.2M combined followers)',
      '✓ "Best Time to Post" secrets for each platform (this alone is worth $500)',
      '✓ "Caption Cocaine" templates (avg 847 comments per post)',
      '✓ Banned hashtag strategies (insane reach, most gurus won\'t share)',
      '✓ BONUS: "DM to Close" templates that convert followers to customers'
    ],
    urgency: '⏰ VANISHING IN 4 HOURS: This violates platform TOS (technically). Grabbing before lawyers make me take it down.',
    cta: '🚀 GIVE ME VIRAL CONTENT NOW - I Want 50K Followers',
    image: 'https://via.placeholder.com/400x300/00FF00/000000?text=Viral+Factory',
    guarantee: 'GROW OR GET PAID GUARANTEE: Use this for 90 days. If you don\'t gain at least 10,000 real followers and land at least ONE paid deal, I\'ll refund you AND pay you $50 cash for your time. Plus you keep everything. Zero risk, infinite upside.'
  }
};

// Survey configuration - PSYCHOLOGICAL TRIGGERS EDITION
const SURVEY_CONFIG = {
  progressBar: true,
  showQuestionNumbers: true,
  requireAllAnswers: false,

  // Survey questions - Pain agitation + commitment ladder
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Be honest: What\'s the REAL reason you\'re still stuck?',
      options: [
        '😰 Working 60+ hours but barely making progress (I\'m exhausted)',
        '😡 Watching others succeed with MY ideas (wtf am I doing wrong?)',
        '😵 Overwhelmed by everything - can\'t focus on ONE thing',
        '😢 Burned out and ready to quit (but I can\'t give up now)'
      ],
      required: true
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'How much is this problem ACTUALLY costing you per month?',
      options: [
        '$500-$2,000 (it\'s annoying but manageable)',
        '$2,000-$5,000 (this is seriously hurting me)',
        '$5,000-$10,000 (I\'m losing serious money)',
        '$10,000+ (I\'m bleeding cash every single day)'
      ],
      required: true
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'If I could solve this in the next 24 hours, would you...',
      options: [
        'Pay $100-$500 (this would be life-changing)',
        'Pay $500-$1,000 (shut up and take my money)',
        'Pay $1,000-$5,000 (I\'d sell stuff to afford this)',
        'Pay $5,000+ (I\'d put it on a credit card RIGHT NOW)'
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
