"use client"; // Make the page a Client Component to use hooks

import React, { useState, useEffect, useCallback } from 'react';
import { TodayWorkout } from '@/components/today-workout';
import { WorkoutLogging } from '@/components/log-workout'; // Import the new component
import { WorkoutRoutine, ActiveWorkoutState, LoggedExercise, LoggedSet } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

// Define keys for local storage
const WORKOUT_STATE_KEY = 'activeWorkoutState';
const INITIAL_WORKOUT_KEY = 'initialWorkoutData'; 


export default function HomePage() {
  const [initialWorkoutData, setInitialWorkoutData] = useState<WorkoutRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [isFinishing, setIsFinishing] = useState(false); // Loading state for finish button


  // --- Local Storage Effect ---
  useEffect(() => {
    let loadedActive = false;
    let loadedInitial = false;

    // 1. Try loading active workout state
    try {
        const savedActiveState = localStorage.getItem(WORKOUT_STATE_KEY);
        if (savedActiveState) {
            const parsedState: ActiveWorkoutState = JSON.parse(savedActiveState);
            setActiveWorkout(parsedState);
            loadedActive = true;
            console.log("Loaded active workout session from localStorage.");
        }
    } catch (e) {
        console.error("Failed to load active workout state from localStorage:", e);
        localStorage.removeItem(WORKOUT_STATE_KEY); // Clear potentially corrupted data
    }

    // 2. If no active workout, try loading cached initial workout data
    if (!loadedActive) {
        try {
            const savedInitialData = localStorage.getItem(INITIAL_WORKOUT_KEY);
            if (savedInitialData) {
                const parsedData: WorkoutRoutine = JSON.parse(savedInitialData);
                setInitialWorkoutData(parsedData);
                loadedInitial = true;
                console.log("Loaded initial workout data from localStorage cache.");
            }
        } catch (e) {
            console.error("Failed to load initial workout data from localStorage:", e);
            localStorage.removeItem(INITIAL_WORKOUT_KEY); 
        }
    }

    // 3. If neither active nor initial data was loaded from storage, fetch fresh data
    if (!loadedActive && !loadedInitial) {
        console.log("No active session or cached initial data found. Fetching new workout...");
        fetchInitialWorkout();
    } else {
        setIsLoading(false); // Data loaded from storage, no initial fetch needed now
    }

  }, []); // Empty dependency array ensures this runs only once on mount

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
      setActiveWorkout(null); // This clears the active session from localStorage via useEffect

      // Explicitly reload the initial data from cache into state
      try {
          const savedInitialData = localStorage.getItem(INITIAL_WORKOUT_KEY);
          if (savedInitialData) {
              const parsedData: WorkoutRoutine = JSON.parse(savedInitialData);
              setInitialWorkoutData(parsedData); // Restore the view to the cached initial plan
              console.log("Restored initial workout data from cache after cancel.");
          } else {
              // If cache was somehow cleared, set initial data to null
              setInitialWorkoutData(null);
               console.log("No cached initial data found after cancel.");
               // Optionally trigger a refetch if desired
               // fetchInitialWorkout();
          }
      } catch (e) {
          console.error("Failed to load initial workout data from localStorage during cancel:", e);
          setInitialWorkoutData(null); // Clear on error
          localStorage.removeItem(INITIAL_WORKOUT_KEY);
      }
      setError(null); // Clear any potential errors from the logging phase
      setIsFinishing(false); // Ensure finishing state is reset
  };

  // --- Data Fetching ---
  const fetchInitialWorkout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInitialWorkoutData(null); 
    localStorage.removeItem(INITIAL_WORKOUT_KEY);
    console.log("Attempting to fetch new workout data...");

    // const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Use actual API later
    // ... (rest of the fetch logic using mock data for now) ...

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockWorkout: WorkoutRoutine = {
        date: new Date().toLocaleDateString(),
        ai_insight: `Mock Insight: Focus on form today! ${Math.random().toFixed(2)}`,
        routine: [
          { id: `ex-${Date.now()}-1`, name: "Bench Press (Mock)", target_sets: 3, target_reps: "5-8", target_weight_kg: 60},
          { id: `ex-${Date.now()}-2`, name: "Overhead Press (Mock)", target_sets: 3, target_reps: "6-10", target_weight_kg: 40},
          { id: `ex-${Date.now()}-3`, name: "Pull-ups (Mock)", target_sets: 3, target_reps: "Max", rest_period_seconds: 90},
        ],
      };
      console.log("Mock workout data generated:", mockWorkout);
      setInitialWorkoutData(mockWorkout);

      // Cache the newly fetched data in localStorage
      try {
          localStorage.setItem(INITIAL_WORKOUT_KEY, JSON.stringify(mockWorkout));
          console.log("Initial workout data cached in localStorage.");
      } catch (e) {
          console.error("Failed to cache initial workout data:", e);
      }

    } catch (err) {
      console.error("Error fetching workout:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
       toast.error("Failed to fetch workout plan.");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies

  // --- Workout Control Handlers ---
  const handleStartWorkout = (routineToStart: WorkoutRoutine) => {
    const initialLoggedData: LoggedExercise[] = routineToStart.routine.map(exercise => ({
      exercise_id: exercise.id,
      name: exercise.name,
      sets: Array.from({ length: exercise.target_sets }, (_, i) => ({
        set_number: i + 1,
        weight_kg: '',
        reps: '',
        rpe: '',
      })),
    }));

    setActiveWorkout({
      startTime: Date.now(),
      routine: routineToStart,
      currentExerciseIndex: 0,
      loggedData: initialLoggedData,
    });
    console.log("Workout started.");
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

   const handleFinishWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    setIsFinishing(true);
    setError(null);
    console.log("Attempting to finish and save workout...");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Use actual API later
    if (!apiUrl) {
        setError("API configuration error. Cannot save workout.");
        setIsFinishing(false);
        toast.error("API configuration error. Cannot save workout.");
        return;
    }

    const cleanedLoggedData = activeWorkout.loggedData.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({
            set_number: set.set_number,
            weight_kg: (typeof set.weight_kg === 'string' && set.weight_kg.trim() !== '') ? parseFloat(set.weight_kg) || null : typeof set.weight_kg === 'number' ? set.weight_kg : null,
            reps: (typeof set.reps === 'string' && set.reps.trim() !== '') ? parseInt(set.reps, 10) || null : typeof set.reps === 'number' ? set.reps : null,
            rpe: (typeof set.rpe === 'string' && set.rpe.trim() !== '') ? parseFloat(set.rpe) || null : typeof set.rpe === 'number' ? set.rpe : null,
        })).filter(set => set.weight_kg !== null || set.reps !== null)
    }));


    const payload = {
      started_at: new Date(activeWorkout.startTime).toISOString(),
      finished_at: new Date().toISOString(),
      original_routine: activeWorkout.routine,
      logged_exercises: cleanedLoggedData,
    };

    // Mocking success for now
    try {
        console.log("Simulating successful API call to save workout:", payload);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

        // SUCCESS
        toast.success("Workout saved successfully.");
        setActiveWorkout(null); // Clear active state (this also clears active state localStorage)
        // Also clear the cached initial workout data, as it's now completed
        localStorage.removeItem(INITIAL_WORKOUT_KEY);
        console.log("Cleared cached initial workout data after successful finish.");

        // Re-fetch initial data for the *next* workout automatically
        fetchInitialWorkout();

    } catch (err) { // Keep the original error handling structure for real API calls
        console.error("Error finishing workout:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while saving.";
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
      setIsFinishing(false);
    }
  }, [activeWorkout, fetchInitialWorkout]); // Added fetchInitialWorkout dependency


  // --- Render Logic ---
  const renderContent = () => {
    if (activeWorkout) {
      // Render workout logging view
      return (
        <WorkoutLogging
          activeWorkout={activeWorkout}
          onUpdateLog={handleUpdateLog}
          onNavigateExercise={handleNavigateExercise}
          onFinishWorkout={handleFinishWorkout}
          isFinishing={isFinishing}
          onCancelWorkout={handleCancelWorkout}
        />
      );
    } else if (isLoading) {
      // Render loading state for initial fetch
      return (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading workout...</span>
          </div>
        );
    } else if (error && !initialWorkoutData) {
       // Render error state if loading failed AND we have no cached/stale data
      return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Could not fetch workout."}
              <Button variant="outline" size="sm" onClick={fetchInitialWorkout} className="ml-4">Retry</Button>
            </AlertDescription>
          </Alert>
        );
    } else if (initialWorkoutData) {
      // Render the initial workout display (either fresh or from cache)
      return (
        <TodayWorkout
          workoutData={initialWorkoutData}
          isLoading={false}
          error={error} // Show non-fatal error if fetch failed but we have data
          onStartWorkout={() => handleStartWorkout(initialWorkoutData)}
          onRegenerateWorkout={fetchInitialWorkout}
        />
      );
    } else {
        // Fallback if not loading, no error, but no data (e.g., API returned empty)
         return (
             <Alert>
                 <AlertTitle>No Workout Data</AlertTitle>
                 <AlertDescription>
                 No workout plan available for today. Try fetching again later.
                 <Button variant="outline" size="sm" onClick={fetchInitialWorkout} className="ml-4">Fetch Now</Button>
                 </AlertDescription>
             </Alert>
         );
    }
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