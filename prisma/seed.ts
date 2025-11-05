import { PrismaClient, NeurodivergentType, DifficultyLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const student1 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Student',
      password: hashedPassword,
      role: 'STUDENT',
      profile: {
        create: {
          neurodivergentType: NeurodivergentType.ADHD,
          age: 12,
          gradeLevel: '6th Grade',
          preferences: JSON.stringify({
            visualLearner: true,
            shortSessions: true,
            reminders: true,
          }),
          strengths: JSON.stringify(['Creative thinking', 'Problem solving']),
          challenges: JSON.stringify(['Sustained attention', 'Organization']),
          totalPoints: 150,
          level: 2,
          streak: 3,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'jamie@example.com',
      name: 'Jamie Student',
      password: hashedPassword,
      role: 'STUDENT',
      profile: {
        create: {
          neurodivergentType: NeurodivergentType.AUTISM,
          age: 10,
          gradeLevel: '4th Grade',
          preferences: JSON.stringify({
            structuredRoutines: true,
            clearInstructions: true,
            quietEnvironment: true,
          }),
          strengths: JSON.stringify(['Pattern recognition', 'Detail-oriented']),
          challenges: JSON.stringify(['Social communication', 'Flexibility']),
          totalPoints: 280,
          level: 3,
          streak: 7,
        },
      },
    },
  });

  const parent = await prisma.user.create({
    data: {
      email: 'parent@example.com',
      name: 'Parent Guardian',
      password: hashedPassword,
      role: 'PARENT',
    },
  });

  // Create learning modules for ADHD
  const adhdModules = [
    {
      title: 'Focus Foundations',
      description: 'Learn techniques to improve focus and concentration through engaging activities',
      neurodivergentType: NeurodivergentType.ADHD,
      difficultyLevel: DifficultyLevel.BEGINNER,
      category: 'Focus & Attention',
      estimatedDuration: 15,
      pointsReward: 20,
      order: 1,
      content: JSON.stringify({
        introduction: 'Welcome to Focus Foundations! This module will help you build your focus muscles.',
        sections: [
          {
            title: 'Understanding Your Focus',
            content: 'Everyone focuses differently. Let\'s discover what works best for you!',
            mediaType: 'video',
            mediaUrl: '/videos/focus-intro.mp4',
          },
          {
            title: 'The Pomodoro Technique',
            content: 'Work in focused bursts with breaks in between.',
            tips: ['Set a timer for 15 minutes', 'Focus on one task', 'Take a 5-minute break'],
          },
        ],
      }),
      activities: JSON.stringify([
        {
          type: 'timer-challenge',
          title: 'Focus Sprint',
          description: 'Complete a task in 10 minutes without distractions',
          points: 10,
        },
        {
          type: 'quiz',
          title: 'Focus Knowledge Check',
          questions: [
            {
              question: 'What is the Pomodoro Technique?',
              options: ['Working in timed intervals', 'A type of tomato', 'A video game'],
              correct: 0,
            },
          ],
          points: 10,
        },
      ]),
    },
    {
      title: 'Organization Station',
      description: 'Master organization skills with fun, interactive tools and strategies',
      neurodivergentType: NeurodivergentType.ADHD,
      difficultyLevel: DifficultyLevel.BEGINNER,
      category: 'Organization',
      estimatedDuration: 20,
      pointsReward: 25,
      order: 2,
      content: JSON.stringify({
        introduction: 'Getting organized doesn\'t have to be boring. Let\'s make it fun!',
        sections: [
          {
            title: 'Creating Your Command Center',
            content: 'Set up a space that helps you stay organized',
          },
          {
            title: 'Digital Organization Tools',
            content: 'Learn to use apps and tools that work with your brain',
          },
        ],
      }),
      activities: JSON.stringify([
        {
          type: 'drag-drop',
          title: 'Organize the Desk',
          description: 'Drag items to their proper places',
          points: 15,
        },
      ]),
    },
    {
      title: 'Time Management Magic',
      description: 'Develop time awareness and planning skills in an engaging way',
      neurodivergentType: NeurodivergentType.ADHD,
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      category: 'Time Management',
      estimatedDuration: 25,
      pointsReward: 30,
      order: 3,
      content: JSON.stringify({
        introduction: 'Time can be tricky, but we\'ll make it work for you!',
        sections: [
          {
            title: 'Time Blindness Solutions',
            content: 'Understand time blindness and how to work with it',
          },
        ],
      }),
      activities: JSON.stringify([
        {
          type: 'interactive',
          title: 'Schedule Builder',
          description: 'Create your ideal daily schedule',
          points: 20,
        },
      ]),
    },
  ];

  // Create learning modules for Autism
  const autismModules = [
    {
      title: 'Communication Confidence',
      description: 'Build social communication skills at your own pace',
      neurodivergentType: NeurodivergentType.AUTISM,
      difficultyLevel: DifficultyLevel.BEGINNER,
      category: 'Social Skills',
      estimatedDuration: 20,
      pointsReward: 25,
      order: 1,
      content: JSON.stringify({
        introduction: 'Communication comes in many forms. Let\'s find what works for you!',
        sections: [
          {
            title: 'Understanding Body Language',
            content: 'Learn to recognize and interpret non-verbal cues',
          },
          {
            title: 'Starting Conversations',
            content: 'Simple strategies for beginning conversations',
          },
        ],
      }),
      activities: JSON.stringify([
        {
          type: 'scenario',
          title: 'Conversation Practice',
          description: 'Practice different conversation scenarios',
          points: 15,
        },
      ]),
    },
    {
      title: 'Sensory Success',
      description: 'Understand and manage sensory experiences',
      neurodivergentType: NeurodivergentType.AUTISM,
      difficultyLevel: DifficultyLevel.BEGINNER,
      category: 'Sensory Processing',
      estimatedDuration: 15,
      pointsReward: 20,
      order: 2,
      content: JSON.stringify({
        introduction: 'Your sensory system is unique. Let\'s learn about it!',
        sections: [
          {
            title: 'Sensory Profile',
            content: 'Discover your sensory preferences and sensitivities',
          },
        ],
      }),
      activities: JSON.stringify([
        {
          type: 'assessment',
          title: 'Sensory Explorer',
          description: 'Identify your sensory preferences',
          points: 15,
        },
      ]),
    },
  ];

  // Create learning modules for Dyslexia
  const dyslexiaModules = [
    {
      title: 'Reading Strategies Toolkit',
      description: 'Discover powerful reading strategies designed for dyslexic learners',
      neurodivergentType: NeurodivergentType.DYSLEXIA,
      difficultyLevel: DifficultyLevel.BEGINNER,
      category: 'Reading',
      estimatedDuration: 20,
      pointsReward: 25,
      order: 1,
      content: JSON.stringify({
        introduction: 'Reading can be challenging, but you have unique strengths!',
        sections: [
          {
            title: 'Phonics Fun',
            content: 'Master sound-letter relationships with multisensory activities',
          },
          {
            title: 'Word Recognition Games',
            content: 'Build sight word vocabulary through games',
          },
        ],
      }),
      activities: JSON.stringify([
        {
          type: 'phonics-game',
          title: 'Sound Matching',
          description: 'Match sounds to letters',
          points: 15,
        },
      ]),
    },
  ];

  const allModules = [...adhdModules, ...autismModules, ...dyslexiaModules];

  for (const moduleData of allModules) {
    await prisma.learningModule.create({
      data: moduleData,
    });
  }

  // Create some progress records
  const modules = await prisma.learningModule.findMany();

  await prisma.progress.create({
    data: {
      userId: student1.id,
      moduleId: modules[0].id,
      status: 'COMPLETED',
      progressPercentage: 100,
      score: 95,
      attemptsCount: 1,
      timeSpentMinutes: 18,
      startedAt: new Date('2024-11-01'),
      completedAt: new Date('2024-11-01'),
    },
  });

  await prisma.progress.create({
    data: {
      userId: student1.id,
      moduleId: modules[1].id,
      status: 'IN_PROGRESS',
      progressPercentage: 60,
      attemptsCount: 1,
      timeSpentMinutes: 12,
      startedAt: new Date('2024-11-04'),
    },
  });

  // Create some achievements
  await prisma.achievement.create({
    data: {
      userId: student1.id,
      type: 'BADGE',
      title: 'First Steps',
      description: 'Completed your first module!',
      icon: '🎯',
      pointsAwarded: 50,
    },
  });

  await prisma.achievement.create({
    data: {
      userId: student2.id,
      type: 'STREAK',
      title: 'Week Warrior',
      description: 'Maintained a 7-day streak!',
      icon: '🔥',
      pointsAwarded: 100,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
