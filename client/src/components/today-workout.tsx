"use client"; // Mark as Client Component for potential future state/interactions

import React from 'react';
import { TodayWorkoutProps, Exercise } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Edit, RefreshCw } from "lucide-react"; // Icons

export function TodayWorkout({ workoutData, isLoading, error, onStartWorkout, onRegenerateWorkout }: TodayWorkoutProps) {

  // --- Placeholder Handlers ---
  // TODO: Define a proper type for exercise if needed
  const handleEditExercise = (exerciseId: string | number) => {
    // TODO: Implement edit exercise logic (open modal/inline edit for specific exercise)
    console.log("Edit Exercise clicked for ID:", exerciseId);
    alert(`Editing exercise ${exerciseId} not implemented yet.`);
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
          <Button variant="secondary" size="sm" onClick={onRegenerateWorkout} className="ml-4 mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Workout
          </Button>
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
          <Button variant="secondary" size="sm" onClick={onRegenerateWorkout} className="ml-4 mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Regenerating
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Removed the top-level container and edit button */}
      <div>
        <h1 className="text-2xl font-bold">Today's Workout</h1>
        <p className="text-muted-foreground">{workoutData.date}</p>
        {error && (
             <Alert variant="default" className="mt-2">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Note</AlertTitle>
                 <AlertDescription>
                 Could not fetch a fresh workout ({error}). Displaying the last available plan. You can try regenerating.
                 </AlertDescription>
             </Alert>
        )}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Use flex for layout */}
                 <div className="space-y-1"> {/* Group title and description */}
                    <CardTitle>{exercise.name}</CardTitle>
                    <CardDescription>
                      {/* TODO(abhi): Populate this with a simple "tip" for the exercise */}
                      {/* {exercise.tip} */}
                      A sample tip for the exercise will go here.
                    </CardDescription>
                 </div>
                 {/* Add Edit button per exercise */}
                 <Button
                   variant="ghost" // Use ghost or outline for less emphasis
                   size="icon"
                   onClick={() => handleEditExercise(exercise.id)} // Pass exercise ID
                   aria-label={`Edit ${exercise.name}`}
                 >
                   <Edit className="h-4 w-4" />
                 </Button>
              </CardHeader>
              <CardContent>
                Sets: {exercise.target_sets} x Reps: {exercise.target_reps}
                {exercise.target_weight_kg && ` @ ~${exercise.target_weight_kg} kg`}
                {exercise.rest_period_seconds && (
                      <p className="text-sm text-muted-foreground">
                          Rest: {exercise.rest_period_seconds} seconds
                      </p>
                )}
              </CardContent>
            </Card>
            {index < workoutData.routine.length - 1}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center space-y-4">
         <Button
           size="lg"
           onClick={onStartWorkout}
           disabled={isLoading}
           aria-label="Start Workout"
           className="w-full" // Changed from flex-1 to w-full for vertical stacking
         >
          Start Workout
        </Button>
        <Button
           size="lg"
           variant="outline"
           onClick={onRegenerateWorkout}
           disabled={isLoading}
           aria-label="Regenerate Workout"
           className="w-full" // Changed from flex-1 to w-full for vertical stacking
         >
             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
             Regenerate Workout
         </Button>
      </div>

       {/* Placeholder for History Link/Button - can be moved to layout later */}
       <div className="mt-10 text-center">
           <Button variant="link" disabled>View Workout History (Coming Soon)</Button>
       </div>
    </div>
  );
}