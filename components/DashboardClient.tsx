'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Brain,
  Trophy,
  Target,
  Flame,
  BookOpen,
  LogOut,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { calculateLevel, getPointsForNextLevel, getStreakEmoji, getNeurodivergentTypeLabel, getDifficultyColor } from '@/lib/utils';

export default function DashboardClient({
  user,
  recommendedModules,
  recentSessions,
}: any) {
  const profile = user.profile;
  const currentLevel = profile ? calculateLevel(profile.totalPoints) : 1;
  const pointsForNext = profile ? getPointsForNextLevel(profile.totalPoints) : 100;
  const progressToNextLevel = profile ? ((profile.totalPoints % 100) / 100) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 text-transparent bg-clip-text">
                NeuroLearn
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                href="/learn"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Learn
              </Link>
              <Link
                href="/progress"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Progress
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">
            Ready to continue your learning journey?
            {profile && ` You're learning with ${getNeurodivergentTypeLabel(profile.neurodivergentType)} support.`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          {profile && (
            <>
              {/* Level & Points Card */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-primary-100 text-sm">Your Level</p>
                    <p className="text-4xl font-bold">Level {currentLevel}</p>
                  </div>
                  <Star className="h-12 w-12 text-primary-200" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{profile.totalPoints} points</span>
                    <span>{pointsForNext} points</span>
                  </div>
                  <div className="w-full bg-primary-700 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-500"
                      style={{ width: `${progressToNextLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-orange-100 text-sm">Current Streak</p>
                    <p className="text-4xl font-bold">{profile.streak} days</p>
                  </div>
                  <div className="text-5xl">{getStreakEmoji(profile.streak)}</div>
                </div>
                <p className="text-orange-100 text-sm">
                  {profile.streak >= 7
                    ? "Amazing! Keep the momentum going!"
                    : "Learn daily to build your streak!"}
                </p>
              </div>

              {/* Progress Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-green-100 text-sm">Modules Completed</p>
                    <p className="text-4xl font-bold">
                      {user.progress.filter((p: any) => p.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <Trophy className="h-12 w-12 text-green-200" />
                </div>
                <p className="text-green-100 text-sm">
                  {user.progress.length > 0
                    ? `${user.progress.length} total modules in progress`
                    : "Start your first module today!"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Recent Achievements */}
        {user.achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recent Achievements 🏆</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {user.achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition achievement-glow"
                >
                  <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                  <h3 className="font-bold text-center mb-1">{achievement.title}</h3>
                  <p className="text-xs text-gray-600 text-center">{achievement.description}</p>
                  <p className="text-xs text-primary-600 text-center mt-2 font-semibold">
                    +{achievement.pointsAwarded} points
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning / Recommended Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {user.progress.length > 0 ? 'Continue Learning' : 'Start Your Journey'}
            </h2>
            <Link
              href="/learn"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              View All <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedModules.slice(0, 6).map((module: any) => {
              const progress = user.progress.find((p: any) => p.moduleId === module.id);
              return (
                <Link
                  key={module.id}
                  href={`/learn/${module.id}`}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                        module.difficultyLevel
                      )}`}
                    >
                      {module.difficultyLevel}
                    </div>
                    <BookOpen className="h-6 w-6 text-primary-600 group-hover:scale-110 transition" />
                  </div>

                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {module.estimatedDuration}m
                    </span>
                    <span className="flex items-center text-primary-600 font-semibold">
                      <Trophy className="h-4 w-4 mr-1" />
                      {module.pointsReward} pts
                    </span>
                  </div>

                  {progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{progress.status.replace('_', ' ')}</span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 rounded-full h-2 transition-all"
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {recentSessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Activity 📚</h2>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                {recentSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <BookOpen className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{session.module.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(session.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        +{session.pointsEarned} points
                      </p>
                      {session.durationMinutes && (
                        <p className="text-xs text-gray-500">{session.durationMinutes}m</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
