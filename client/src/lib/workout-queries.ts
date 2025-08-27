import { db } from '@/db';
import { randomUUID } from "crypto"
import { loggedExercisesTable, workoutLogsTable } from '@/db/schema';
import { WorkoutRoutine, LoggedExercise, ActiveWorkoutState } from '@/types';
import { WorkoutSplit } from '@/types/api';
import { 
  ExerciseDB, 
  UserWorkoutRoutineDB,
  ExerciseQueryResult,
  WorkoutRoutineJson
} from '@/types/database';
import { sql, desc, eq, and } from 'drizzle-orm';

// Exercise database connection (PostgreSQL connection for server-side exercises table)
const exerciseDbUrl = process.env.EXERCISE_DATABASE_URL || process.env.DATABASE_URL;
if (!exerciseDbUrl) {
  throw new Error('EXERCISE_DATABASE_URL or DATABASE_URL must be set');
}

// Import postgres for direct queries to exercise database
import postgres from 'postgres';
const exerciseClient = postgres(exerciseDbUrl);

// Exercise filter functions
export async function getStretchingExercises(): Promise<ExerciseQueryResult> {
  const result = await exerciseClient`
    SELECT * FROM exercises 
    WHERE category = 'stretching'
  `;
  return result as unknown as ExerciseQueryResult;
}

export async function getPushExercises(): Promise<ExerciseQueryResult> {
  const result = await exerciseClient`
    SELECT * FROM exercises 
    WHERE force = 'push'
  `;
  return result as unknown as ExerciseQueryResult;
}

export async function getPullExercises(): Promise<ExerciseQueryResult> {
  const result = await exerciseClient`
    SELECT * FROM exercises 
    WHERE force = 'pull'
  `;
  return result as unknown as ExerciseQueryResult;
}

export async function getAbsExercises(): Promise<ExerciseQueryResult> {
  const result = await exerciseClient`
    SELECT * FROM exercises 
    WHERE primary_muscles::jsonb @> '["abdominals"]'::jsonb
  `;
  return result as unknown as ExerciseQueryResult;
}

export async function getLegsExercises(): Promise<ExerciseQueryResult> {
  const result = await exerciseClient`
    SELECT * FROM exercises 
    WHERE primary_muscles::jsonb @> ANY(ARRAY[
      '["quadriceps"]'::jsonb,
      '["hamstrings"]'::jsonb,
      '["calves"]'::jsonb,
      '["glutes"]'::jsonb
    ])
  `;
  return result as unknown as ExerciseQueryResult;
}

export async function getFullBodyExercises(): Promise<ExerciseQueryResult> {
  const result = await exerciseClient`
    SELECT * FROM exercises 
    WHERE mechanic = 'compound'
  `;
  return result as unknown as ExerciseQueryResult;
}

// User workout routine caching functions
export async function getCachedUserWorkoutRoutine(
  userId: string, 
  split: WorkoutSplit | null
): Promise<WorkoutRoutine | null> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await exerciseClient`
      SELECT * FROM user_workout_routines 
      WHERE user_id = ${userId} 
        AND split = ${split || WorkoutSplit.PUSH}
        AND generated_date::date = ${today.toISOString().split('T')[0]}
      ORDER BY generated_date DESC 
      LIMIT 1
    `;
    if (result.length > 0) {
      const routine = result[0] as UserWorkoutRoutineDB;
      const routineJson = JSON.parse(routine.routine_json) as WorkoutRoutineJson;
      return {
        id: routine.id,
        date: routine.generated_date.toISOString().split('T')[0],
        ai_insight: routineJson.ai_insight,
        routine: routineJson.routine
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching cached workout routine:', error);
    throw error;
  }
}

export async function saveUserWorkoutRoutine(
  userId: string,
  split: WorkoutSplit,
  workoutRoutine: WorkoutRoutine
): Promise<void> {
  try {
    const id = randomUUID();
    await exerciseClient`
      INSERT INTO user_workout_routines (id, user_id, split, generated_date, routine_json)
      VALUES (${id}, ${userId}, ${split}, ${new Date()}, ${JSON.stringify(workoutRoutine)}::jsonb)
    `;
  } catch (error) {
    console.error('Error saving workout routine:', error);
    throw error;
  }
}

// Utility function to clear cached workout routines (for debugging)
export async function clearCachedWorkoutRoutines(): Promise<void> {
  try {
    await exerciseClient`DELETE FROM user_workout_routines`;
    console.log('Cleared all cached workout routines');
  } catch (error) {
    console.error('Error clearing cached workout routines:', error);
    throw error;
  }
}

// Active workout session functions
export async function createActiveWorkoutSession(
  userId: string,
  activeWorkoutSession: any
): Promise<string> {
  try {
    const sessionId = randomUUID();
    await exerciseClient`
      INSERT INTO active_workout_sessions (id, user_id, active_workout_session_json)
      VALUES (${sessionId}, ${userId}, ${JSON.stringify(activeWorkoutSession)})
    `;
    return sessionId;
  } catch (error) {
    console.error('Error creating active workout session:', error);
    throw error;
  }
}

export async function getActiveWorkoutSession(
  sessionId: string
): Promise<any | null> {
  try {
    const result = await exerciseClient`
      SELECT * FROM active_workout_sessions 
      WHERE id = ${sessionId}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return null;
    }
    const activeWorkoutSession = result[0].active_workout_session_json;
    return JSON.parse(activeWorkoutSession) as ActiveWorkoutState;
  } catch (error) {
    console.error('Error fetching active workout session:', error);
    throw error;
  }
}

export async function updateActiveWorkoutSession(
  sessionId: string,
  activeWorkoutSession: any
): Promise<string> {
  try {
    const result = await exerciseClient`
      UPDATE active_workout_sessions 
      SET active_workout_session_json = ${JSON.stringify(activeWorkoutSession)}
      WHERE id = ${sessionId}
    `;
    
    if (result.count === 0) {
      throw new Error(`Active workout session with ID '${sessionId}' not found.`);
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error updating active workout session:', error);
    throw error;
  }
}

export async function deleteActiveWorkoutSession(
  sessionId: string
): Promise<void> {
  try {
    await exerciseClient`
      DELETE FROM active_workout_sessions 
      WHERE id = ${sessionId}
    `;
  } catch (error) {
    console.error('Error deleting active workout session:', error);
    throw error;
  }
}

// Workout history functions
export async function getUserWorkoutHistoryBySplit(
  userId: string,
  split: WorkoutSplit | null
): Promise<LoggedExercise[] | null> {
  try {
    // Get the most recent workout log for this user and split
    const workoutLogs = await db
      .select()
      .from(workoutLogsTable)
      .where(
        and(
          eq(workoutLogsTable.user_id, userId),
          eq(workoutLogsTable.split, split || WorkoutSplit.PUSH)
        )
      )
      .orderBy(desc(workoutLogsTable.start_time))
      .limit(1);

    if (workoutLogs.length === 0) {
      return null;
    }

    const latestWorkoutLog = workoutLogs[0];
    
    // Get logged exercises for this workout
    const loggedExercises = await db
      .select()
      .from(loggedExercisesTable)
      .where(eq(loggedExercisesTable.workout_log_id, latestWorkoutLog.id.toString()));

    // Transform database records to LoggedExercise format
    return loggedExercises.map(le => ({
      exercise_id: le.exercise_id,
      name: le.name,
      sets: le.sets as any[], // JSON field
      startTime: le.start_time,
      elapsedTime_ms: le.elapsed_time_ms,
      status: le.status as 'pending' | 'active' | 'paused' | 'completed',
      activeWorkTime_ms: le.active_work_time_ms
    }));
  } catch (error) {
    console.error('Error fetching user workout history:', error);
    throw error;
  }
}

// Workout logging functions
export async function createWorkoutLog(
  userId: string,
  logData: {
    workoutRoutineId: string;
    loggedExercises: any[];
    startTime?: number;
    endTime?: number;
    totalDurationSeconds?: number;
    notes?: string;
    split: WorkoutSplit;
  }
): Promise<{ id: string; message: string }> {
  try {
    // Create the main workout log entry
    const newLogId = `log_${logData.workoutRoutineId}_${logData.startTime || 'manual'}`;
    const duration = Math.round(logData.totalDurationSeconds || 0);
    // Insert workout log into server database
    await exerciseClient`
      INSERT INTO workout_logs (id, workout_routine_id, user_id, start_time, end_time, total_duration_seconds, split, notes)
      VALUES (${newLogId}, ${logData.workoutRoutineId}, ${userId}, ${logData.startTime || null}, ${logData.endTime || null}, ${duration}, ${logData.split}, ${logData.notes || null})
    `;

    // Insert logged exercises into server database
    for (const exerciseLogData of logData.loggedExercises) {
      const exerciseId = randomUUID();
      const setsData = exerciseLogData.sets || [];

      await exerciseClient`
        INSERT INTO logged_exercises (id, workout_log_id, exercise_id, name, sets, start_time, elapsed_time_ms, status, active_work_time_ms)
        VALUES (${exerciseId}, ${newLogId}, ${exerciseLogData.exercise_id}, ${exerciseLogData.name}, ${JSON.stringify(setsData)}, ${exerciseLogData.startTime || null}, ${exerciseLogData.elapsedTime_ms || 0}, ${exerciseLogData.status}, ${exerciseLogData.activeWorkTime_ms || null})
      `;
    }

    // Also insert into client database for dashboard queries
    const clientWorkoutLog = await db.insert(workoutLogsTable).values({
      workout_routine_id: logData.workoutRoutineId,
      user_id: userId,
      split: logData.split,
      start_time: logData.startTime || Date.now(),
      end_time: logData.endTime || Date.now(),
      total_duration_seconds: logData.totalDurationSeconds || 0,
      notes: logData.notes
    }).returning();

    // Insert logged exercises into client database
    for (const exerciseLogData of logData.loggedExercises) {
      await db.insert(loggedExercisesTable).values({
        workout_log_id: clientWorkoutLog[0].id.toString(),
        exercise_id: exerciseLogData.exercise_id,
        name: exerciseLogData.name,
        sets: exerciseLogData.sets || [],
        start_time: exerciseLogData.startTime,
        elapsed_time_ms: exerciseLogData.elapsedTime_ms,
        status: exerciseLogData.status,
        active_work_time_ms: exerciseLogData.activeWorkTime_ms
      });
    }

    return {
      id: newLogId,
      message: 'Workout logged successfully.'
    };
  } 
  catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      console.warn('Duplicate workout log detected, skipping insert');
      return {
        id: logData.workoutRoutineId,
        message: 'Workout already logged.'
      };
    }
    console.error('Error creating workout log:', error);
    throw error;
  }
}