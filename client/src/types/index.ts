// src/types/index.ts
export interface Exercise {
    id: string;
    name: string;
    target_sets: number;
    target_reps: string; // Can be a range like "8-10" or specific number
    target_weight_kg?: number | null; // Optional target weight
    rest_period_seconds?: number | null; // Optional rest time
    // Add other relevant fields if your API provides them
  }
  
  export interface WorkoutRoutine {
    date: string; // Or a more specific identifier
    ai_insight?: string; // Optional insight from the LLM
    routine: Exercise[];
  }
  
  // Interface for the component props, including loading/error states
  export interface TodayWorkoutProps {
    workoutData: WorkoutRoutine | null;
    isLoading: boolean;
    error: string | null;
  }