import { WorkoutRoutine, Exercise, LoggedExercise } from './index';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string; // Optional error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
    message: string; // Detailed error message
    details?: any; // Optional additional error details
  };
}

export enum WorkoutSplit {
  FULL_BODY = 'FULL_BODY',
  PUSH = 'PUSH',
  PULL = 'PULL',
  ABS = 'ABS',
  LEGS = 'LEGS'
  // Add other splits as needed
}

// 3. Fetch Today's Workout
// Request parameters
export interface FetchWorkoutParams {
  split?: WorkoutSplit;
  // Add other potential filtering/input parameters here
  // For example: date?: string; (if fetching for a specific date other than today)
}

export interface FetchWorkoutData {
  workout: WorkoutRoutine;
  // You could add other metadata here if the backend provides it,
  // e.g., daily_quote: string;
}

export interface EditExerciseRequest {
  workoutId: string; // ID of the current workout routine instance
  exerciseIdToReplace: string; // ID of the exercise to be replaced
  userPrompt: string; // User's request for the change
  // Potentially, send the entire current list of exercises for more context if needed
  // currentExercises?: Exercise[];
}

export interface EditExerciseData {
  newExercise: Exercise;
  // Optionally, the backend might return the full updated list of exercises
  // updatedRoutine?: Exercise[];
}
// The full API response will be: ApiResponse<EditExerciseData>


export interface LogWorkoutRequest {
  workoutRoutineId: string; // ID of the base WorkoutRoutine that was performed
  loggedExercises: LoggedExercise[];
  startTime?: number; // Timestamp (Date.now()) when workout started
  endTime?: number; // Timestamp (Date.now()) when workout was completed
  totalDurationSeconds?: number; // Total time spent on the workout in seconds
  notes?: string; // Overall notes for the logged workout session
}

export interface LogWorkoutData {
  loggedWorkoutId: string; // The ID of the persisted log entry in the database
  message: string; // e.g., "Workout logged successfully"
  // Potentially return some summary or achievements if applicable
}
// The full API response will be: ApiResponse<LogWorkoutData>
