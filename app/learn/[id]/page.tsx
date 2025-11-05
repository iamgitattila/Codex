import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ModuleLearningClient from '@/components/ModuleLearningClient';

export default async function ModulePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const module = await prisma.learningModule.findUnique({
    where: { id: params.id },
  });

  if (!module) {
    redirect('/learn');
  }

  // Get or create progress record
  let progress = await prisma.progress.findUnique({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId: module.id,
      },
    },
  });

  if (!progress) {
    progress = await prisma.progress.create({
      data: {
        userId: user.id,
        moduleId: module.id,
        status: 'NOT_STARTED',
        progressPercentage: 0,
      },
    });
  }

  return (
    <ModuleLearningClient
      user={user}
      module={module}
      progress={progress}
    />
  );
}
