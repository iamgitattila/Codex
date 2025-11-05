import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, status, progressPercentage } = await request.json();

    const progress = await prisma.progress.update({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
      data: {
        status,
        progressPercentage,
        ...(status === 'IN_PROGRESS' && !progressPercentage && { startedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
