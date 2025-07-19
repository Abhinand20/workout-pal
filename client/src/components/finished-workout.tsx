"use client";

import React from 'react';
import { LoggedExercise, ActiveWorkoutState } from '@/types';
import { WorkoutSplit } from '@/types/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, TrendingUp, Dumbbell, Target, Home, Trophy } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FinishedWorkoutProps {
  loggedExercises: LoggedExercise[];
  startTime: number;
  endTime: number;
  totalDurationSeconds: number;
  split: WorkoutSplit;
  workoutRoutineName?: string;
  onReturnToLanding: () => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function formatSplit(split: WorkoutSplit): string {
  return split.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function calculateTotalVolume(exercises: LoggedExercise[]): number {
  return exercises.reduce((totalVolume, exercise) => {
    const exerciseVolume = exercise.sets.reduce((exerciseSum, set) => {
      const weight = typeof set.weight_lbs === 'number' ? set.weight_lbs : parseFloat(set.weight_lbs) || 0;
      const reps = typeof set.reps === 'number' ? set.reps : parseFloat(set.reps) || 0;
      return exerciseSum + (weight * reps);
    }, 0);
    return totalVolume + exerciseVolume;
  }, 0);
}

function calculateAverageRPE(exercises: LoggedExercise[]): number | null {
  const validRPEs: number[] = [];
  exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.rpe) {
        const rpe = typeof set.rpe === 'number' ? set.rpe : parseFloat(set.rpe);
        if (!isNaN(rpe) && rpe > 0) {
          validRPEs.push(rpe);
        }
      }
    });
  });

  if (validRPEs.length === 0) return null;
  return validRPEs.reduce((sum, rpe) => sum + rpe, 0) / validRPEs.length;
}

export function FinishedWorkout({
  loggedExercises,
  startTime,
  endTime,
  totalDurationSeconds,
  split,
  workoutRoutineName,
  onReturnToLanding,
}: FinishedWorkoutProps) {
  const totalSets = loggedExercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const totalVolume = calculateTotalVolume(loggedExercises);
  const averageRPE = calculateAverageRPE(loggedExercises);
  const averageTimePerSet = totalSets > 0 ? totalDurationSeconds / totalSets : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="text-center bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Trophy className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">
              Workout Complete! 🎉
            </CardTitle>
            <CardDescription className="text-lg text-green-700">
              Great job crushing your {formatSplit(split)} workout!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Overview Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Workout Overview
            </CardTitle>
            <CardDescription>
              {formatSplit(split)} • {formatTime(startTime)} - {formatTime(endTime)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-800">
                  {formatDuration(totalDurationSeconds)}
                </div>
                <div className="text-sm text-blue-600">Total Time</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-800">
                  {loggedExercises.length}
                </div>
                <div className="text-sm text-purple-600">Exercises</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-800">
                  {totalSets}
                </div>
                <div className="text-sm text-orange-600">Sets</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Dumbbell className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-800">
                  {totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">lbs Volume</div>
              </div>
            </div>
            
            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-800">
                  {formatDuration(averageTimePerSet)}
                </div>
                <div className="text-sm text-gray-600">Avg Time per Set</div>
              </div>
              
              {averageRPE && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800">
                    {averageRPE.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-gray-600">Average RPE</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Breakdown</CardTitle>
            <CardDescription>
              Detailed performance for each exercise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loggedExercises.map((exercise, exerciseIndex) => {
              const exerciseVolume = exercise.sets.reduce((sum, set) => {
                const weight = typeof set.weight_lbs === 'number' ? set.weight_lbs : parseFloat(set.weight_lbs) || 0;
                const reps = typeof set.reps === 'number' ? set.reps : parseFloat(set.reps) || 0;
                return sum + (weight * reps);
              }, 0);

              const exerciseDuration = exercise.elapsedTime_ms ? exercise.elapsedTime_ms / 1000 : 0;

              return (
                <div key={exercise.exercise_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>{exercise.sets.length} sets</span>
                        <span>{exerciseVolume.toLocaleString()} lbs</span>
                        {exerciseDuration > 0 && (
                          <span>{formatDuration(exerciseDuration)}</span>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {exercise.sets.map((set, setIndex) => {
                      const weight = typeof set.weight_lbs === 'number' ? set.weight_lbs : parseFloat(set.weight_lbs) || 0;
                      const reps = typeof set.reps === 'number' ? set.reps : parseFloat(set.reps) || 0;
                      
                      return (
                        <div 
                          key={setIndex}
                          className="bg-gray-50 rounded p-2 text-center text-sm"
                        >
                          <div className="font-medium">Set {set.set_number}</div>
                          <div className="text-gray-600">
                            {weight}lbs × {reps}
                          </div>
                          {set.rpe && (
                            <div className="text-xs text-gray-500">
                              RPE: {set.rpe}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardFooter className="flex justify-center gap-4">
            <Button 
              onClick={onReturnToLanding}
              className="flex items-center gap-2"
              size="lg"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 