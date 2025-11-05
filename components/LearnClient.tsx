'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Brain, BookOpen, LogOut, Clock, Trophy, Filter } from 'lucide-react';
import { getNeurodivergentTypeLabel, getDifficultyColor } from '@/lib/utils';

export default function LearnClient({ user, userModules, otherModules }: any) {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const allModules = [...userModules, ...otherModules];

  const filteredModules = allModules.filter((module) => {
    if (filterDifficulty !== 'ALL' && module.difficultyLevel !== filterDifficulty) {
      return false;
    }
    if (filterCategory !== 'ALL' && module.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(allModules.map((m: any) => m.category)));

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
                className="text-primary-600 font-semibold"
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Modules 📚</h1>
          <p className="text-gray-600">
            Explore personalized modules designed for your learning style
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recommended for You */}
        {userModules.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Recommended for You{' '}
              {user.profile && (
                <span className="text-lg text-gray-600 font-normal">
                  ({getNeurodivergentTypeLabel(user.profile.neurodivergentType)})
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userModules
                .filter((module: any) => {
                  if (filterDifficulty !== 'ALL' && module.difficultyLevel !== filterDifficulty) {
                    return false;
                  }
                  if (filterCategory !== 'ALL' && module.category !== filterCategory) {
                    return false;
                  }
                  return true;
                })
                .map((module: any) => {
                  const progress = user.progress.find((p: any) => p.moduleId === module.id);
                  return (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      progress={progress}
                    />
                  );
                })}
            </div>
          </div>
        )}

        {/* All Modules / Other Modules */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {userModules.length > 0 ? 'Explore More' : 'All Modules'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(userModules.length > 0 ? otherModules : allModules)
              .filter((module: any) => {
                if (filterDifficulty !== 'ALL' && module.difficultyLevel !== filterDifficulty) {
                  return false;
                }
                if (filterCategory !== 'ALL' && module.category !== filterCategory) {
                  return false;
                }
                return true;
              })
              .map((module: any) => {
                const progress = user.progress.find((p: any) => p.moduleId === module.id);
                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    progress={progress}
                  />
                );
              })}
          </div>
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No modules found with the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module, progress }: any) {
  return (
    <Link
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
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {getNeurodivergentTypeLabel(module.neurodivergentType)}
        </div>
      </div>

      <div className="mb-4">
        <BookOpen className="h-8 w-8 text-primary-600 mb-2 group-hover:scale-110 transition" />
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition">
          {module.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3">{module.description}</p>
      </div>

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

      <div className="text-sm text-gray-600 mb-3">
        <span className="font-semibold">Category:</span> {module.category}
      </div>

      {progress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span className="font-semibold">{progress.status.replace('_', ' ')}</span>
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

      {!progress && (
        <button className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition">
          Start Module
        </button>
      )}
    </Link>
  );
}
