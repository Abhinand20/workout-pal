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
  onStartWorkout: () => void;
  onRegenerateWorkout: () => void;
}

export interface LoggedSet {
  set_number: number; // e.g., 1, 2, 3... corresponding to target_sets
  weight_kg: number | string; // Use string to allow empty input initially
  reps: number | string;      // Use string to allow empty input initially
  rpe?: number | string;     // Rating of Perceived Exertion (optional)
  // Add notes field if desired later
}

export interface LoggedExercise {
  exercise_id: string; // Link back to the original exercise definition
  name: string;        // For display convenience
  sets: LoggedSet[];   // Array to hold logged data for each set performed
}

export interface ActiveWorkoutState {
  startTime: number; // Timestamp (Date.now()) when workout started
  routine: WorkoutRoutine; // The original routine being performed
  currentExerciseIndex: number;
  loggedData: LoggedExercise[]; // The data being logged by the user
}

export interface WorkoutLoggingProps {
    activeWorkout: ActiveWorkoutState;
    onUpdateLog: (exerciseIndex: number, setIndex: number, field: keyof LoggedSet, value: number | string) => void;
    onNavigateExercise: (direction: 'next' | 'prev') => void;
    onFinishWorkout: () => Promise<void>; // Make async to handle API call
    onCancelWorkout: () => void;
    isFinishing: boolean; // Loading state for the finish button
}