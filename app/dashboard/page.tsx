import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Fetch user profile with progress
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      progress: {
        include: {
          module: true,
        },
        orderBy: {
          lastAccessedAt: 'desc',
        },
      },
      achievements: {
        orderBy: {
          unlockedAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch recommended modules based on user's neurodivergent type
  const recommendedModules = user.profile
    ? await prisma.learningModule.findMany({
        where: {
          neurodivergentType: user.profile.neurodivergentType,
          isPublished: true,
        },
        orderBy: {
          order: 'asc',
        },
        take: 6,
      })
    : [];

  // Get recent activity
  const recentSessions = await prisma.learningSession.findMany({
    where: { userId: user.id },
    include: {
      module: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 5,
  });

  return (
    <DashboardClient
      user={user}
      recommendedModules={recommendedModules}
      recentSessions={recentSessions}
    />
  );
}
