"use client";

import React from 'react';
import { WorkoutLoggingProps, LoggedSet } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, CircleX} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function WorkoutLogging({
  activeWorkout,
  onUpdateLog,
  onNavigateExercise,
  onFinishWorkout,
  isFinishing,
  onCancelWorkout,
}: WorkoutLoggingProps) {
  const { routine, currentExerciseIndex, loggedData } = activeWorkout;
  const currentExercise = routine.routine[currentExerciseIndex];
  const currentLoggedExercise = loggedData[currentExerciseIndex];

  const totalExercises = routine.routine.length;
  const progressValue = ((currentExerciseIndex + 1) / totalExercises) * 100;

  const handleInputChange = (
    setIndex: number,
    field: keyof LoggedSet,
    value: string
  ) => {
    // Basic validation/parsing can happen here or in the parent handler
    onUpdateLog(currentExerciseIndex, setIndex, field, value);
  };

  const isLastExercise = currentExerciseIndex === totalExercises - 1;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <Label className="text-sm text-muted-foreground">
            Workout Progress ({currentExerciseIndex + 1} / {totalExercises})
        </Label>
        <Progress value={progressValue} className="w-full mt-1 h-2" />
      </div>

      {/* Current Exercise Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>{currentExercise.name}</CardTitle>
          <CardDescription>
            Target: {currentExercise.target_sets} sets x {currentExercise.target_reps}
            {currentExercise.target_weight_kg && ` @ ~${currentExercise.target_weight_kg} kg`}
            {currentExercise.rest_period_seconds && ` | Rest: ${currentExercise.rest_period_seconds}s`}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold mb-3">Log Your Sets:</h3>
          {currentLoggedExercise.sets.map((set, setIndex) => (
            <div key={set.set_number} className="grid grid-cols-3 gap-3 items-end border-b pb-3 last:border-b-0">
              <Label className="col-span-3 text-md font-medium">Set {set.set_number}</Label>
              <div>
                <Label htmlFor={`weight-${setIndex}`} className="text-xs text-muted-foreground">Weight (kg)</Label>
                <Input
                  id={`weight-${setIndex}`}
                  type="number"
                  placeholder={currentExercise.target_weight_kg?.toString() ?? "N/A"}
                  value={set.weight_kg}
                  onChange={(e) => handleInputChange(setIndex, 'weight_kg', e.target.value)}
                  className="mt-1"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <Label htmlFor={`reps-${setIndex}`} className="text-xs text-muted-foreground">Reps</Label>
                <Input
                  id={`reps-${setIndex}`}
                  type="number"
                  placeholder={currentExercise.target_reps}
                  value={set.reps}
                  onChange={(e) => handleInputChange(setIndex, 'reps', e.target.value)}
                  className="mt-1"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <Label htmlFor={`rpe-${setIndex}`} className="text-xs text-muted-foreground">RPE (1-10)</Label>
                <Input
                  id={`rpe-${setIndex}`}
                  type="number"
                  placeholder="e.g., 8"
                  value={set.rpe ?? ''}
                  onChange={(e) => handleInputChange(setIndex, 'rpe', e.target.value)}
                  className="mt-1"
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>
            </div>
          ))}
        </CardContent>

         <CardFooter className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onNavigateExercise('prev')}
              disabled={currentExerciseIndex === 0 || isFinishing}
              aria-label="Previous Exercise"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Prev
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  aria-label="Cancel Workout"
                  disabled={isFinishing}
                >
                  <CircleX className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this workout? All logged progress for this session will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isFinishing}>Keep Logging</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCancelWorkout}
                    disabled={isFinishing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     Discard & Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {!isLastExercise ? (
                 <Button
                    onClick={() => onNavigateExercise('next')}
                    aria-label="Next Exercise"
                    disabled={isFinishing}
                 >
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                 </Button>
            ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={isFinishing} aria-label="Finish Workout">
                      {isFinishing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Finish Workout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Finish Workout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will save your logged workout details and end the current session.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isFinishing}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onFinishWorkout} disabled={isFinishing}>
                        {isFinishing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirm & Save
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            )}
         </CardFooter>
      </Card>
    </div>
  );
}