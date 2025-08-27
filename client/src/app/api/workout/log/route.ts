import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, LogWorkoutData, LogWorkoutRequest } from '@/types/api';
import { createWorkoutLog } from '@/lib/workout-queries';

// POST /api/workout/log - Log workout data
export async function POST(request: NextRequest) {
  try {
    const body: LogWorkoutRequest = await request.json();
    const {
      userId,
      workoutRoutineId,
      loggedExercises,
      startTime,
      endTime,
      totalDurationSeconds,
      notes,
      split
    } = body;

    if (!userId || !workoutRoutineId || !loggedExercises || !split) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'userId, workoutRoutineId, loggedExercises, and split are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      } as ApiResponse<LogWorkoutData>, { status: 400 });
    }

    console.log(`Received request to log workout for user: ${userId}, routine: ${workoutRoutineId}`);
    
    const persistedLog = await createWorkoutLog(userId, {
      workoutRoutineId,
      loggedExercises,
      startTime,
      endTime,
      totalDurationSeconds,
      notes,
      split
    });

    if (!persistedLog) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to save workout log to database.',
          code: 'DB_SAVE_ERROR'
        }
      } as ApiResponse<LogWorkoutData>, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        loggedWorkoutId: persistedLog.id,
        message: persistedLog.message
      }
    } as ApiResponse<LogWorkoutData>);

  } catch (error) {
    console.error('Error in POST /api/workout/log:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to log workout: ${error instanceof Error ? error.message : String(error)}`,
        code: 'LOG_WORKOUT_ERROR'
      }
    } as ApiResponse<LogWorkoutData>, { status: 500 });
  }
}