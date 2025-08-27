import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, WorkoutSplit, FetchWorkoutData } from '@/types/api';
import { 
  getStretchingExercises,
  getPushExercises, 
  getPullExercises,
  getAbsExercises,
  getLegsExercises,
  getFullBodyExercises,
  getUserWorkoutHistoryBySplit,
  getCachedUserWorkoutRoutine,
  saveUserWorkoutRoutine
} from '@/lib/workout-queries';
import { generateWorkout } from '@/lib/llm-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const split = searchParams.get('split') as WorkoutSplit | null;
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'user_id is required',
          code: 'MISSING_USER_ID'
        }
      } as ApiResponse<FetchWorkoutData>, { status: 400 });
    }

    // Check for cached workout routine
    const cachedWorkoutRoutine = await getCachedUserWorkoutRoutine(user_id, split);
    if (cachedWorkoutRoutine) {
      console.log(`Found cached workout routine for split: ${split}, returning it.`);
      return NextResponse.json({
        success: true,
        data: { workout: cachedWorkoutRoutine }
      } as ApiResponse<FetchWorkoutData>);
    }

    // Fetch exercises based on split
    const stretchingExercises = await getStretchingExercises();
    let primaryExercises = [];
    
    switch (split) {
      case WorkoutSplit.PUSH:
      case null: // Default to PUSH
        primaryExercises = await getPushExercises();
        break;
      case WorkoutSplit.PULL:
        primaryExercises = await getPullExercises();
        break;
      case WorkoutSplit.ABS:
        primaryExercises = await getAbsExercises();
        break;
      case WorkoutSplit.FULL_BODY:
        primaryExercises = await getFullBodyExercises();
        break;
      case WorkoutSplit.LEGS:
        primaryExercises = await getLegsExercises();
        break;
      default:
        primaryExercises = await getPushExercises();
    }

    // Get user's workout history for the split
    const userWorkoutHistory = await getUserWorkoutHistoryBySplit(user_id, split);
    const currentSplit = split || WorkoutSplit.PUSH;
    
    // TODO: Get user preferences from the actual user
    const userPreferences = `Create a workout routine for the ${currentSplit} split for a 26 year old male who is 180 lbs and 5'10 looking to gain muscle mass and strength.`;
    
    // Generate workout using LLM service
    const generatedWorkout = await generateWorkout({
      userPreferences,
      userWorkoutHistory: userWorkoutHistory || null,
      split: currentSplit,
      stretchingExercises,
      primaryExercises
    });

    // Add ID and store workout routine in database
    const workoutId = `${currentSplit}_${new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')}`;
    generatedWorkout.id = workoutId;
    
    console.log(`Saving workout routine to database for user: ${user_id}, split: ${split}`);
    await saveUserWorkoutRoutine(user_id, currentSplit, generatedWorkout);

    return NextResponse.json({
      success: true,
      data: { workout: generatedWorkout }
    } as ApiResponse<FetchWorkoutData>);

  } catch (error) {
    console.error('Error in /api/workout/today:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to fetch workout: ${error instanceof Error ? error.message : String(error)}`,
        code: 'FETCH_WORKOUT_ERROR'
      }
    } as ApiResponse<FetchWorkoutData>, { status: 500 });
  }
}