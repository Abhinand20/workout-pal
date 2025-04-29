// app/(app)/dashboard/page.tsx
"use client"; // Needed for useEffect, useState

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
// import { getWorkoutRecommendation } from '@/lib/api'; // Your API call function
// import { Terminal } from "lucide-react"; // Example Icon

// Define an interface for the workout structure
interface ExerciseRecommendation {
    exercise: string;
    sets: string | number; // Can be number or string like "3-4"
    reps_duration: string; // e.g., "8-12 reps", "30s"
    target_weight?: string; // e.g., "50 kg", "Bodyweight"
}

interface WorkoutRecommendation {
    date: string; // Or Date object
    focus?: string;
    exercises: ExerciseRecommendation[];
}

export default function DashboardPage() {
  const [workout, setWorkout] = useState<WorkoutRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setIsLoading(true);
      setError(null);
      // try {
      //   const recommendation = await getWorkoutRecommendation(); // Your API call
      //   setWorkout(recommendation);
      // } catch (err) {
      //   console.error("Failed to fetch workout recommendation", err);
      //   setError("Could not load today's workout. Please try again later.");
      // } finally {
      //   setIsLoading(false);
      // }

      // --- Mock Data for Frontend Development ---
      console.log("Simulating fetch workout recommendation...");
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setWorkout({
         date: new Date().toLocaleDateString(),
         focus: "Full Body Strength",
         exercises: [
           { exercise: "Squats", sets: 3, reps_duration: "8-12 reps", target_weight: "50 kg" },
           { exercise: "Bench Press", sets: 3, reps_duration: "8-12 reps", target_weight: "40 kg" },
           { exercise: "Bent Over Rows", sets: 3, reps_duration: "10-15 reps", target_weight: "35 kg" },
           { exercise: "Plank", sets: 3, reps_duration: "30s hold" },
         ]
      });
      setIsLoading(false);
      // --- End Mock Data ---

    };

    fetchRecommendation();
  }, []);

  if (isLoading) {
    return <div>Loading today&apos;s workout...</div>; // Add Spinner
  }

  if (error) {
    return <Alert variant="destructive">
             {/* <Terminal className="h-4 w-4" /> */}
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>;
  }

  if (!workout || workout.exercises.length === 0) {
      return <Card>
          <CardHeader>
              <CardTitle>Today&apos;s Workout</CardTitle>
          </CardHeader>
          <CardContent>
              <p>No workout recommended for today. Maybe it&apos;s a rest day?</p>
              {/* Optionally link to settings or history */}
          </CardContent>
      </Card>
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Workout - {workout.date}</CardTitle>
          {workout.focus && <CardDescription>Focus: {workout.focus}</CardDescription>}
        </CardHeader>
        <CardContent>
           {/* Optional motivational message */}
           {/* <Alert className="mb-4">
             <AlertTitle>Focus for today!</AlertTitle>
             <AlertDescription>
                Let's hit those targets and focus on controlled movements. You got this!
             </AlertDescription>
           </Alert> */}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>Sets</TableHead>
                <TableHead>Reps/Duration</TableHead>
                <TableHead>Target Weight/Resistance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workout.exercises.map((ex, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{ex.exercise}</TableCell>
                  <TableCell>{ex.sets}</TableCell>
                  <TableCell>{ex.reps_duration}</TableCell>
                  <TableCell>{ex.target_weight || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
             <Button asChild>
                <Link href="/log-workout">Log Today&apos;s Workout</Link>
             </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}