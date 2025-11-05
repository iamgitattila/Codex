import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId, durationMinutes, pointsEarned, activitiesCompleted } =
      await request.json();

    // Create learning session
    await prisma.learningSession.create({
      data: {
        userId: session.user.id,
        moduleId,
        endTime: new Date(),
        durationMinutes,
        activitiesCompleted,
        pointsEarned,
        aiCoachingUsed: true,
      },
    });

    // Update user profile points and level
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (profile) {
      const newTotalPoints = profile.totalPoints + pointsEarned;
      const newLevel = calculateLevel(newTotalPoints);

      // Check if it's a consecutive day for streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActivity = profile.lastActivityDate
        ? new Date(profile.lastActivityDate)
        : null;

      let newStreak = profile.streak;

      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor(
          (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Consecutive day
          newStreak = profile.streak + 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newStreak = 1;
        }
        // Same day: keep current streak
      } else {
        // First activity
        newStreak = 1;
      }

      await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          totalPoints: newTotalPoints,
          level: newLevel,
          streak: newStreak,
          lastActivityDate: new Date(),
        },
      });

      // Check for achievements
      const achievements = [];

      // First module completion
      const completedCount = await prisma.progress.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
        },
      });

      if (completedCount === 1) {
        achievements.push({
          userId: session.user.id,
          type: 'MILESTONE',
          title: 'First Steps',
          description: 'Completed your first module!',
          icon: '🎯',
          pointsAwarded: 50,
        });
      }

      // Streak achievements
      if (newStreak === 3 && profile.streak < 3) {
        achievements.push({
          userId: session.user.id,
          type: 'STREAK',
          title: '3-Day Streak',
          description: 'Learned for 3 days in a row!',
          icon: '⚡',
          pointsAwarded: 30,
        });
      } else if (newStreak === 7 && profile.streak < 7) {
        achievements.push({
          userId: session.user.id,
          type: 'STREAK',
          title: 'Week Warrior',
          description: 'Maintained a 7-day streak!',
          icon: '🔥',
          pointsAwarded: 100,
        });
      } else if (newStreak === 30 && profile.streak < 30) {
        achievements.push({
          userId: session.user.id,
          type: 'STREAK',
          title: 'Month Master',
          description: 'An incredible 30-day streak!',
          icon: '🔥💯',
          pointsAwarded: 500,
        });
      }

      // Level up achievement
      if (newLevel > profile.level) {
        achievements.push({
          userId: session.user.id,
          type: 'MILESTONE',
          title: `Level ${newLevel} Reached!`,
          description: `You've reached level ${newLevel}!`,
          icon: '⭐',
          pointsAwarded: newLevel * 10,
        });
      }

      // Create achievements
      if (achievements.length > 0) {
        await prisma.achievement.createMany({
          data: achievements,
        });
      }

      return NextResponse.json({
        success: true,
        achievements,
        newLevel,
        newStreak,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session completion error:', error);
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}
