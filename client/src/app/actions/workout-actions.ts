'use server';

import { getAllWorkoutLogs, getAllLoggedExercises } from '@/db/queries/select';
import { SelectLoggedExercise, SelectWorkoutLog } from '@/db/schema';

export async function getWorkoutLogsAction(userId?: string): Promise<{ success: boolean, data?: SelectWorkoutLog[], error?: string }> {
  try {
    const workoutLogs = await getAllWorkoutLogs(userId);
    console.log(JSON.stringify(workoutLogs, null, 2));
    return { success: true, data: workoutLogs };
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return { success: false, error: 'Failed to fetch workout logs' };
  }
}

export async function getLoggedExercisesAction(userId?: string): Promise<{ success: boolean, data?: SelectLoggedExercise[], error?: string }> {
  try {
    const loggedExercises = await getAllLoggedExercises(userId);
    return { success: true, data: loggedExercises };
  } catch (error) {
    console.error('Error fetching logged exercises:', error);
    return { success: false, error: 'Failed to fetch logged exercises' };
  }
} 