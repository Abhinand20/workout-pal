"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, Tooltip, Legend } from 'recharts';
import { Calendar, Trophy, Target, TrendingUp, Dumbbell, Clock, Activity, BarChart3, User, Filter } from 'lucide-react';

// Expanded mock data with more splits
const mockWorkoutLogs = [
  {
    id: "log_1_1704067200000",
    workout_routine_id: "routine_1",
    user_id: "user_123",
    split: "Push",
    start_time: 1704067200000,
    end_time: 1704070800000,
    total_duration_seconds: 3600,
    notes: "Great session, hit new PR on bench press"
  },
  {
    id: "log_2_1703980800000", 
    workout_routine_id: "routine_2",
    user_id: "user_123",
    split: "Pull",
    start_time: 1703980800000,
    end_time: 1703984400000,
    total_duration_seconds: 3300,
    notes: "Focused on form today"
  },
  {
    id: "log_3_1703808000000",
    workout_routine_id: "routine_3", 
    user_id: "user_123",
    split: "Legs",
    start_time: 1703808000000,
    end_time: 1703811600000,
    total_duration_seconds: 3600,
    notes: "Legs are on fire!"
  },
  {
    id: "log_4_1703721600000",
    workout_routine_id: "routine_1",
    user_id: "user_123", 
    split: "Push",
    start_time: 1703721600000,
    end_time: 1703725200000,
    total_duration_seconds: 3600,
    notes: "Solid workout"
  },
  {
    id: "log_5_1703548800000",
    workout_routine_id: "routine_2",
    user_id: "user_123",
    split: "Pull", 
    start_time: 1703548800000,
    end_time: 1703552400000,
    total_duration_seconds: 3300,
    notes: "Back and biceps focused"
  },
  {
    id: "log_6_1703462400000",
    workout_routine_id: "routine_4",
    user_id: "user_123",
    split: "Abs",
    start_time: 1703462400000,
    end_time: 1703464200000,
    total_duration_seconds: 1800,
    notes: "Core blast session"
  },
  {
    id: "log_7_1703376000000",
    workout_routine_id: "routine_3",
    user_id: "user_123",
    split: "Legs",
    start_time: 1703376000000,
    end_time: 1703379600000,
    total_duration_seconds: 3600,
    notes: "Squat day"
  },
  {
    id: "log_8_1703289600000",
    workout_routine_id: "routine_5",
    user_id: "user_123",
    split: "Upper",
    start_time: 1703289600000,
    end_time: 1703293200000,
    total_duration_seconds: 3600,
    notes: "Upper body focused"
  }
];

// Expanded mock logged exercises with different muscle groups
const mockLoggedExercises = [
  // Push Day (most recent)
  {
    id: "ex_1",
    workout_log_id: "log_1_1704067200000",
    exercise_id: "bench_press",
    name: "Bench Press",
    muscle_group: "Chest",
    force: "Push",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 80, reps: 8, rpe: 7, elapsedTime_ms: 30000, status: "completed" },
      { set_number: 2, weight_kg: 85, reps: 6, rpe: 8, elapsedTime_ms: 32000, status: "completed" },
      { set_number: 3, weight_kg: 90, reps: 4, rpe: 9, elapsedTime_ms: 35000, status: "completed" },
    ],
    start_time: 1704067200000,
    elapsed_time_ms: 600000,
    status: "completed",
    active_work_time_ms: 97000
  },
  {
    id: "ex_2", 
    workout_log_id: "log_1_1704067200000",
    exercise_id: "shoulder_press",
    name: "Shoulder Press",
    muscle_group: "Shoulders",
    force: "Push",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 30, reps: 12, rpe: 6, elapsedTime_ms: 25000, status: "completed" },
      { set_number: 2, weight_kg: 32.5, reps: 10, rpe: 7, elapsedTime_ms: 27000, status: "completed" },
      { set_number: 3, weight_kg: 35, reps: 8, rpe: 8, elapsedTime_ms: 30000, status: "completed" },
    ],
    start_time: 1704067800000,
    elapsed_time_ms: 480000,
    status: "completed", 
    active_work_time_ms: 82000
  },
  {
    id: "ex_3a",
    workout_log_id: "log_1_1704067200000",
    exercise_id: "tricep_dips",
    name: "Tricep Dips",
    muscle_group: "Arms",
    force: "Push",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 20, reps: 15, rpe: 6, elapsedTime_ms: 25000, status: "completed" },
      { set_number: 2, weight_kg: 25, reps: 12, rpe: 7, elapsedTime_ms: 27000, status: "completed" },
      { set_number: 3, weight_kg: 30, reps: 10, rpe: 8, elapsedTime_ms: 30000, status: "completed" },
    ],
    start_time: 1704068400000,
    elapsed_time_ms: 360000,
    status: "completed", 
    active_work_time_ms: 82000
  },
  // Pull Day
  {
    id: "ex_3",
    workout_log_id: "log_2_1703980800000",
    exercise_id: "deadlift",
    name: "Deadlift",
    muscle_group: "Back",
    force: "Pull",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 120, reps: 5, rpe: 8, elapsedTime_ms: 40000, status: "completed" },
      { set_number: 2, weight_kg: 125, reps: 4, rpe: 9, elapsedTime_ms: 42000, status: "completed" },
      { set_number: 3, weight_kg: 130, reps: 3, rpe: 9.5, elapsedTime_ms: 45000, status: "completed" },
    ],
    start_time: 1703980800000,
    elapsed_time_ms: 720000,
    status: "completed",
    active_work_time_ms: 127000
  },
  {
    id: "ex_4",
    workout_log_id: "log_2_1703980800000",
    exercise_id: "pull_ups",
    name: "Pull-ups",
    muscle_group: "Back",
    force: "Pull",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 0, reps: 12, rpe: 7, elapsedTime_ms: 30000, status: "completed" },
      { set_number: 2, weight_kg: 5, reps: 10, rpe: 8, elapsedTime_ms: 32000, status: "completed" },
      { set_number: 3, weight_kg: 10, reps: 8, rpe: 9, elapsedTime_ms: 35000, status: "completed" },
    ],
    start_time: 1703981400000,
    elapsed_time_ms: 480000,
    status: "completed",
    active_work_time_ms: 97000
  },
  {
    id: "ex_5",
    workout_log_id: "log_2_1703980800000",
    exercise_id: "bicep_curls",
    name: "Bicep Curls",
    muscle_group: "Arms",
    force: "Pull",
    mechanic: "Isolation",
    sets: [
      { set_number: 1, weight_kg: 15, reps: 15, rpe: 6, elapsedTime_ms: 25000, status: "completed" },
      { set_number: 2, weight_kg: 17.5, reps: 12, rpe: 7, elapsedTime_ms: 27000, status: "completed" },
      { set_number: 3, weight_kg: 20, reps: 10, rpe: 8, elapsedTime_ms: 30000, status: "completed" },
    ],
    start_time: 1703982000000,
    elapsed_time_ms: 360000,
    status: "completed",
    active_work_time_ms: 82000
  },
  // Legs Day
  {
    id: "ex_6",
    workout_log_id: "log_3_1703808000000",
    exercise_id: "squats",
    name: "Barbell Squats",
    muscle_group: "Legs",
    force: "Push",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 100, reps: 8, rpe: 7, elapsedTime_ms: 35000, status: "completed" },
      { set_number: 2, weight_kg: 105, reps: 6, rpe: 8, elapsedTime_ms: 37000, status: "completed" },
      { set_number: 3, weight_kg: 110, reps: 5, rpe: 9, elapsedTime_ms: 40000, status: "completed" },
    ],
    start_time: 1703808000000,
    elapsed_time_ms: 600000,
    status: "completed",
    active_work_time_ms: 112000
  },
  {
    id: "ex_7",
    workout_log_id: "log_3_1703808000000",
    exercise_id: "leg_press",
    name: "Leg Press",
    muscle_group: "Legs",
    force: "Push",
    mechanic: "Compound",
    sets: [
      { set_number: 1, weight_kg: 200, reps: 15, rpe: 6, elapsedTime_ms: 30000, status: "completed" },
      { set_number: 2, weight_kg: 220, reps: 12, rpe: 7, elapsedTime_ms: 32000, status: "completed" },
      { set_number: 3, weight_kg: 240, reps: 10, rpe: 8, elapsedTime_ms: 35000, status: "completed" },
    ],
    start_time: 1703808600000,
    elapsed_time_ms: 480000,
    status: "completed",
    active_work_time_ms: 97000
  },
  // Abs Day
  {
    id: "ex_8",
    workout_log_id: "log_6_1703462400000",
    exercise_id: "planks",
    name: "Planks",
    muscle_group: "Abs",
    force: "Static",
    mechanic: "Isolation",
    sets: [
      { set_number: 1, weight_kg: 0, reps: 60, rpe: 7, elapsedTime_ms: 60000, status: "completed" },
      { set_number: 2, weight_kg: 0, reps: 45, rpe: 8, elapsedTime_ms: 45000, status: "completed" },
      { set_number: 3, weight_kg: 0, reps: 30, rpe: 9, elapsedTime_ms: 30000, status: "completed" },
    ],
    start_time: 1703462400000,
    elapsed_time_ms: 300000,
    status: "completed",
    active_work_time_ms: 135000
  }
];

// Mock data for exercise-specific view
const benchPressHistory = [
  { date: "2024-01-01", estimated1RM: 102, maxWeight: 90, totalVolume: 1920, session: "Push Day" },
  { date: "2023-12-28", estimated1RM: 100, maxWeight: 87.5, totalVolume: 1800, session: "Push Day" },
  { date: "2023-12-25", estimated1RM: 98, maxWeight: 85, totalVolume: 1750, session: "Push Day" },
  { date: "2023-12-21", estimated1RM: 96, maxWeight: 82.5, totalVolume: 1680, session: "Push Day" },
  { date: "2023-12-18", estimated1RM: 94, maxWeight: 80, totalVolume: 1600, session: "Push Day" },
];

const benchPressPRs = [
  { repRange: "1 Rep", weight: "90kg", date: "2024-01-01" },
  { repRange: "3 Reps", weight: "85kg", date: "2023-12-28" },
  { repRange: "5 Reps", weight: "80kg", date: "2023-12-25" },
  { repRange: "8 Reps", weight: "75kg", date: "2023-12-21" },
  { repRange: "10 Reps", weight: "70kg", date: "2023-12-18" },
];

// Calculate total volume for a workout
const calculateWorkoutVolume = (workoutLogId: string) => {
  return mockLoggedExercises
    .filter(ex => ex.workout_log_id === workoutLogId)
    .reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((sum, set) => sum + (set.weight_kg * set.reps), 0);
      return total + exerciseVolume;
    }, 0);
};

// Filter functions for analytics
const filterDataBySplit = (split: string) => {
  if (split === 'All') return mockWorkoutLogs;
  return mockWorkoutLogs.filter(log => log.split === split);
};

const filterExercisesBySplit = (split: string) => {
  if (split === 'All') return mockLoggedExercises;
  const filteredLogs = filterDataBySplit(split);
  const logIds = filteredLogs.map(log => log.id);
  return mockLoggedExercises.filter(ex => logIds.includes(ex.workout_log_id));
};

// Get last workout
const lastWorkout = mockWorkoutLogs[0];
const lastWorkoutVolume = calculateWorkoutVolume(lastWorkout.id);
const lastWorkoutDate = new Date(lastWorkout.start_time);
const lastWorkoutDuration = Math.round(lastWorkout.total_duration_seconds / 60);

// This week's activity data
const thisWeekData = mockWorkoutLogs
  .map(log => ({
    day: new Date(log.start_time).toLocaleDateString('en-US', { weekday: 'short' }),
    volume: calculateWorkoutVolume(log.id),
    split: log.split,
    date: new Date(log.start_time).getDate()
  }))
  .reverse();

// Overall stats
const totalWorkouts = mockWorkoutLogs.length;
const allTimeVolume = mockWorkoutLogs.reduce((total, log) => total + calculateWorkoutVolume(log.id), 0);
const workoutStreak = 3;

// Personal records from last workout
const lastWorkoutPRs = [
  { exercise: "Bench Press", type: "Weight PR", value: "90kg" },
  { exercise: "Total Volume", type: "Session PR", value: `${lastWorkoutVolume}kg` }
];

type TabType = 'dashboard' | 'exercises' | 'analytics';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [selectedMetric, setSelectedMetric] = useState<'estimated1RM' | 'maxWeight' | 'totalVolume'>('estimated1RM');
  const [selectedSplit, setSelectedSplit] = useState<string>('All');

  // Get available splits
  const availableSplits = ['All', ...Array.from(new Set(mockWorkoutLogs.map(log => log.split)))];

  // Generate analytics data based on selected split
  const generateAnalyticsData = (split: string) => {
    const filteredExercises = filterExercisesBySplit(split);
    const filteredLogs = filterDataBySplit(split);

    // Calculate muscle group volume
    const muscleGroupData = filteredExercises.reduce((acc, exercise) => {
      const volume = exercise.sets.reduce((sum, set) => sum + (set.weight_kg * set.reps), 0);
      const group = exercise.muscle_group || 'Other';
      acc[group] = (acc[group] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    const muscleGroupVolume = Object.entries(muscleGroupData).map(([name, value], index) => ({
      name,
      value,
      fill: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][index % 6]
    }));

    // Calculate force distribution
    const forceData = filteredExercises.reduce((acc, exercise) => {
      const force = exercise.force || 'Unknown';
      acc[force] = (acc[force] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const forceDistribution = Object.entries(forceData).map(([name, value], index) => ({
      name,
      value,
      fill: ['#3b82f6', '#10b981', '#f59e0b'][index % 3]
    }));

    // Calculate mechanic distribution
    const mechanicData = filteredExercises.reduce((acc, exercise) => {
      const mechanic = exercise.mechanic || 'Unknown';
      acc[mechanic] = (acc[mechanic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mechanicDistribution = Object.entries(mechanicData).map(([name, value], index) => ({
      name,
      value,
      fill: ['#8b5cf6', '#ec4899'][index % 2]
    }));

    // Performance over time for filtered split
    const performanceOverTime = filteredLogs
      .sort((a, b) => a.start_time - b.start_time)
      .map((log, index) => {
        const volume = calculateWorkoutVolume(log.id);
        const exercises = filteredExercises.filter(ex => ex.workout_log_id === log.id);
        const avgRPE = exercises.length > 0 
          ? exercises.reduce((sum, ex) => {
              const avgSetRPE = ex.sets.reduce((s, set) => s + set.rpe, 0) / ex.sets.length;
              return sum + avgSetRPE;
            }, 0) / exercises.length
          : 0;
        
        return {
          date: new Date(log.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalVolume: volume,
          avgRPE: Number(avgRPE.toFixed(1)),
          workoutDuration: Math.round(log.total_duration_seconds / 60),
          split: log.split
        };
      });

    return {
      muscleGroupVolume,
      forceDistribution,
      mechanicDistribution,
      performanceOverTime
    };
  };

  const analyticsData = generateAnalyticsData(selectedSplit);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'At a Glance', icon: User },
    { id: 'exercises' as TabType, label: 'Exercise Focus', icon: Dumbbell },
    { id: 'analytics' as TabType, label: 'Analytics & Trends', icon: BarChart3 },
  ];

  const TabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const DashboardView = () => (
    <>
      {/* Last Workout Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            Last Workout Summary
          </CardTitle>
          <CardDescription>Your most recent training session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Split</p>
              <p className="text-2xl font-bold text-blue-600">{lastWorkout.split}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date & Duration
              </p>
              <p className="text-lg font-semibold">{lastWorkoutDate.toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">{lastWorkoutDuration} minutes</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-green-600">{lastWorkoutVolume.toLocaleString()}kg</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Personal Records
              </p>
              <div className="space-y-1">
                {lastWorkoutPRs.map((pr, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-amber-600">{pr.value}</span>
                    <span className="text-gray-500 ml-1">({pr.exercise})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Week's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Weekly Frequency
            </CardTitle>
            <CardDescription>Workout frequency this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={thisWeekData}>
                  <XAxis dataKey="day" />
                  <YAxis hide />
                  <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>{thisWeekData.length} workouts this week</span>
              <span>Avg: {Math.round(thisWeekData.reduce((sum, d) => sum + d.volume, 0) / thisWeekData.length || 0)}kg volume</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Volume by Workout
            </CardTitle>
            <CardDescription>Training volume distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={thisWeekData}>
                  <XAxis dataKey="day" />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              {thisWeekData.slice(-3).map((workout, index) => (
                <div key={index} className="text-center">
                  <p className="font-medium text-gray-900">{workout.split}</p>
                  <p className="text-gray-500">{workout.volume}kg</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Total Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">{totalWorkouts}</p>
              <p className="text-sm text-gray-600">Completed sessions</p>
              <Progress value={75} className="mt-4" />
              <p className="text-xs text-gray-500 mt-2">75% towards monthly goal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-green-600" />
              All-Time Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">{(allTimeVolume / 1000).toFixed(1)}t</p>
              <p className="text-sm text-gray-600">Total weight moved</p>
              <div className="mt-4 text-xs text-gray-500">
                <p>Last 30 days: +{(lastWorkoutVolume / 1000).toFixed(1)}t</p>
                <p className="text-green-600">↗ +12% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Workout Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-600 mb-2">{workoutStreak}</p>
              <p className="text-sm text-gray-600">Consecutive weeks</p>
              <div className="mt-4 flex justify-center space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < workoutStreak ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Keep it up!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const ExerciseView = () => (
    <>
      {/* Exercise Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exercise Selection</CardTitle>
          <CardDescription>Choose an exercise to analyze its performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Bench Press', 'Deadlift', 'Squat', 'Overhead Press', 'Pull-ups'].map((exercise) => (
              <button
                key={exercise}
                onClick={() => setSelectedExercise(exercise)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedExercise === exercise
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {exercise}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {selectedExercise} Progress
          </CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2">
              {(['estimated1RM', 'maxWeight', 'totalVolume'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric === 'estimated1RM' ? 'Est. 1RM' : metric === 'maxWeight' ? 'Max Weight' : 'Total Volume'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={benchPressHistory}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Personal Records Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Personal Records
            </CardTitle>
            <CardDescription>Best lifts by rep range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benchPressPRs.map((pr, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{pr.repRange}</p>
                    <p className="text-sm text-gray-500">{pr.date}</p>
                  </div>
                  <p className="text-xl font-bold text-amber-600">{pr.weight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Last 5 sessions for {selectedExercise}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benchPressHistory.slice(0, 5).map((session, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{session.session}</p>
                      <p className="text-sm text-gray-500">{session.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Max: {session.maxWeight}kg</p>
                      <p className="text-sm text-gray-600">Volume: {session.totalVolume}kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const AnalyticsView = () => (
    <>
      {/* Split Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter by Workout Split
          </CardTitle>
          <CardDescription>
            Analyze trends for specific workout splits or view aggregate data
            {selectedSplit !== 'All' && (
              <span className="ml-2 text-blue-600 font-medium">
                • Currently viewing: {selectedSplit}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableSplits.map((split) => (
              <button
                key={split}
                onClick={() => setSelectedSplit(split)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSplit === split
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {split}
                {split !== 'All' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({filterDataBySplit(split).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Volume by Muscle Group</CardTitle>
            <CardDescription>
              {selectedSplit === 'All' 
                ? 'Training distribution across all muscle groups' 
                : `${selectedSplit} split muscle group focus`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.muscleGroupVolume}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {analyticsData.muscleGroupVolume.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}kg`, 'Volume']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Force Distribution</CardTitle>
            <CardDescription>
              {selectedSplit === 'All' 
                ? 'Push vs Pull vs Static movements' 
                : `Force patterns in ${selectedSplit} workouts`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.forceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {analyticsData.forceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Exercises']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercise Mechanics</CardTitle>
            <CardDescription>
              {selectedSplit === 'All' 
                ? 'Compound vs Isolation exercises' 
                : `Exercise types in ${selectedSplit} split`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.mechanicDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {analyticsData.mechanicDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Exercises']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Performance Metrics Over Time
          </CardTitle>
          <CardDescription>
            {selectedSplit === 'All' 
              ? 'Track volume, RPE, and workout duration trends across all splits' 
              : `Performance trends for ${selectedSplit} workouts only`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData.performanceOverTime}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Total Volume (kg)') return [`${value}kg`, name];
                    if (name === 'Duration (min)') return [`${value}min`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="totalVolume" fill="#3b82f6" name="Total Volume (kg)" />
                <Line yAxisId="right" type="monotone" dataKey="avgRPE" stroke="#ef4444" strokeWidth={3} name="Avg RPE" />
                <Line yAxisId="right" type="monotone" dataKey="workoutDuration" stroke="#10b981" strokeWidth={3} name="Duration (min)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {analyticsData.performanceOverTime.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Total Volume</p>
                <p className="text-blue-700">
                  {analyticsData.performanceOverTime.reduce((sum, d) => sum + d.totalVolume, 0).toLocaleString()}kg
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-900">Avg RPE</p>
                <p className="text-red-700">
                  {(analyticsData.performanceOverTime.reduce((sum, d) => sum + d.avgRPE, 0) / analyticsData.performanceOverTime.length).toFixed(1)}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Avg Duration</p>
                <p className="text-green-700">
                  {Math.round(analyticsData.performanceOverTime.reduce((sum, d) => sum + d.workoutDuration, 0) / analyticsData.performanceOverTime.length)}min
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Dashboard</h1>
          <p className="text-gray-600">Track your strength training progress and analyze performance</p>
        </div>

        {/* Navigation */}
        <TabNavigation />

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'exercises' && <ExerciseView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </div>
    </div>
  );
}
