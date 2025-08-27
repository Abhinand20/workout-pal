import { eq, desc, getTableColumns } from 'drizzle-orm';
import { db } from '../index';
import { SelectWorkoutLog, SelectLoggedExercise, workoutLogsTable, loggedExercisesTable } from '../schema';

export async function getWorkoutLogs(id: SelectWorkoutLog['id']): Promise<
  Array<SelectWorkoutLog>
> {
  return db.select().from(workoutLogsTable).where(eq(workoutLogsTable.id, id));
}

export async function getAllWorkoutLogs(userId?: string): Promise<
  Array<SelectWorkoutLog>
> {
  if (userId) {
    return db.select().from(workoutLogsTable)
      .where(eq(workoutLogsTable.user_id, userId))
      .orderBy(desc(workoutLogsTable.start_time), desc(workoutLogsTable.id));
  }
  return db.select().from(workoutLogsTable)
    .orderBy(desc(workoutLogsTable.start_time), desc(workoutLogsTable.id));
}

export async function getLoggedExercises(
  workoutLogId: SelectWorkoutLog['id'],
): Promise<
  Array<SelectLoggedExercise>
> {
  return db.select({
    ...getTableColumns(loggedExercisesTable),
  }).from(loggedExercisesTable).where(eq(loggedExercisesTable.workout_log_id, workoutLogId.toString()));
}

export async function getAllLoggedExercises(userId?: string): Promise<
  Array<SelectLoggedExercise>
> {
  if (userId) {
    // Join with workout_logs to filter by user_id
    return db.select({
      ...getTableColumns(loggedExercisesTable),
    })
    .from(loggedExercisesTable)
    .innerJoin(workoutLogsTable, eq(loggedExercisesTable.workout_log_id, workoutLogsTable.id.toString()))
    .where(eq(workoutLogsTable.user_id, userId))
    .orderBy(desc(loggedExercisesTable.start_time));
  }
  return db.select({
    ...getTableColumns(loggedExercisesTable),
  }).from(loggedExercisesTable)
    .orderBy(desc(loggedExercisesTable.start_time));
}
