"use client"; // Mark as Client Component for potential future state/interactions

import React from 'react';
import { TodayWorkoutProps, Exercise } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Edit } from "lucide-react"; // Icons

export function TodayWorkout({ workoutData, isLoading, error }: TodayWorkoutProps) {

  // --- Placeholder Handlers ---
  const handleStartWorkout = () => {
    // TODO: Implement workout start logic (navigate to logging screen)
    console.log("Start Workout clicked");
    alert("Workout logging not implemented yet.");
  };

  const handleEditRoutine = () => {
    // TODO: Implement edit routine logic (open modal/prompt)
    console.log("Edit Routine clicked");
    alert("Editing routine not implemented yet.");
  };
  // --- End Placeholder Handlers ---


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Generating your workout...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Could not fetch today's workout. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!workoutData || workoutData.routine.length === 0) {
    return (
      <Alert>
        <AlertTitle>No Workout Data</AlertTitle>
        <AlertDescription>
          No workout routine generated for today, or unable to fetch data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Today's Workout</h1>
          <p className="text-muted-foreground">{workoutData.date}</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleEditRoutine} aria-label="Edit Routine">
          <Edit className="h-4 w-4" />
        </Button>
      </div>


      {workoutData.ai_insight && (
        <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <AlertTitle className="text-blue-800 dark:text-blue-200">AI Insight</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            {workoutData.ai_insight}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {workoutData.routine.map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            <Card>
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription>
                  {exercise.target_sets} sets x {exercise.target_reps} reps
                  {exercise.target_weight_kg && ` @ ~${exercise.target_weight_kg} kg`}
                </CardDescription>
              </CardHeader>
              {exercise.rest_period_seconds && (
                 <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Rest: {exercise.rest_period_seconds} seconds
                    </p>
                 </CardContent>
              )}
            </Card>
            {index < workoutData.routine.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={handleStartWorkout}>
          Start Workout
        </Button>
      </div>

       {/* Placeholder for History Link/Button - can be moved to layout later */}
       <div className="mt-10 text-center">
           <Button variant="link" disabled>View Workout History (Coming Soon)</Button>
       </div>
    </div>
  );
}