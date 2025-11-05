'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Brain,
  LogOut,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Flame,
} from 'lucide-react';
import { formatDuration, getStreakEmoji, getNeurodivergentTypeLabel } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function ProgressClient({ user, stats }: any) {
  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const sessionsByDay = last7Days.map((date) => {
    const daySessions = user.sessions.filter((s: any) =>
      s.startTime.startsWith(date)
    );
    const totalMinutes = daySessions.reduce(
      (sum: number, s: any) => sum + (s.durationMinutes || 0),
      0
    );
    const totalPoints = daySessions.reduce(
      (sum: number, s: any) => sum + s.pointsEarned,
      0
    );

    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: totalMinutes,
      points: totalPoints,
    };
  });

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
                className="text-primary-600 font-semibold"
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Progress 📊</h1>
          <p className="text-gray-600">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="h-8 w-8 text-yellow-600" />}
            title="Points Earned"
            value={stats.totalPoints.toLocaleString()}
            subtitle={`Level ${stats.level}`}
            color="yellow"
          />
          <StatCard
            icon={<Target className="h-8 w-8 text-green-600" />}
            title="Completed"
            value={stats.completedModules}
            subtitle={`${stats.inProgressModules} in progress`}
            color="green"
          />
          <StatCard
            icon={<Clock className="h-8 w-8 text-blue-600" />}
            title="Time Learning"
            value={formatDuration(stats.totalTimeMinutes)}
            subtitle="Total time invested"
            color="blue"
          />
          <StatCard
            icon={<div className="text-3xl">{getStreakEmoji(stats.streak)}</div>}
            title="Current Streak"
            value={`${stats.streak} days`}
            subtitle="Keep it up!"
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Spent Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Learning Time (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sessionsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Points Earned Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Points Earned (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sessionsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Module Progress 📚</h2>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            {user.progress.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't started any modules yet</p>
                <Link
                  href="/learn"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Start Learning
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.progress.map((progress: any) => (
                  <Link
                    key={progress.id}
                    href={`/learn/${progress.moduleId}`}
                    className="block p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{progress.module.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          progress.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : progress.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {progress.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary-600 rounded-full h-3 transition-all"
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Time spent: {progress.timeSpentMinutes}m</span>
                      {progress.score && <span>Score: {progress.score}%</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Achievements 🏆</h2>
          {user.achievements.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-lg text-center">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Complete modules to unlock achievements!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition achievement-glow"
                >
                  <div className="text-5xl mb-3 text-center">{achievement.icon}</div>
                  <h3 className="font-bold text-center mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-sm text-primary-600 text-center font-semibold">
                    +{achievement.pointsAwarded} points
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: any) {
  const colorClasses: Record<string, string> = {
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-red-500',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/20 rounded-lg p-2">{icon}</div>
      </div>
      <p className="text-white/80 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-white/70 text-sm">{subtitle}</p>
    </div>
  );
}
