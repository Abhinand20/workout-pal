"use client"; // Make the page a Client Component to use hooks
/*
This page is the main entry point for the workout page. It does the following:
- Fetches the workout routine for the current split
- Displays the workout routine
- Redirects to the workout logging logic when the start workout button is clicked
*/

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TodayWorkout } from '@/components/today-workout';
import { WorkoutRoutine, ActiveWorkoutState, LoggedExercise } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { ApiResponse, CreateActiveWorkoutSessionData, FetchWorkoutData, FetchWorkoutParams, WorkoutSplit } from '@/types/api';
import { useSession } from '@/lib/auth-client';
import { useWorkoutPageTitle } from '@/lib/use-page-title';

// Fetch today's workout routine from the Next.js API.
async function fetchTodaysWorkout(params: FetchWorkoutParams): Promise<WorkoutRoutine> {
  const url = new URL('/api/workout/today', window.location.origin);
  url.searchParams.set('split', params.split || WorkoutSplit.PUSH);
  url.searchParams.set('user_id', params.userId);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
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

async function addActiveWorkoutSession(
  userId: string,
  activeWorkoutSession: ActiveWorkoutState,
): Promise<CreateActiveWorkoutSessionData> {
  const response = await fetch('/api/workout/active', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activeWorkoutSession: activeWorkoutSession, userId: userId }),
  });
  if (!response.ok) {
    const errorData: ApiResponse<CreateActiveWorkoutSessionData> = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
    console.error('API Error:', errorData);
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
  }
  const result: ApiResponse<CreateActiveWorkoutSessionData> = await response.json();
  if (result.success && result.data) {
    return result.data;
  } else if (result.error) {
    console.error('API returned an error:', result.error.message);
    throw new Error(result.error.message);
  } 
  console.error('Unexpected API response structure:', result);
  throw new Error('Unexpected API response structure.');
}

function WorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: sessionData, isPending, error: sessionError } = useSession();
  const [initialWorkoutData, setInitialWorkoutData] = useState<WorkoutRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSplit, setCurrentSplit] = useState<WorkoutSplit>(WorkoutSplit.PUSH);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);

  // Dynamic page title based on current split
  useWorkoutPageTitle(currentSplit, "Workout");


  // --- Data Fetching ---
  const fetchWorkoutForSplit = useCallback(async (splitToFetch: WorkoutSplit) => {
    setIsLoading(true);
    console.log(`Attempting to fetch new workout data for split: ${splitToFetch}...`);
    try {
      var userId = sessionData?.user.id;
      if (!userId) {
        throw new Error("User ID is not set");
      }
      const workout = await fetchTodaysWorkout({ split: splitToFetch, userId: userId });
      setInitialWorkoutData(workout);
      setCurrentSplit(splitToFetch);
    } catch (err) {
      console.error("Error fetching workout:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage); 
      toast.error(errorMessage || `Failed to fetch workout plan for ${splitToFetch}.`);
    } finally {
      setIsLoading(false);
    }
  }, [sessionData]);

  // --- Query Param Effect ---
  // This effect is responsible for fetching the workout data for the split specified in the query param.
  // If no query param is present, it redirects to the landing page.
  useEffect(() => {
    if (isPending) {
      return;
    }
    const querySplit = searchParams.get('split') as WorkoutSplit | null;
    if (querySplit) {
      console.log(`Query split detected: ${querySplit}`);
      fetchWorkoutForSplit(querySplit);
    } else { // No query split
      console.log("No query split in URL, redirecting to landing page.");
      router.replace('/landing');
    }
  }, [searchParams, fetchWorkoutForSplit, isPending, sessionData]);

  // --- Workout Control Handlers ---
  const handleStartWorkout = async (routineToStart: WorkoutRoutine) => {
    // TODO: Remove this once we migrate off of sqlite.
    var userId = sessionData?.user.id;
    if (!userId) {
      // TODO: Remove this once we migrate off of sqlite.
      userId = "123";
      // throw new Error("User ID is not set");
    }
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

    const activeWorkout = {
      workout_id: routineToStart.id,
      startTime: Date.now(),
      currentSessionStartTime: Date.now(),
      routine: routineToStart,
      currentExerciseIndex: 0,
      loggedData: initialLoggedData,
      totalActiveDuration_ms: 0,
      isPaused: false,
      split: currentSplit,
    };
    setActiveWorkout(activeWorkout);
    try {
      const activeSessionResponse = await addActiveWorkoutSession(userId, activeWorkout);
      const sessionId = activeSessionResponse.active_workout_session_id;
      console.log(`Workout started, sessionId: ${sessionId}`);
      router.push(`/workout/${sessionId}`);
    } catch (err) {
      console.error("Error starting workout:", err);
      toast.error("Failed to start workout. Please try again.");
    }
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
    if ((isLoading && !initialWorkoutData) || isPending) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading workout data...</span>
            </div>
        );
    }
    
    // If we have some data (even if also loading new data)
    // and we have a currentSplit (meaning a workout was attempted or loaded)
    // OR if there's an error that needs to be shown with the TodayWorkout context
    if (currentSplit || initialWorkoutData || error) {
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


export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkoutPage />
    </Suspense>
  );
}