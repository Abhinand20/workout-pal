import { WorkoutSplit } from "./api";

export interface Exercise {
    id: string;
    name: string;
    target_sets: number;
    target_reps: string; // Can be a range like "8-10" or specific number
    target_weight_lbs?: number | null; // Optional target weight
    rest_period_seconds?: number | null; // Optional rest time
    tip?: string | null; // Optional tip for the exercise
    // Add other relevant fields if your API provides them
    focus_groups?: string[] | null; // Optional focus groups for the exercise
  }
  
export interface WorkoutRoutine {
  id: string; // Unique identifier for the workout routine
  date: string; // Or a more specific identifier
  ai_insight?: string; // Optional insight from the LLM
  routine: Exercise[];
}

// Interface for the component props, including loading/error states
export interface TodayWorkoutProps {
  workoutData: WorkoutRoutine | null;
  isLoading: boolean;
  error: string | null;
  currentSplit: WorkoutSplit | null;
  onStartWorkout: () => void;
  onRegenerateWorkout: (splitToRegenerate: WorkoutSplit) => void;
}

export interface LoggedSet {
  set_number: number; // e.g., 1, 2, 3... corresponding to target_sets
  weight_lbs: number | string; // Use string to allow empty input initially
  reps: number | string;      // Use string to allow empty input initially
  rpe?: number | string;     // Rating of Perceived Exertion (optional)
  // Add notes field if desired later
  // Timing fields
  startTime?: number; // Timestamp when set becomes active (or last resumed)
  elapsedTime_ms: number; // Accumulated time spent actively on this set
  status: 'pending' | 'active' | 'paused' | 'completed'; // Status of the set
  endTime?: number; // Timestamp when set was marked 'completed'
}

export interface LoggedExercise {
  exercise_id: string; // Link back to the original exercise definition
  name: string;        // For display convenience
  sets: LoggedSet[];   // Array to hold logged data for each set performed
  // Timing fields for the exercise
  startTime?: number; // Timestamp when the first set of this exercise becomes active
  elapsedTime_ms: number; // Accumulated time for the entire exercise (span time)
  status: 'pending' | 'active' | 'paused' | 'completed'; // Status of the exercise
  activeWorkTime_ms?: number; // to store sum of set active times
}

export interface ActiveWorkoutState {
  workout_id: string; // ID of the workout being performed
  startTime: number; // Timestamp (Date.now()) when workout started (absolute start)
  currentSessionStartTime?: number; // Timestamp of when current active period started (for workout pause/resume)
  totalActiveDuration_ms: number; // Accumulated active time for the entire workout
  isPaused: boolean; // Workout pause state
  routine: WorkoutRoutine; // The original routine being performed
  currentExerciseIndex: number;
  loggedData: LoggedExercise[]; // The data being logged by the user
  split: WorkoutSplit; // The split of the workout
}

export interface WorkoutLoggingProps {
    activeWorkout: ActiveWorkoutState;
    onUpdateLog: (exerciseIndex: number, setIndex: number, field: keyof LoggedSet, value: number | string) => void;
    onUpdateSetTimer: (exerciseIndex: number, setIndex: number, action: 'start' | 'pause' | 'reset' | 'finish') => void;
    onNavigateExercise: (direction: 'next' | 'prev') => void;
    onFinishWorkout: () => Promise<void>; // Make async to handle API call
    onCancelWorkout: () => void;
    isFinishing: boolean;
    activeSetInfo: { exerciseIndex: number; setIndex: number } | null;
}