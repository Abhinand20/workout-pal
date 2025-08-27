"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePageTitle } from '@/lib/use-page-title';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutSplit } from '@/types/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Zap, Target, Calendar } from 'lucide-react';

const dayToSplitMap: { [key: number]: WorkoutSplit } = {
  0: WorkoutSplit.FULL_BODY, // Sunday
  1: WorkoutSplit.PUSH,       // Monday
  2: WorkoutSplit.PULL,       // Tuesday
  3: WorkoutSplit.LEGS,       // Wednesday
  4: WorkoutSplit.PUSH,       // Thursday
  5: WorkoutSplit.PULL,       // Friday
  6: WorkoutSplit.LEGS,       // Saturday
};

// Helper to get today's date in a readable format
const getFormattedDate = () => {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper to get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// Helper to format split names nicely
const formatSplitName = (split: WorkoutSplit) => {
  return split.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to get split description
const getSplitDescription = (split: WorkoutSplit) => {
  switch (split) {
    case WorkoutSplit.PUSH:
      return "Chest, shoulders, and triceps";
    case WorkoutSplit.PULL:
      return "Back, biceps, and rear delts";
    case WorkoutSplit.LEGS:
      return "Quads, hamstrings, glutes, and calves";
    case WorkoutSplit.FULL_BODY:
      return "Complete body workout";
    default:
      return "Complete workout routine";
  }
};

// Helper to get split icon
const getSplitIcon = (split: WorkoutSplit) => {
  switch (split) {
    case WorkoutSplit.PUSH:
      return <Zap className="h-5 w-5" />;
    case WorkoutSplit.PULL:
      return <Target className="h-5 w-5" />;
    case WorkoutSplit.LEGS:
      return <Dumbbell className="h-5 w-5" />;
    case WorkoutSplit.FULL_BODY:
      return <Calendar className="h-5 w-5" />;
    default:
      return <Dumbbell className="h-5 w-5" />;
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [recommendedSplit, setRecommendedSplit] = useState<WorkoutSplit | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit | ''>('');
  
  usePageTitle("Start Your Workout");
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setCurrentDate(getFormattedDate());
    setGreeting(getGreeting());
    const today = new Date().getDay();
    const recommendation = dayToSplitMap[today];
    if (recommendation) {
      setRecommendedSplit(recommendation);
      setSelectedSplit(recommendation);
    } else {
      setSelectedSplit(WorkoutSplit.FULL_BODY); 
    }
  }, []);

  const handleGenerateWorkout = () => {
    if (selectedSplit) {
      router.push(`/workout?split=${selectedSplit}`);
    }
  };

  const workoutSplitOptions = Object.values(WorkoutSplit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-screen">
        {/* Header Section - More compact */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-full">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
            WorkoutPal
          </h1>
          <p className="text-base text-gray-600">Your personal fitness companion</p>
        </div>

        {/* Main Card - More compact */}
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-3">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
              <span className="text-xs font-medium text-gray-600">{currentDate}</span>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {greeting}! Ready to Train?
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Let&apos;s build strength together
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6">
            {/* Recommended Split - More compact */}
            {recommendedSplit && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-100">
                <div className="flex items-center mb-1">
                  <Target className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="text-xs font-semibold text-indigo-900">Today&apos;s Recommendation</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-indigo-900">
                      {formatSplitName(recommendedSplit)}
                    </p>
                    <p className="text-xs text-indigo-700">
                      {getSplitDescription(recommendedSplit)}
                    </p>
                  </div>
                  <div className="text-indigo-600">
                    {getSplitIcon(recommendedSplit)}
                  </div>
                </div>
              </div>
            )}

            {/* Split Selection - More compact */}
            <div className="space-y-2">
              <label htmlFor="split-select" className="block text-sm font-semibold text-gray-700">
                Choose Your Workout Focus
              </label>
              <Select
                value={selectedSplit}
                onValueChange={(value) => setSelectedSplit(value as WorkoutSplit)}
              >
                <SelectTrigger id="split-select" className="w-full h-10 border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                  <SelectValue placeholder="Select a workout split" />
                </SelectTrigger>
                <SelectContent>
                  {workoutSplitOptions.map((split) => (
                    <SelectItem key={split} value={split} className="py-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-600">
                          {getSplitIcon(split)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{formatSplitName(split)}</div>
                          {/* <div className="text-xs text-gray-500">{getSplitDescription(split)}</div> */}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Split Preview - More compact */}
            {selectedSplit && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 p-1.5 rounded-full">
                    <div className="text-indigo-600">
                      {getSplitIcon(selectedSplit as WorkoutSplit)}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {formatSplitName(selectedSplit as WorkoutSplit)} Workout
                    </p>
                    <p className="text-xs text-gray-600">
                      {getSplitDescription(selectedSplit as WorkoutSplit)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3 px-6">
            <Button
              onClick={handleGenerateWorkout}
              disabled={!selectedSplit}
              className="w-full h-10 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate My Workout
            </Button>
          </CardFooter>
        </Card>

        {/* Footer - More compact */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Personalized workouts powered by AI</p>
        </div>
      </main>
    </div>
  );
}