/*
This page handles workout logging logic for a specific generated workout.
It does the following:
- Fetches the active workout state from local storage
- Handles timers and set statuses to track the progress of the workout
- Handles navigation between exercises
- Handles finishing the workout and saving the workout to the backend
- Handles canceling the workout and redirecting to the landing page
*/
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ActiveWorkoutState,
  LoggedExercise,
  LoggedSet,
} from "@/types";
import { WorkoutLogging } from "@/components/log-workout";
import { ApiResponse, LogWorkoutData, LogWorkoutRequest } from "@/types/api";

const WORKOUT_STATE_KEY = "activeWorkoutState";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function WorkoutLoggerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(
    null
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const [_, setError] = useState<string | null>(null);
  const [activeSetInfo, setActiveSetInfo] = useState<{
    exerciseIndex: number;
    setIndex: number;
  } | null>(null);

  // ─────────────────────────────────────
  // bootstrap - load activeWorkout from LS
  // ─────────────────────────────────────
  useEffect(() => {
    try {
      // TODO: Once workout state is stored in the backend, we can replace this with a fetch call to get the active workout state.
      // How often should the backend be updated with the active workout state?
      const json = localStorage.getItem(WORKOUT_STATE_KEY);
      if (!json) throw new Error("No active workout found");
      const parsed: ActiveWorkoutState = JSON.parse(json);

      if (parsed.workout_id.toString() !== id) {
        throw new Error("Workout id mismatch");
      }
      setActiveWorkout(parsed);
    } catch (e) {
      toast.error("No active workout session -- redirecting");
      router.replace("/workout");
    }
  }, [id, router]);

  // keep LS in-sync
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  const handleUpdateLog = useCallback((exerciseIndex: number, setIndex: number, field: keyof LoggedSet, value: number | string) => {
     setActiveWorkout(prev => {
        if (!prev) return null;
        const newLoggedData = JSON.parse(JSON.stringify(prev.loggedData));
        if (newLoggedData[exerciseIndex] && newLoggedData[exerciseIndex].sets[setIndex]) {
             newLoggedData[exerciseIndex].sets[setIndex][field] = value;
        } else {
            console.warn(`Attempted to update non-existent set: Exercise ${exerciseIndex}, Set ${setIndex}`);
        }
        return { ...prev, loggedData: newLoggedData };
     });
  }, []);

  const handleUpdateSetTimer = useCallback((exerciseIndex: number, setIndex: number, action: 'start' | 'pause' | 'reset' | 'finish') => {
    setActiveWorkout(prevActiveWorkout => {
      if (!prevActiveWorkout) return null;

      const newLoggedData = JSON.parse(JSON.stringify(prevActiveWorkout.loggedData));
      const set = newLoggedData[exerciseIndex]?.sets[setIndex];
      const currentExercise = newLoggedData[exerciseIndex];


      if (!set || !currentExercise) {
        console.error("Set or Exercise not found for timer update:", { exerciseIndex, setIndex });
        return prevActiveWorkout;
      }

      const now = Date.now();
      let newActiveSetInfo = activeSetInfo;

      // Prevent starting a NEW set if another set is ALREADY active
      // This situation will generally not happen since UI already prevents it.
      if (action === 'start' && activeSetInfo &&
          (activeSetInfo.exerciseIndex !== exerciseIndex || activeSetInfo.setIndex !== setIndex) &&
          newLoggedData[activeSetInfo.exerciseIndex]?.sets[activeSetInfo.setIndex]?.status === 'active') {
        
        console.warn(`Action blocked: Cannot start Set ${setIndex + 1} in Ex ${exerciseIndex + 1} because Set ${activeSetInfo.setIndex + 1} in Ex ${activeSetInfo.exerciseIndex + 1} is already active.`);
        toast.error("Another set is currently active. Please pause or finish it first.");
        return prevActiveWorkout;
      }

      switch (action) {
        case 'start': // Can be a fresh start or resume
          if (set.status === 'pending' || set.status === 'paused') {
            const wasPending = set.status === 'pending';
            if (wasPending) {
              set.elapsedTime_ms = 0;
            }
            set.status = 'active';
            set.startTime = now;
            newActiveSetInfo = { exerciseIndex, setIndex };
            console.log(`Set ${setIndex + 1} Ex ${exerciseIndex + 1} timer started/resumed. ActiveSet:`, newActiveSetInfo);

            // Implicitly start exercise timer if it is not already active
            if (wasPending && currentExercise.status === 'pending') {
              currentExercise.startTime = now; // Use 'now' as it's the true start of activity
              currentExercise.status = 'active';
              console.log(`Exercise ${exerciseIndex + 1} implicitly started. Start time: ${currentExercise.startTime}`);
            }
          }
          break;
        case 'pause':
          if (set.status === 'active' && set.startTime) {
            set.elapsedTime_ms += (now - set.startTime);
            set.startTime = undefined;
            set.status = 'paused';
            if (activeSetInfo && activeSetInfo.exerciseIndex === exerciseIndex && activeSetInfo.setIndex === setIndex) {
              newActiveSetInfo = null;
            }
            console.log(`Set ${setIndex + 1} timer paused. Accumulated time: ${set.elapsedTime_ms}`);
          }
          break;
        case 'finish':
          if (set.status === 'active' && set.startTime) {
            set.elapsedTime_ms += (now - set.startTime);
          }
          // If paused and then finished, elapsedTime_ms is already up-to-date
          set.startTime = undefined;
          set.status = 'completed';
          set.endTime = now;
          if (activeSetInfo && activeSetInfo.exerciseIndex === exerciseIndex && activeSetInfo.setIndex === setIndex) {
            newActiveSetInfo = null;
          }
          console.log(`Set ${setIndex + 1} Ex ${exerciseIndex + 1} timer finished. End time: ${set.endTime}, Total set time: ${set.elapsedTime_ms}`);
          break;
        case 'reset':
          set.elapsedTime_ms = 0;
          set.startTime = undefined;
          set.endTime = undefined; // Clear end time on reset
          set.status = 'pending';
          if (activeSetInfo && activeSetInfo.exerciseIndex === exerciseIndex && activeSetInfo.setIndex === setIndex) {
            newActiveSetInfo = null;
          }
          console.log(`Set ${setIndex + 1} timer reset.`);
          break;
      }
      const allSetsInExerciseCompleted = currentExercise.sets.every((s: LoggedSet) => s.status === 'completed');
      
      if (allSetsInExerciseCompleted && currentExercise.status === 'active') {
        currentExercise.status = 'completed';
        // Update the activeWorkTime_ms for the exercise by summing up the active times of all sets
        currentExercise.activeWorkTime_ms = currentExercise.sets.reduce((sum: number, set: LoggedSet) => {
          return sum + (set.elapsedTime_ms || 0);
        }, 0);
        currentExercise.elapsedTime_ms = currentExercise.activeWorkTime_ms;
        console.log(`Exercise ${exerciseIndex + 1} completed. Active work time: ${currentExercise.activeWorkTime_ms}ms, Total elapsed time: ${currentExercise.elapsedTime_ms}ms`);

        // Find the latest endTime among all sets of this exercise
        let maxSetEndTime = 0;
        currentExercise.sets.forEach((s: LoggedSet) => {
          if (s.endTime && s.endTime > maxSetEndTime) {
            maxSetEndTime = s.endTime;
          }
        });

        if (currentExercise.startTime && maxSetEndTime > 0) {
          currentExercise.elapsedTime_ms = maxSetEndTime - currentExercise.startTime;
          console.log(`Exercise ${exerciseIndex + 1} implicitly completed. Span time (elapsedTime_ms): ${currentExercise.elapsedTime_ms}ms. Started: ${currentExercise.startTime}, Ended: ${maxSetEndTime}`);
        } else {
            console.warn(`Exercise ${exerciseIndex + 1} all sets completed, but couldn't calculate span time. StartTime: ${currentExercise.startTime}, MaxSetEndTime: ${maxSetEndTime}`);
            currentExercise.elapsedTime_ms = 0; // Or handle as error/undefined
        }
      }
      setActiveSetInfo(newActiveSetInfo);
      console.log("Active set info updated:", newActiveSetInfo);
      return { ...prevActiveWorkout, loggedData: newLoggedData };
    });
  }, [activeSetInfo]);

  const handleNavigateExercise = useCallback((direction: 'next' | 'prev') => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newIndex = direction === 'next'
        ? Math.min(prev.currentExerciseIndex + 1, prev.routine.routine.length - 1)
        : Math.max(prev.currentExerciseIndex - 1, 0);
      return { ...prev, currentExerciseIndex: newIndex };
    });
  }, []);

  const handleCancelWorkout = () => {
    setActiveWorkout(null);
    localStorage.removeItem(WORKOUT_STATE_KEY);
    router.push("/landing");
  };

  // --- Finish Workout ---
  const handleFinishWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    
    setIsFinishing(true);
    setError(null);
    console.log("Attempting to finish and save workout...");
    const cleanedLoggedData: LoggedExercise[] = activeWorkout.loggedData
    .filter(ex => ex.status !== 'pending')
    .map(ex => ({
        ...ex,
        sets: ex.sets.filter(set => set.status !== 'pending'),
        status: 'completed',
    }))


    console.log("Cleaned logged data:", cleanedLoggedData);

    const payload: LogWorkoutRequest = {
      workoutRoutineId: activeWorkout.routine.id,
      loggedExercises: cleanedLoggedData,
      startTime: activeWorkout.startTime,
      endTime: Date.now(),
      totalDurationSeconds: (Date.now() - activeWorkout.startTime) / 1000,
      notes: '',
      split: activeWorkout.split,
    };
    try {
      console.log("Sending workout log to server:", JSON.stringify(payload));
      const response = await fetch(`${API_URL}/api/workout/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: ApiResponse<LogWorkoutData> = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      const result: ApiResponse<LogWorkoutData> = await response.json();
      if (result.success && result.data) {
        toast.success("Workout saved successfully.");
        setActiveWorkout(null);
      } else if (result.error) {
        console.error('API returned an error:', result.error.message);
        throw new Error(result.error.message);
      } else {
        console.error('Unexpected API response structure:', result);
        throw new Error('Unexpected API response structure.');
      }
      // Add a delay before pushing to landing
      // TODO: Redirect to the finished workout page instead of landing page
      // Populate the finished workout page with the workout data and insights
      setTimeout(() => {
        router.push('/landing');
      }, 2000);

    } catch (err) {
      console.error("Error finishing workout:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsFinishing(false);
    }
  }, [activeWorkout, router]);

  // ─────────────────────────────────────
  // render
  // ─────────────────────────────────────
  if (!activeWorkout) {
    return null; // splash screen already handled in useEffect
  }

  return (
    <WorkoutLogging
      activeWorkout={activeWorkout}
      onUpdateLog={handleUpdateLog}
      onUpdateSetTimer={handleUpdateSetTimer}
      onNavigateExercise={handleNavigateExercise}
      onFinishWorkout={handleFinishWorkout}
      isFinishing={isFinishing}
      onCancelWorkout={handleCancelWorkout}
      activeSetInfo={activeSetInfo}
    />
  );
}