"use client";

import React from 'react';
import { WorkoutLoggingProps, LoggedSet } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, CircleX, Play, Pause, RefreshCcw, TimerOff } from 'lucide-react';
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
  onUpdateSetTimer,
  onNavigateExercise,
  onFinishWorkout,
  isFinishing,
  onCancelWorkout,
  activeSetInfo,
}: WorkoutLoggingProps) {
  const { routine, currentExerciseIndex, loggedData } = activeWorkout;
  const currentExercise = routine.routine[currentExerciseIndex];
  const currentLoggedExercise = loggedData[currentExerciseIndex];

  const totalExercises = routine.routine.length;
  const progressValue = ((currentExerciseIndex + 1) / totalExercises) * 100;

  // Dummy state to trigger re-renders for live timer updates
  const [, setTick] = React.useState(0);

  const handleInputChange = (
    setIndex: number,
    field: keyof LoggedSet,
    value: string
  ) => {
    // Basic validation/parsing can happen here or in the parent handler
    onUpdateLog(currentExerciseIndex, setIndex, field, value);
  };

  // Timer display and update logic
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Effect to update active timers
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    const currentExerciseSets = currentLoggedExercise?.sets;

    if (currentExerciseSets) {
        const isAnySetAwaitingLiveUpdate = currentExerciseSets.some(set => set.status === 'active');
        if (isAnySetAwaitingLiveUpdate) {
            intervalId = setInterval(() => {
                setTick(prevTick => prevTick + 1); 
            }, 1000);
        }
    }
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
  }, [currentLoggedExercise?.sets, currentExerciseIndex]);

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
            {currentExercise.target_weight_lbs && ` @ ~${currentExercise.target_weight_lbs} lbs`}
            {currentExercise.rest_period_seconds && ` | Rest: ${currentExercise.rest_period_seconds}s`}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold mb-3">Log Your Sets:</h3>
          {currentLoggedExercise.sets.map((set, setIndex) => {
            // Determine if this specific set is the globally active one
            const isThisSetGloballyActive = activeSetInfo?.exerciseIndex === currentExerciseIndex && activeSetInfo?.setIndex === setIndex;
            // Determine if *any* set is globally active (and it's not this one)
            const isAnotherSetGloballyActive = activeSetInfo !== null && !isThisSetGloballyActive;

            return (
              <div key={set.set_number} className="space-y-3 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                <Label className="col-span-3 text-md font-medium">Set {set.set_number}</Label>
                <div className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <Label htmlFor={`weight-${setIndex}`} className="text-xs text-muted-foreground">Weight (kg)</Label>
                    <Input
                      id={`weight-${setIndex}`}
                      type="number"
                      placeholder={currentExercise.target_weight_lbs?.toString() ?? "N/A"}
                      value={set.weight_lbs}
                      onChange={(e) => handleInputChange(setIndex, 'weight_lbs', e.target.value)}
                      className="mt-1"
                      min="0"
                      step="0.5"
                      disabled={set.status === 'active' || set.status === 'completed' || isAnotherSetGloballyActive}
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
                      disabled={set.status === 'active' || set.status === 'completed' || isAnotherSetGloballyActive}
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
                      disabled={set.status === 'active' || set.status === 'completed' || isAnotherSetGloballyActive}
                    />
                  </div>
                </div>
                {/* Timer Display and Controls */}
                <div className="mt-3 flex flex-col items-start space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Set Timer: <span className="font-semibold text-primary">
                      {set.status === 'active' && set.startTime
                        ? formatTime(set.elapsedTime_ms + (Date.now() - set.startTime))
                        : formatTime(set.elapsedTime_ms)}
                    </span>
                    {set.status === 'paused' && <span className="text-xs italic ml-1">(Paused)</span>}
                    {isAnotherSetGloballyActive && set.status !== 'completed' && <span className="text-xs italic ml-1 text-orange-500">(Another set active)</span>}
                  </div>
                  <div className="flex space-x-2">
                    {set.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'start')}
                        disabled={isAnotherSetGloballyActive || isFinishing} // Disable if another set is active or workout is finishing
                      >
                        <Play className="h-4 w-4 mr-1" /> Start Set
                      </Button>
                    )}
                    {set.status === 'active' && isThisSetGloballyActive && ( // Only show Pause if this specific set is the active one
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'pause')}
                        disabled={isFinishing}
                      >
                        <Pause className="h-4 w-4 mr-1" /> Pause Set
                      </Button>
                    )}
                    {set.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'start')}
                        disabled={isAnotherSetGloballyActive || isFinishing} // Disable if another set is active or workout is finishing
                      >
                        <Play className="h-4 w-4 mr-1" /> Resume Set
                      </Button>
                    )}
                    {/* Finish Set button logic:
                        - Show if this set is 'active' AND it's the globally active one
                        - OR if this set is 'paused' (regardless of global active status, as paused sets can be finished)
                        - Disable if workout is finishing
                        - Disable if another set is globally active AND this set is NOT paused (prevents finishing a non-active, non-paused set)
                    */}
                    {((set.status === 'active' && isThisSetGloballyActive) || set.status === 'paused') && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'finish')}
                            disabled={isFinishing || (isAnotherSetGloballyActive && set.status !== 'paused')}
                        >
                            <CheckCircle className="h-4 w-4 mr-1" /> Finish Set
                        </Button>
                    )}
                    {/* Reset Timer button logic:
                        - Show if set is 'paused', 'completed', or ('pending' AND has some time)
                        - Disable if another set is globally active 
                        - Disable if workout is finishing
                    */}
                    {(set.status === 'paused' || set.status === 'completed' || (set.status === 'pending' && set.elapsedTime_ms > 0)) && (
                       <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'reset')}
                        className="text-destructive hover:text-destructive"
                        disabled={(isAnotherSetGloballyActive || isFinishing)}
                       >
                         <RefreshCcw className="h-4 w-4 mr-1" /> Reset Timer
                       </Button>
                    )}
                     {set.status === 'completed' && (
                       <Button variant="ghost" size="sm" disabled className="text-green-600">
                          <TimerOff className="h-4 w-4 mr-1" /> Set Completed
                       </Button>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
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