"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutSplit } from '@/types/api'; // Adjusted import path
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const dayToSplitMap: { [key: number]: WorkoutSplit } = {
  0: WorkoutSplit.FULL_BODY, // Sunday
  1: WorkoutSplit.PUSH,       // Monday
  2: WorkoutSplit.PULL,       // Tuesday
  3: WorkoutSplit.LEGS,       // Wednesday (Assuming LEGS is a valid WorkoutSplit, add it if not)
  4: WorkoutSplit.PUSH,       // Thursday
  5: WorkoutSplit.PULL,       // Friday
  6: WorkoutSplit.LEGS,       // Saturday (Assuming LEGS is a valid WorkoutSplit, add it if not)
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

export default function LandingPage() {
  const router = useRouter();
  const [recommendedSplit, setRecommendedSplit] = useState<WorkoutSplit | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit | ''>('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(getFormattedDate());
    const today = new Date().getDay();
    const recommendation = dayToSplitMap[today];
    if (recommendation) {
      setRecommendedSplit(recommendation);
      setSelectedSplit(recommendation);
    } else {
      // Fallback if map doesn't cover day, though it should
      setSelectedSplit(WorkoutSplit.FULL_BODY); 
    }
  }, []);

  const handleGenerateWorkout = () => {
    if (selectedSplit) {
      router.push(`/workout?split=${selectedSplit}`);
    }
  };

  // Ensure all WorkoutSplit enum values are available for selection
  const workoutSplitOptions = Object.values(WorkoutSplit);

  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>{currentDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg">Today's recommended workout focus:</p>
            <p className="text-2xl font-semibold text-primary">{recommendedSplit || 'Choose a split'}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="split-select" className="block text-sm font-medium text-gray-700">
              Select your workout split for today:
            </label>
            <Select
              value={selectedSplit}
              onValueChange={(value) => setSelectedSplit(value as WorkoutSplit)}
            >
              <SelectTrigger id="split-select" className="w-full">
                <SelectValue placeholder="Select a split" />
              </SelectTrigger>
              <SelectContent>
                {workoutSplitOptions.map((split) => (
                  <SelectItem key={split} value={split}>
                    {split.replace('_', ' ')} {/* Make it more readable */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerateWorkout}
            disabled={!selectedSplit}
            className="w-full"
          >
            Generate Today's Workout
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}