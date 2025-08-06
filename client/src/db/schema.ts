import { integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const workoutLogsTable = pgTable('workout_logs', {
  id: serial('id').primaryKey(),
  workout_routine_id: text('workout_routine_id').notNull(),
  user_id: text('user_id').notNull(),
  split: text('split').notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  total_duration_seconds: integer('total_duration_seconds').notNull(),
  notes: text('notes'),
});

export const loggedExercisesTable = pgTable('logged_exercises', {
  id: serial('id').primaryKey(),
  workout_log_id: text('workout_log_id').notNull(),
  exercise_id: text('exercise_id').notNull(),
  name: text('name').notNull(),
  sets: json('sets').notNull(),
  start_time: timestamp('start_time').notNull(),
  end_time: timestamp('end_time').notNull(),
  status: text('status').notNull(),
  active_work_time_ms: integer('active_work_time_ms').notNull(),
});

export type InsertWorkoutLog = typeof workoutLogsTable.$inferInsert;
export type InsertLoggedExercise = typeof loggedExercisesTable.$inferInsert;

export type SelectWorkoutLog = typeof workoutLogsTable.$inferSelect;
export type SelectLoggedExercise = typeof loggedExercisesTable.$inferSelect;
