import { WorkoutSplit } from './api';
import { WorkoutRoutine, Exercise, LoggedExercise } from './index';

// =============================================================================
// Database Schema Types (matching server-side SQLAlchemy models)
// =============================================================================

/**
 * Exercise database schema - matches the exercises table structure
 * from the Python server's SQLAlchemy model
 */
export interface ExerciseDB {
  id: string;
  name: string;
  force: string; // 'push' | 'pull' | 'static' | 'None'
  level: string; // 'beginner' | 'intermediate' | 'expert'
  mechanic: string | null; // 'compound' | 'isolation' | 'None' | null
  equipment: string;
  primary_muscles: string[]; // JSON array of primary muscle groups
  secondary_muscles: string[]; // JSON array of secondary muscle groups
  instructions: string[]; // JSON array of instruction steps
  category: string; // 'strength' | 'stretching' | 'polymetrics' | 'powerlifting' | 'cardio'
  images: string[]; // JSON array of image URLs
}

/**
 * User workout routine database schema - matches user_workout_routines table
 */
export interface WorkoutRoutineJson {
  id: string;
  date: string;
  ai_insight?: string;
  routine: Exercise[];
}

export interface UserWorkoutRoutineDB {
  id: string;
  split: string; // WorkoutSplit enum value as string
  generated_date: Date;
  routine_json: string;
}

/**
 * Active workout session database schema - matches active_workout_sessions table
 */
export interface ActiveWorkoutSessionDB {
  id: string;
  user_id: string;
  active_workout_session_json: {
    workout_id: string;
    startTime: number;
    currentSessionStartTime?: number;
    totalActiveDuration_ms: number;
    isPaused: boolean;
    routine: WorkoutRoutine;
    currentExerciseIndex: number;
    loggedData: LoggedExercise[];
    split: WorkoutSplit;
  };
}

/**
 * Workout log database schema - matches workout_logs table (server-side)
 */
export interface WorkoutLogDB {
  id: string;
  workout_routine_id: string;
  user_id: string;
  split: string; // WorkoutSplit enum value as string
  start_time: number; // Unix timestamp (milliseconds)
  end_time: number | null; // Unix timestamp (milliseconds)
  total_duration_seconds: number | null;
  notes: string | null;
}

/**
 * Logged exercise database schema - matches logged_exercises table (server-side)
 */
export interface LoggedExerciseDB {
  id: string;
  workout_log_id: string;
  exercise_id: string;
  name: string;
  sets: Array<{
    set_number: number;
    weight_lbs: number | string;
    reps: number | string;
    rpe?: number | string;
    startTime?: number;
    elapsedTime_ms: number;
    status: 'pending' | 'active' | 'paused' | 'completed';
    endTime?: number;
  }>; // JSON array of logged sets
  start_time: number | null; // Unix timestamp
  elapsed_time_ms: number;
  status: string; // 'pending' | 'active' | 'paused' | 'completed'
  active_work_time_ms: number | null;
}

// =============================================================================
// Exercise Query Filter Types
// =============================================================================

/**
 * Enum values for exercise filtering (matching Python enums)
 */
export enum ExerciseForce {
  PUSH = 'push',
  PULL = 'pull',
  STATIC = 'static',
  NONE = 'None'
}

export enum ExerciseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert'
}

export enum ExerciseCategory {
  STRENGTH = 'strength',
  STRETCHING = 'stretching',
  POLYMETRICS = 'polymetrics',
  POWERLIFTING = 'powerlifting',
  CARDIO = 'cardio'
}

export enum ExerciseMechanic {
  COMPOUND = 'compound',
  ISOLATION = 'isolation',
  NONE = 'None'
}

export enum PrimaryMuscle {
  QUADRICEPS = 'quadriceps',
  SHOULDERS = 'shoulders',
  ABDOMINALS = 'abdominals',
  CHEST = 'chest',
  HAMSTRINGS = 'hamstrings',
  TRICEPS = 'triceps',
  BICEPS = 'biceps',
  LATS = 'lats',
  MIDDLE_BACK = 'middle back',
  CALVES = 'calves',
  LOWER_BACK = 'lower back',
  FOREARMS = 'forearms',
  GLUTES = 'glutes',
  TRAPS = 'traps',
  ADDUCTORS = 'adductors',
  NECK = 'neck',
  ABDUCTORS = 'abductors'
}

/**
 * Exercise filter interface for database queries
 */
export interface ExerciseFilter {
  primary_muscle?: PrimaryMuscle;
  level?: ExerciseLevel;
  category?: ExerciseCategory;
  force?: ExerciseForce;
  mechanic?: ExerciseMechanic;
}

// =============================================================================
// LLM Service Types
// =============================================================================

/**
 * Parameters for generating a workout using LLM service
 */
export interface GenerateWorkoutParams {
  userPreferences: string;
  userWorkoutHistory: LoggedExercise[] | null;
  split: WorkoutSplit;
  stretchingExercises: ExerciseDB[];
  primaryExercises: ExerciseDB[];
}

/**
 * Raw workout response from LLM before processing
 */
export interface LLMWorkoutResponse {
  ai_insight: string;
  routine: Exercise[];
}

// =============================================================================
// Query Result Types
// =============================================================================

/**
 * Unified type for exercise query results
 */
export type ExerciseQueryResult = ExerciseDB[];

/**
 * Result type for workout history queries
 */
export interface WorkoutHistoryResult {
  workoutLog: WorkoutLogDB;
  loggedExercises: LoggedExerciseDB[];
}

/**
 * Cache lookup result for user workout routines
 */
export interface CachedWorkoutResult {
  routine: WorkoutRoutine | null;
  wasCacheHit: boolean;
}