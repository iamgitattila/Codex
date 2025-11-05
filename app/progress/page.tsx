import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProgressClient from '@/components/ProgressClient';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

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
      },
      sessions: {
        include: {
          module: true,
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 20,
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Calculate stats
  const completedModules = user.progress.filter((p) => p.status === 'COMPLETED').length;
  const inProgressModules = user.progress.filter((p) => p.status === 'IN_PROGRESS').length;
  const totalTimeMinutes = user.sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0
  );

  const stats = {
    completedModules,
    inProgressModules,
    totalTimeMinutes,
    totalPoints: user.profile?.totalPoints || 0,
    streak: user.profile?.streak || 0,
    level: user.profile?.level || 1,
    achievementCount: user.achievements.length,
  };

  return <ProgressClient user={user} stats={stats} />;
}
