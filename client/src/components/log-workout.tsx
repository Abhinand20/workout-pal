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
    // Basic validation/parsing
    let storedValue: number | string = value;
    if (field === 'weight_lbs' || field === 'reps') {
      if (value === '') {
        value = '0';
      }
      storedValue = parseFloat(value);
    }
    onUpdateLog(currentExerciseIndex, setIndex, field, storedValue);
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
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div className="px-1">
          <Label className="text-sm text-muted-foreground">
              Workout Progress ({currentExerciseIndex + 1} / {totalExercises})
          </Label>
          <Progress value={progressValue} className="w-full mt-1 h-2" />
        </div>

        {/* Current Exercise Card */}
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="text-lg sm:text-xl">{currentExercise.name}</CardTitle>
            <CardDescription>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <span className="font-semibold">Target:</span>{" "}
                  <span className="text-primary ml-1">{currentExercise.target_sets} sets</span>
                  <span className="mx-1">×</span>
                  <span className="text-primary">{currentExercise.target_reps} reps</span>
                </span>
                {currentExercise.target_weight_lbs && (
                  <span className="flex items-center">
                    <span className="font-semibold">Weight:</span>{" "}
                    <span className="text-primary ml-1">~{currentExercise.target_weight_lbs} lbs</span>
                  </span>
                )}
                {currentExercise.rest_period_seconds && (
                  <span className="flex items-center">
                    <span className="font-semibold">Rest:</span>{" "}
                    <span className="text-primary ml-1">{currentExercise.rest_period_seconds}s</span>
                  </span>
                )}
              </div>
              {currentExercise.tip && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <span className="text-primary font-medium">Tip:</span>{" "}
                  <span className="italic">{currentExercise.tip}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-4">
            <h3 className="font-semibold mb-4 text-base">Log Your Sets:</h3>
            <div className="space-y-6">
              {currentLoggedExercise.sets.map((set, setIndex) => {
                // Determine if this specific set is the globally active one
                const isThisSetGloballyActive = activeSetInfo?.exerciseIndex === currentExerciseIndex && activeSetInfo?.setIndex === setIndex;
                // Determine if *any* set is globally active (and it's not this one)
                const isAnotherSetGloballyActive = activeSetInfo !== null && !isThisSetGloballyActive;

                return (
                  <div key={set.set_number} className="bg-gray-50/50 rounded-lg p-4 space-y-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Set {set.set_number}</Label>
                      {set.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    {/* Input Grid - More compact on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`weight-${setIndex}`} className="text-xs text-muted-foreground block mb-1">
                          Weight (lbs)
                        </Label>
                        <Input
                          id={`weight-${setIndex}`}
                          type="number"
                          placeholder={currentExercise.target_weight_lbs?.toString() ?? "0"}
                          value={set.weight_lbs}
                          onChange={(e) => handleInputChange(setIndex, 'weight_lbs', e.target.value)}
                          className="text-sm"
                          min="0"
                          step="0.5"
                          disabled={set.status === 'completed' || isAnotherSetGloballyActive}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`reps-${setIndex}`} className="text-xs text-muted-foreground block mb-1">
                          Reps
                        </Label>
                        <Input
                          id={`reps-${setIndex}`}
                          type="number"
                          placeholder={currentExercise.target_reps}
                          value={set.reps}
                          onChange={(e) => handleInputChange(setIndex, 'reps', e.target.value)}
                          className="text-sm"
                          min="0"
                          step="1"
                          disabled={set.status === 'completed' || isAnotherSetGloballyActive}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`rpe-${setIndex}`} className="text-xs text-muted-foreground block mb-1">
                          RPE (1-10)
                        </Label>
                        <Input
                          id={`rpe-${setIndex}`}
                          type="number"
                          placeholder="8"
                          value={set.rpe ?? ''}
                          onChange={(e) => handleInputChange(setIndex, 'rpe', e.target.value)}
                          className="text-sm"
                          min="1"
                          max="10"
                          step="0.5"
                          disabled={set.status === 'completed' || isAnotherSetGloballyActive}
                        />
                      </div>
                    </div>
                    
                    {/* Timer Display and Controls */}
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Set Timer:</span>{" "}
                          <span className="font-mono text-base text-primary font-semibold">
                            {set.status === 'active' && set.startTime
                              ? formatTime(set.elapsedTime_ms + (Date.now() - set.startTime))
                              : formatTime(set.elapsedTime_ms)}
                          </span>
                          {set.status === 'paused' && <span className="text-xs italic ml-2 text-orange-600">(Paused)</span>}
                          {isAnotherSetGloballyActive && set.status !== 'completed' && <span className="text-xs italic ml-2 text-orange-500">(Another set active)</span>}
                        </div>
                        
                        {/* Control buttons aligned with timer */}
                        <div className="flex flex-wrap gap-2">
                          {set.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'start')}
                              disabled={isAnotherSetGloballyActive || isFinishing}
                            >
                              <Play className="h-4 w-4 mr-1" /> Start Set
                            </Button>
                          )}
                          {set.status === 'active' && isThisSetGloballyActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'pause')}
                              disabled={isFinishing}
                            >
                              <Pause className="h-4 w-4 mr-1" /> Pause
                            </Button>
                          )}
                          {set.status === 'paused' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'start')}
                              disabled={isAnotherSetGloballyActive || isFinishing}
                            >
                              <Play className="h-4 w-4 mr-1" /> Resume
                            </Button>
                          )}
                          {((set.status === 'active' && isThisSetGloballyActive) || set.status === 'paused') && (
                              <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'finish')}
                                  disabled={isFinishing || (isAnotherSetGloballyActive && set.status !== 'paused')}
                              >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Finish
                              </Button>
                          )}
                          {(set.status === 'paused' || set.status === 'completed' || (set.status === 'pending' && set.elapsedTime_ms > 0)) && (
                             <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdateSetTimer(currentExerciseIndex, setIndex, 'reset')}
                              className="text-destructive hover:text-destructive"
                              disabled={(isAnotherSetGloballyActive || isFinishing)}
                             >
                               <RefreshCcw className="h-4 w-4 mr-1" /> Reset
                             </Button>
                          )}
                           {set.status === 'completed' && (
                             <Button variant="ghost" size="sm" disabled className="text-green-600">
                                <TimerOff className="h-4 w-4 mr-1" /> Completed
                             </Button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t bg-gray-50/30">
            <Button
              variant="outline"
              onClick={() => onNavigateExercise('prev')}
              disabled={currentExerciseIndex === 0 || isFinishing}
              aria-label="Previous Exercise"
              className="order-1 sm:order-none"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive order-3 sm:order-none"
                  aria-label="Cancel Workout"
                  disabled={isFinishing}
                >
                  <CircleX className="h-4 w-4 mr-1" /> Cancel Workout
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
                    className="order-2 sm:order-none"
                 >
                    Next Exercise <ArrowRight className="h-4 w-4 ml-1" />
                 </Button>
            ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={isFinishing} aria-label="Finish Workout" className="order-2 sm:order-none">
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
    </div>
  );
}