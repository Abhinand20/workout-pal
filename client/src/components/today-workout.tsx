"use client"; // Mark as Client Component for potential future state/interactions

import React, { useState, useEffect } from 'react';
import { TodayWorkoutProps, Exercise } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Edit, RefreshCw } from "lucide-react"; // Icons
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { WorkoutSplit } from '@/types/api';
import { toast } from 'sonner'; // Assuming you use sonner for toasts

const workoutSplitOptions = Object.values(WorkoutSplit);

export function TodayWorkout({ workoutData, isLoading, error, onStartWorkout, onRegenerateWorkout, currentSplit}: TodayWorkoutProps) {

  // Internal state for the dropdown's current selection.
  // Initialized with currentSplit so it's in sync when the component loads.
  const [dropdownSelectedSplit, setDropdownSelectedSplit] = useState<WorkoutSplit | null>(currentSplit);

  // Effect to synchronize dropdownSelectedSplit if currentSplit prop changes from parent
  // (e.g., after a successful fetch for a different split triggered by regeneration).
  useEffect(() => {
    setDropdownSelectedSplit(currentSplit);
  }, [currentSplit]);

  const handleRegenerateClick = () => {
    if (dropdownSelectedSplit) {
      onRegenerateWorkout(dropdownSelectedSplit);
    } else {
      // This should ideally not happen if the dropdown always has a value,
      // or is initialized correctly.
      toast.error("Please select a workout split from the dropdown first.");
      console.warn("Regenerate clicked but no split selected in dropdown.");
    }
  };

  // Placeholder for editing, assuming it exists
  const handleEditExercise = (exerciseId: string | number) => {
    // TODO: Implement edit exercise logic (open modal/inline edit for specific exercise)
    console.log("Edit Exercise clicked for ID:", exerciseId);
    alert(`Editing exercise ${exerciseId} not implemented yet.`);
  };

  if (isLoading && !workoutData) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Generating your workout...</span>
      </div>
    );
  }

  if (error && !workoutData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Workout</AlertTitle>
        <AlertDescription>
          {error || "Could not fetch the workout."}
          <Button variant="secondary" size="sm" onClick={handleRegenerateClick} className="ml-4 mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!workoutData || workoutData.routine.length === 0) {
    return (
      <Alert>
        <AlertTitle>No Workout Data Available</AlertTitle>
        <AlertDescription>
          No workout routine is currently available. You can try selecting a split and regenerating.
          <div className="mt-4 space-y-2">
            <label htmlFor="empty-state-split-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select split to generate:
            </label>
            <Select
              value={dropdownSelectedSplit || ''}
              onValueChange={(value) => setDropdownSelectedSplit(value as WorkoutSplit)}
            >
              <SelectTrigger id="empty-state-split-select" className="w-full">
                <SelectValue placeholder="Select a split" />
              </SelectTrigger>
              <SelectContent>
                {workoutSplitOptions.map((split) => (
                  <SelectItem key={split} value={split}>
                    {split.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={handleRegenerateClick} className="w-full mt-2" disabled={!dropdownSelectedSplit || isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {isLoading && dropdownSelectedSplit === currentSplit ? "Regenerating..." : "Regenerate Workout"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Today's Workout: <span className="capitalize">{currentSplit?.toString().toLowerCase().replace('_', ' ') || 'N/A'}</span>
        </h1>
        <p className="text-muted-foreground">{workoutData.date}</p>
        {error && isLoading === false && dropdownSelectedSplit && currentSplit !== dropdownSelectedSplit && (
             <Alert variant="default" className="mt-2">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Note</AlertTitle>
                 <AlertDescription>
                 Could not fetch a fresh workout for {dropdownSelectedSplit.toString().toLowerCase().replace('_', ' ')} ({error}).
                 Displaying the previously loaded plan for {currentSplit?.toString().toLowerCase().replace('_', ' ')}.
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <div className="space-y-1">
                    <CardTitle>{exercise.name}</CardTitle>
                    <CardDescription>
                      {exercise.tip}
                    </CardDescription>
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={() => handleEditExercise(exercise.id)}
                   aria-label={`Edit ${exercise.name}`}
                 >
                   <Edit className="h-4 w-4" />
                 </Button>
              </CardHeader>
              <CardContent>
                Sets: {exercise.target_sets} x Reps: {exercise.target_reps}
                {exercise.target_weight_lbs && ` @ ~${exercise.target_weight_lbs} lbs`}
                {exercise.rest_period_seconds && (
                      <p className="text-sm text-muted-foreground">
                          Rest: {exercise.rest_period_seconds} seconds
                      </p>
                )}
                {exercise.focus_groups && exercise.focus_groups.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {exercise.focus_groups.map((group: string) => (
                      <span
                        key={group}
                        className="mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center space-y-4">
         <Button
           size="lg"
           onClick={onStartWorkout}
           disabled={isLoading}
           aria-label="Start Workout"
           className="w-full"
         >
          Start Workout
        </Button>
        <Button
           size="lg"
           variant="outline"
           onClick={handleRegenerateClick}
           disabled={isLoading || !dropdownSelectedSplit}
           aria-label="Regenerate Workout"
           className="w-full"
         >
             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading && dropdownSelectedSplit === currentSplit ? 'animate-spin' : ''}`} />
             {isLoading && dropdownSelectedSplit === currentSplit
                ? `Regenerating ${dropdownSelectedSplit?.toString().toLowerCase().replace('_', ' ')}...`
                : `Regenerate Workout ${dropdownSelectedSplit ? `for ${dropdownSelectedSplit.toString().toLowerCase().replace('_', ' ')}` : ''}`
             }
         </Button>
      </div>

       <div className="mt-10 text-center">
           <Button variant="link" disabled>View Workout History (Coming Soon)</Button>
       </div>
    </div>
  );
}

