import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LearnClient from '@/components/LearnClient';

export default async function LearnPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      progress: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch all modules, prioritizing user's neurodivergent type
  const modules = await prisma.learningModule.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      { order: 'asc' },
    ],
  });

  // Separate modules by user's type
  const userModules = user.profile
    ? modules.filter((m) => m.neurodivergentType === user.profile.neurodivergentType)
    : [];

  const otherModules = user.profile
    ? modules.filter((m) => m.neurodivergentType !== user.profile.neurodivergentType)
    : modules;

  return (
    <LearnClient
      user={user}
      userModules={userModules}
      otherModules={otherModules}
    />
  );
}
