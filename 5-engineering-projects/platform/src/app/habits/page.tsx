"use client";

import { Target } from "lucide-react";

export default function HabitsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Habits
        </h1>
      </div>
      <div className="bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Habit tracking coming soon
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Track your daily habits and build consistency. This feature will sync
          with your 5amClub data.
        </p>
      </div>
    </div>
  );
}
