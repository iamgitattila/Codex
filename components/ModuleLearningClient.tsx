'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Confetti from 'react-confetti';
import {
  Brain,
  ArrowLeft,
  Sparkles,
  Trophy,
  CheckCircle,
  Play,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModuleLearningClient({ user, module, progress }: any) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [showCoaching, setShowCoaching] = useState(false);
  const [coachingMessage, setCoachingMessage] = useState('');
  const [loadingCoaching, setLoadingCoaching] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress.progressPercentage);
  const [showCompletion, setShowCompletion] = useState(false);
  const [sessionStartTime] = useState(new Date());

  const content = JSON.parse(module.content);
  const activities = JSON.parse(module.activities);
  const sections = content.sections || [];
  const totalSections = sections.length + activities.length;

  useEffect(() => {
    // Mark as in progress on component mount
    if (progress.status === 'NOT_STARTED') {
      updateProgress('IN_PROGRESS', 0);
    }
  }, []);

  const updateProgress = async (status: string, percentage: number) => {
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          status,
          progressPercentage: percentage,
        }),
      });

      if (response.ok) {
        setLocalProgress(percentage);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const getAICoaching = async () => {
    setLoadingCoaching(true);
    try {
      const response = await fetch('/api/coaching/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          currentProgress: localProgress,
        }),
      });

      const data = await response.json();
      setCoachingMessage(data.message);
      setShowCoaching(true);
    } catch (error) {
      setCoachingMessage('Keep up the great work! You\'re doing amazing! 🌟');
      setShowCoaching(true);
    } finally {
      setLoadingCoaching(false);
    }
  };

  const handleNext = () => {
    const newSection = currentSection + 1;
    const newProgress = Math.round((newSection / totalSections) * 100);

    setCurrentSection(newSection);
    setLocalProgress(newProgress);
    updateProgress(newProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS', newProgress);

    if (newProgress >= 100) {
      completeModule();
    }

    // Show coaching at certain milestones
    if (newProgress === 50 || newProgress === 100) {
      setTimeout(() => getAICoaching(), 500);
    }
  };

  const completeModule = async () => {
    setShowCompletion(true);

    const sessionEndTime = new Date();
    const durationMinutes = Math.round(
      (sessionEndTime.getTime() - sessionStartTime.getTime()) / 60000
    );

    try {
      await fetch('/api/learning-session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          durationMinutes,
          pointsEarned: module.pointsReward,
          activitiesCompleted: activities.length,
        }),
      });
    } catch (error) {
      console.error('Failed to record session:', error);
    }
  };

  const renderSection = () => {
    if (currentSection < sections.length) {
      // Render content section
      const section = sections[currentSection];
      return (
        <motion.div
          key={`section-${currentSection}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">{section.content}</p>
          </div>

          {section.tips && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-bold mb-2 text-blue-900">💡 Tips:</h3>
              <ul className="space-y-1">
                {section.tips.map((tip: string, idx: number) => (
                  <li key={idx} className="text-blue-800">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      );
    } else if (currentSection < totalSections) {
      // Render activity
      const activityIndex = currentSection - sections.length;
      const activity = activities[activityIndex];
      return (
        <motion.div
          key={`activity-${currentSection}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl">
            <h2 className="text-3xl font-bold mb-2">🎯 Activity Time!</h2>
            <p className="text-lg">{activity.title}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
            <p className="text-gray-700 text-lg mb-4">{activity.description}</p>

            {activity.questions && (
              <div className="space-y-4">
                {activity.questions.map((q: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="font-semibold text-green-800 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Complete this activity to earn {activity.points} points!
              </p>
            </div>
          </div>
        </motion.div>
      );
    } else {
      // Completion screen
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold mb-4">Module Completed!</h2>
          <p className="text-xl text-gray-600 mb-6">
            Congratulations on completing {module.title}!
          </p>

          <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white p-8 rounded-xl inline-block">
            <p className="text-2xl font-bold mb-2">+ {module.pointsReward} Points!</p>
            <p className="text-primary-100">Added to your total</p>
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <Link
              href="/learn"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Explore More Modules
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {showCompletion && <Confetti recycle={false} numberOfPieces={500} />}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/learn"
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Modules</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-lg">NeuroLearn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Header */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          <p className="text-gray-600 mb-4">{module.description}</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Your Progress</span>
              <span>{localProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-full h-4"
                initial={{ width: `${progress.progressPercentage}%` }}
                animate={{ width: `${localProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-6">{renderSection()}</div>

        {/* Navigation & AI Coaching */}
        <div className="flex justify-between items-center">
          <button
            onClick={getAICoaching}
            disabled={loadingCoaching}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{loadingCoaching ? 'Loading...' : 'Get AI Coaching'}</span>
          </button>

          {currentSection < totalSections && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              <span>{currentSection < totalSections - 1 ? 'Next' : 'Complete Module'}</span>
              {currentSection < totalSections - 1 ? (
                <Play className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* AI Coaching Message */}
        {showCoaching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 rounded-full p-2">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 mb-2">Your AI Coach Says:</h3>
                <p className="text-purple-800">{coachingMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
