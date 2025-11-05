import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAICoaching } from '@/lib/ai-coach';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, currentProgress } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId },
    });

    if (!user?.profile || !module) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const coachingMessage = await generateAICoaching({
      neurodivergentType: user.profile.neurodivergentType,
      moduleTitle: module.title,
      difficulty: module.difficultyLevel,
      userProgress: currentProgress,
    });

    return NextResponse.json({ message: coachingMessage });
  } catch (error) {
    console.error('AI coaching error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching message' },
      { status: 500 }
    );
  }
}
