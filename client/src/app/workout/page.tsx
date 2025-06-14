/*
This page is the main entry point for the workout page. It does the following:
- Fetches the workout routine for the current split
- Displays the workout routine
- Redirects to the workout logging logic when the start workout button is clicked
*/
"use client"; // Make the page a Client Component to use hooks

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TodayWorkout } from '@/components/today-workout';
import { WorkoutRoutine, ActiveWorkoutState, LoggedExercise } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
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
  const [currentSplit, setCurrentSplit] = useState<WorkoutSplit>(WorkoutSplit.PUSH);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
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
      split: currentSplit,
    });
    console.log("Workout started, initial loggedData:", initialLoggedData);
    router.push(`/workout/${routineToStart.id}`);
  };


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


  // --- Render Logic ---
  const renderContent = () => {
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