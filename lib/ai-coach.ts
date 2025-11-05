import { NeurodivergentType } from '@prisma/client';

interface CoachingContext {
  neurodivergentType: NeurodivergentType;
  moduleTitle: string;
  difficulty: string;
  userProgress: number;
  strugglingArea?: string;
}

export async function generateAICoaching(context: CoachingContext): Promise<string> {
  // In production, this would call OpenAI API
  // For MVP, we'll use template-based coaching

  const { neurodivergentType, moduleTitle, userProgress, strugglingArea } = context;

  const templates = {
    ADHD: [
      "Great job staying focused! Remember, short breaks help your brain recharge. 🧠",
      "You're doing amazing! Try using the Pomodoro technique if you need a focus boost.",
      "I notice you've been working hard! Don't forget to move around every 20 minutes.",
      "Excellent progress! Breaking tasks into smaller chunks really works for you.",
    ],
    AUTISM: [
      "You're following the structure perfectly! Your attention to detail is impressive. ⭐",
      "Great work! You're really excelling at pattern recognition in this module.",
      "I can see you're methodically working through this. That's a real strength!",
      "Wonderful progress! Your systematic approach is paying off.",
    ],
    DYSLEXIA: [
      "You're making great strides! Remember, reading at your own pace is perfectly fine. 📚",
      "Excellent effort! Using the text-to-speech feature can help when you're tired.",
      "You're doing wonderfully! Multisensory learning is really working for you.",
      "Keep up the great work! Your visual learning style is a real asset.",
    ],
    DYSCALCULIA: [
      "You're tackling this step by step - that's exactly right! 🔢",
      "Great job! Using visual aids really helps with number concepts.",
      "You're making excellent progress! Breaking down the math is smart.",
    ],
    DYSGRAPHIA: [
      "Wonderful work! Using typing instead of handwriting is a great strategy. ✍️",
      "You're doing great! Voice-to-text can help when your hands need a break.",
    ],
    MIXED: [
      "You're using multiple strategies effectively! That's impressive. 🌟",
      "Great adaptability! You're finding what works best for you.",
    ],
    OTHER: [
      "You're making excellent progress! Keep up the great work. 🎯",
      "Wonderful effort! Your unique approach is serving you well.",
    ],
  };

  const typeTemplates = templates[neurodivergentType] || templates.OTHER;
  const randomTemplate = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

  // Add progress-specific encouragement
  let progressMessage = '';
  if (userProgress < 25) {
    progressMessage = " You've just started - this is the hardest part!";
  } else if (userProgress < 50) {
    progressMessage = " You're building momentum!";
  } else if (userProgress < 75) {
    progressMessage = " You're over halfway there!";
  } else if (userProgress < 100) {
    progressMessage = " Almost done - you've got this!";
  } else {
    progressMessage = " Module completed! You should be proud!";
  }

  return randomTemplate + progressMessage;
}

export function getPersonalizedTip(neurodivergentType: NeurodivergentType, area: string): string {
  const tips: Record<NeurodivergentType, Record<string, string[]>> = {
    ADHD: {
      focus: [
        'Try the 2-minute rule: If a task takes less than 2 minutes, do it now!',
        'Use a fidget tool or music to help maintain focus',
        'Set a visible timer to create urgency and structure',
      ],
      organization: [
        'Use color-coding for different subjects or task types',
        'Keep a "brain dump" notebook for random thoughts',
        'Create a landing zone for important items',
      ],
      time: [
        'Set alarms 10 minutes before transitions',
        'Use visual timers to see time passing',
        'Estimate time, then track how long tasks actually take',
      ],
    },
    AUTISM: {
      social: [
        'Practice conversation starters with a trusted person first',
        'Use scripts or templates for common social situations',
        'Take sensory breaks when social situations feel overwhelming',
      ],
      routine: [
        'Use visual schedules to preview your day',
        'Build in buffer time between activities',
        'Create a "comfort routine" for stressful moments',
      ],
      sensory: [
        'Identify and avoid overwhelming sensory triggers when possible',
        'Use noise-canceling headphones in loud environments',
        'Create a calm-down space with preferred sensory items',
      ],
    },
    DYSLEXIA: {
      reading: [
        'Use a colored overlay or change background colors on screens',
        'Try text-to-speech for longer passages',
        'Break reading into smaller, manageable chunks',
      ],
      writing: [
        'Use speech-to-text for first drafts',
        'Try different fonts - some may be easier to read',
        'Use graphic organizers to plan before writing',
      ],
    },
    DYSCALCULIA: {
      math: [
        'Use manipulatives or draw pictures for math problems',
        'Break multi-step problems into single steps',
        'Create reference sheets with common formulas',
      ],
    },
    DYSGRAPHIA: {
      writing: [
        'Use voice typing when possible',
        'Try different pen grips or pencil types',
        'Take regular hand breaks during writing tasks',
      ],
    },
    MIXED: {
      general: [
        'Experiment with different strategies to find what works',
        'Combine approaches from different areas',
        'Remember: your brain is unique, and that\'s a strength',
      ],
    },
    OTHER: {
      general: [
        'Listen to what your body and brain need',
        'Build on your strengths while addressing challenges',
        'Advocate for accommodations that help you succeed',
      ],
    },
  };

  const categoryTips = tips[neurodivergentType]?.[area] || tips[neurodivergentType]?.['general'] || tips.OTHER.general;
  return categoryTips[Math.floor(Math.random() * categoryTips.length)];
}
