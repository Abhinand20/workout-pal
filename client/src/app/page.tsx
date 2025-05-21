"use client"; // Make the page a Client Component to use hooks

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TodayWorkout } from '@/components/today-workout';
import { WorkoutLogging } from '@/components/log-workout'; // Import the new component
import { WorkoutRoutine, ActiveWorkoutState, LoggedExercise, LoggedSet } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { ApiResponse, FetchWorkoutData, FetchWorkoutParams, LogWorkoutData, LogWorkoutRequest, WorkoutSplit } from '@/types/api';

// Define keys for local storage
const WORKOUT_STATE_KEY = 'activeWorkoutState';
const INITIAL_WORKOUT_KEY = 'initialWorkoutData';
const INITIAL_WORKOUT_SPLIT_KEY = 'initialWorkoutSplit';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch today's workout routine from the API.
async function fetchTodaysWorkout(params: FetchWorkoutParams): Promise<WorkoutRoutine> {
  if (!API_URL) {
    console.error("API URL is not configured.");
    throw new Error("API URL is not configured. Cannot fetch workout.");
  }
  const url = new URL(`${API_URL}/api/workout/today`);
  url.searchParams.set('split', params.split || WorkoutSplit.PUSH);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // If the server responded with an error status (4xx or 5xx)
    const errorData: ApiResponse<FetchWorkoutData> = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
  }
  const result: ApiResponse<FetchWorkoutData> = await response.json();
  if (result.success && result.data) {
    return result.data.workout; // Return the actual workout routine
  } else if (result.error) {
    console.error('API returned an error:', result.error.message);
    throw new Error(result.error.message);
  } else {
    console.error('Unexpected API response structure:', result);
    throw new Error('Unexpected API response structure.');
  }
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [initialWorkoutData, setInitialWorkoutData] = useState<WorkoutRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSplit, setCurrentSplit] = useState<WorkoutSplit | null>(null);

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [isFinishing, setIsFinishing] = useState(false); // Loading state for finish button

  // State to track the currently active set
  const [activeSetInfo, setActiveSetInfo] = useState<{ exerciseIndex: number; setIndex: number } | null>(null);
  const [isInitialLoadEffectComplete, setIsInitialLoadEffectComplete] = useState(false);

  // --- Data Fetching ---
  const fetchWorkoutForSplit = useCallback(async (splitToFetch: WorkoutSplit) => {
    // Simplified guard: if already loading this exact split, don't re-trigger from non-explicit actions
    if (isLoading && currentSplit === splitToFetch) {
      console.log(`Already fetching for split: ${splitToFetch}. Request ignored.`);
      return;
    }

    setIsLoading(true);
    //setError(null); // Clear error only if we are fetching a *new* split.
                     // If it's a retry for the same split that failed, error might still be relevant.
    if (currentSplit !== splitToFetch) {
        setError(null); // Clear error if it's for a different split
    }

    console.log(`Attempting to fetch new workout data for split: ${splitToFetch}...`);

    try {
      const workout = await fetchTodaysWorkout({ split: splitToFetch });
      setInitialWorkoutData(workout);
      setCurrentSplit(splitToFetch); // Update currentSplit to the successfully fetched one
      setError(null); // Clear error on successful fetch
      console.log("Fetched workout data:", workout);

      localStorage.setItem(INITIAL_WORKOUT_KEY, JSON.stringify(workout));
      localStorage.setItem(INITIAL_WORKOUT_SPLIT_KEY, splitToFetch);
      console.log(`Initial workout data and split (${splitToFetch}) cached.`);
    } catch (err) {
      console.error("Error fetching workout:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage); // Set error state
      toast.error(errorMessage || `Failed to fetch workout plan for ${splitToFetch}.`);
      // Do not change currentSplit or initialWorkoutData here if the fetch fails,
      // so the UI can still show the last successfully loaded workout.
      // If initialWorkoutData was for the 'splitToFetch' and it failed, it will be cleared by TodayWorkout's logic or remain null.
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentSplit]); // Removed initialWorkoutData and error from deps to avoid loops

  // --- Local Storage Effect ---
  useEffect(() => {
    let loadedActive = false;

    // 1. Try loading active workout state
    try {
      const savedActiveState = localStorage.getItem(WORKOUT_STATE_KEY);
      if (savedActiveState) {
        const parsedState: ActiveWorkoutState = JSON.parse(savedActiveState);
        setActiveWorkout(parsedState);
        loadedActive = true;
        setIsLoading(false);
        console.log("Loaded active workout session from localStorage.");
        setIsInitialLoadEffectComplete(true);
        return; // Active workout found, main page logic takes over.
      }
    } catch (e) {
      console.error("Failed to load active workout state from localStorage:", e);
      localStorage.removeItem(WORKOUT_STATE_KEY);
    }

    // 2. No active workout, check query params and cache for initial workout
    const querySplit = searchParams.get('split') as WorkoutSplit | null;
    const cachedDataJSON = localStorage.getItem(INITIAL_WORKOUT_KEY);
    const cachedSplitString = localStorage.getItem(INITIAL_WORKOUT_SPLIT_KEY);
    const cachedSplit = cachedSplitString ? cachedSplitString as WorkoutSplit : null;

    if (querySplit) {
      console.log(`Query split detected: ${querySplit}`);
      if (cachedDataJSON && cachedSplit === querySplit) {
        console.log("Query split matches cached data. Using cache.");
        try {
          setInitialWorkoutData(JSON.parse(cachedDataJSON));
          setCurrentSplit(cachedSplit);
          setIsLoading(false);
        } catch (e) {
          console.error("Failed to parse cached initial workout data (with query split):", e);
          localStorage.removeItem(INITIAL_WORKOUT_KEY);
          localStorage.removeItem(INITIAL_WORKOUT_SPLIT_KEY);
          fetchWorkoutForSplit(querySplit);
        }
      } else {
        console.log("Query split present, but differs from cache or cache empty. Fetching new data.");
        fetchWorkoutForSplit(querySplit);
      }
    } else { // No query split
      console.log("No query split in URL.");
      if (cachedDataJSON && cachedSplit) {
        console.log("No query split, but cached data found. Using cache for display, but should go via landing if user needs to pick.");
         try {
           setInitialWorkoutData(JSON.parse(cachedDataJSON));
           setCurrentSplit(cachedSplit);
           setIsLoading(false);
         } catch (e) {
           console.error("Failed to parse cached initial workout data (no query split):", e);
           localStorage.removeItem(INITIAL_WORKOUT_KEY);
           localStorage.removeItem(INITIAL_WORKOUT_SPLIT_KEY);
           router.replace('/landing');
         }
        // If the intent is *always* to go via landing if no query param, then:
        // router.replace('/landing');
      } else {
        console.log("No active session, no query split, no cached data. Redirecting to landing page.");
        router.replace('/landing');
      }
    }
    setIsInitialLoadEffectComplete(true);
  }, [searchParams, router, fetchWorkoutForSplit]);

  useEffect(() => {
    // Save active workout state to localStorage whenever it changes
    if (activeWorkout) {
        try {
            localStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(activeWorkout));
        } catch (e) {
            console.error("Failed to save workout state to localStorage:", e);
            toast.error("Could not save workout progress locally.");
        }
    } else {
      // If workout becomes inactive (finished or cancelled), remove active state from storage
      localStorage.removeItem(WORKOUT_STATE_KEY);
    }
  }, [activeWorkout]);
  
  // Define the cancel handler
  const handleCancelWorkout = () => {
      console.log("Cancel workout requested.");
      setActiveWorkout(null);
      localStorage.removeItem(INITIAL_WORKOUT_KEY); // Clear cached plan as we are navigating away
      localStorage.removeItem(INITIAL_WORKOUT_SPLIT_KEY);
      setError(null);
      setIsFinishing(false);
      router.push('/landing'); // Go back to landing page
      console.log("Workout cancelled, redirected to landing.");
  };


  // --- Workout Control Handlers ---
  const handleStartWorkout = (routineToStart: WorkoutRoutine) => {
    const initialLoggedData: LoggedExercise[] = routineToStart.routine.map(exercise => ({
      exercise_id: exercise.id,
      name: exercise.name,
      sets: Array.from({ length: exercise.target_sets }, (_, i) => ({
        set_number: i + 1,
        weight_lbs: '',
        reps: '',
        rpe: '',
        startTime: undefined,
        elapsedTime_ms: 0,
        status: 'pending',
        endTime: undefined,
      })),
      elapsedTime_ms: 0,
      status: 'pending',
    }));

    setActiveWorkout({
      workout_id: routineToStart.id,
      startTime: Date.now(),
      currentSessionStartTime: Date.now(),
      routine: routineToStart,
      currentExerciseIndex: 0,
      loggedData: initialLoggedData,
      totalActiveDuration_ms: 0,
      isPaused: false,
    });
    console.log("Workout started, initial loggedData:", initialLoggedData);
  };

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

  const handleNavigateExercise = useCallback((direction: 'next' | 'prev') => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newIndex = direction === 'next'
        ? Math.min(prev.currentExerciseIndex + 1, prev.routine.routine.length - 1)
        : Math.max(prev.currentExerciseIndex - 1, 0);
      return { ...prev, currentExerciseIndex: newIndex };
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

  // --- Regenerate Workout Handler ---
  const handleRegenerateWorkout = useCallback((splitToRegenerate: WorkoutSplit) => {
    console.log(`Regenerate workout requested for split: ${splitToRegenerate}`);
    // Set initialWorkoutData to null if regenerating for a *different* split
    // to ensure the loading spinner for TodayWorkout shows correctly.
    if (currentSplit !== splitToRegenerate) {
        setInitialWorkoutData(null);
    }
    fetchWorkoutForSplit(splitToRegenerate);
  }, [fetchWorkoutForSplit, currentSplit]); // Added currentSplit as dependency

  // --- Finish Workout ---
  const handleFinishWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    setIsFinishing(true);
    setError(null);
    console.log("Attempting to finish and save workout...");

    const cleanedLoggedData = activeWorkout.loggedData.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({
            set_number: set.set_number,
            weight_lbs: (typeof set.weight_lbs === 'string' && set.weight_lbs.trim() !== '') ? parseFloat(set.weight_lbs) || null : typeof set.weight_lbs === 'number' ? set.weight_lbs : null,
            reps: (typeof set.reps === 'string' && set.reps.trim() !== '') ? parseInt(set.reps, 10) || null : typeof set.reps === 'number' ? set.reps : null,
            rpe: (typeof set.rpe === 'string' && set.rpe.trim() !== '') ? parseFloat(set.rpe) || null : typeof set.rpe === 'number' ? set.rpe : null,
        })).filter(set => set.weight_lbs !== null || set.reps !== null)
    }));

    const payload: LogWorkoutRequest = {
      workoutRoutineId: activeWorkout.routine.id,
      loggedExercises: activeWorkout.loggedData,
      startTime: activeWorkout.startTime,
      endTime: Date.now(),
      totalDurationSeconds: (Date.now() - activeWorkout.startTime) / 1000,
      notes: '',
    };
    try {
      // Call the real API endpoint
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
        localStorage.removeItem(INITIAL_WORKOUT_KEY);
        localStorage.removeItem(INITIAL_WORKOUT_SPLIT_KEY);
        console.log("Cleared cached initial workout data and split after successful finish.");
      } else if (result.error) {
        console.error('API returned an error:', result.error.message);
        throw new Error(result.error.message);
      } else {
        console.error('Unexpected API response structure:', result);
        throw new Error('Unexpected API response structure.');
      }
      // Add a delay before pushing to landing
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

  // --- Render Logic ---
  const renderContent = () => {
    if (activeWorkout) {
      // Render workout logging view
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

    // More robust loading check for the very initial load
    if (isLoading && !isInitialLoadEffectComplete && !initialWorkoutData) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading workout data...</span>
            </div>
        );
    }
    
    // If initial load is complete OR we have some data (even if also loading new data)
    // and we have a currentSplit (meaning a workout was attempted or loaded)
    // OR if there's an error that needs to be shown with the TodayWorkout context
    if (isInitialLoadEffectComplete && (currentSplit || initialWorkoutData || error)) {
      return (
        <TodayWorkout
          workoutData={initialWorkoutData}
          isLoading={isLoading}
          error={error}
          onStartWorkout={() => initialWorkoutData && handleStartWorkout(initialWorkoutData)}
          onRegenerateWorkout={handleRegenerateWorkout} // Passed as is
          currentSplit={currentSplit}
          // onCurrentSplitChange is no longer needed/passed
        />
      );
    }
    
    // Fallback if still loading or redirecting (e.g. to /landing)
    // This handles the case where initial load is done, but no split/data/error yet,
    // implying a redirect to /landing might be in progress or just occurred.
    if (!activeWorkout) { // Ensure we are not in an active workout state
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading page...</span>
            </div>
        );
    }
    return null; // Should be covered by redirects or other states
  };


  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
       {/* Render error prominently if finish workout fails, but not initial fetch errors which are handled in renderContent */}
       {error && activeWorkout && (
             <Alert variant="destructive" className="mb-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Saving Error</AlertTitle>
                 <AlertDescription>{error}</AlertDescription>
             </Alert>
       )}
       {renderContent()}
    </main>
  );
}