// app/(app)/history/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Useful for long workout details
// import { getWorkoutHistoryList, getWorkoutDetails } from '@/lib/api';
import { format } from 'date-fns'; // For formatting dates

// Interfaces for history data
interface WorkoutSessionSummary {
  id: string; // Or number
  date: string; // Format: "YYYY-MM-DD"
  exercise_count: number;
  // maybe add focus or goal later
}

interface ExerciseLogDetail {
    exercise_name: string;
    weight: string | null;
    reps: string | null;
    duration: string | null;
    rpe: number | null;
}

interface WorkoutSessionDetail extends WorkoutSessionSummary {
    logs: ExerciseLogDetail[];
}


export default function HistoryPage() {
  const [history, setHistory] = useState<WorkoutSessionSummary[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSessionDetail | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch history list on load
  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      // try {
      //   const historyList = await getWorkoutHistoryList(); // Your API call
      //   setHistory(historyList);
      // } catch (error) {
      //   console.error("Failed to fetch workout history", error);
      //   // Add error handling UI
      // } finally {
      //   setIsHistoryLoading(false);
      // }

      // --- Mock Data ---
      console.log("Simulating fetch history list...");
       await new Promise(resolve => setTimeout(resolve, 500));
       setHistory([
         { id: "sess_1", date: "2024-03-10", exercise_count: 4 },
         { id: "sess_2", date: "2024-03-08", exercise_count: 5 },
         { id: "sess_3", date: "2024-03-06", exercise_count: 4 },
       ]);
       setIsHistoryLoading(false);
       // --- End Mock Data ---
    };
    fetchHistory();
  }, []);

  // Fetch details when a row is clicked (or dialog opened)
  const handleViewDetails = async (sessionId: string) => {
    setIsDetailsLoading(true);
    setSelectedWorkout(null); // Clear previous details
    setIsDialogOpen(true); // Open dialog immediately

    // try {
    //   const details = await getWorkoutDetails(sessionId); // Your API call
    //   setSelectedWorkout(details);
    // } catch (error) {
    //   console.error(`Failed to fetch details for session ${sessionId}`, error);
    //    // Show error inside the dialog or using a toast
    //   setSelectedWorkout({ id: sessionId, date: 'Error', exercise_count: 0, logs: [] }); // Show error state in dialog
    // } finally {
    //   setIsDetailsLoading(false);
    // }

    // --- Mock Data ---
    console.log(`Simulating fetch details for session ${sessionId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
     setSelectedWorkout({
        id: sessionId,
        date: history.find(h => h.id === sessionId)?.date || 'Unknown Date',
        exercise_count: 4, // Example
        logs: [
             { exercise_name: "Squats", weight: "50 kg", reps: "10, 10, 9", duration: null, rpe: 8 },
             { exercise_name: "Bench Press", weight: "40 kg", reps: "10, 9, 8", duration: null, rpe: 7 },
             { exercise_name: "Bent Over Rows", weight: "35 kg", reps: "12, 12, 11", duration: null, rpe: 7 },
             { exercise_name: "Plank", weight: null, reps: null, duration: "30s, 30s, 25s", rpe: 6 },
        ]
     });
    setIsDetailsLoading(false);
    // --- End Mock Data ---
  };


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Workout History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>Review your previously logged workouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div>Loading history...</div> // Add Spinner
          ) : history.length === 0 ? (
             <p>No workout history found. Go log your first session!</p>
          ) : (
             <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Exercises Logged</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {history.map((session) => (
                   <Dialog
                   key={session.id}
                   open={isDialogOpen && selectedWorkout?.id === session.id}
                   onOpenChange={(open) => {
                     if (!open) setIsDialogOpen(false);
                   }}
                 >
                   <TableRow>
                     <TableCell className="font-medium">
                       {format(new Date(session.date), "PPP")}
                     </TableCell>
                     <TableCell>{session.exercise_count}</TableCell>
                     <TableCell className="text-right">
                       <DialogTrigger asChild>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleViewDetails(session.id)}
                         >
                           View Details
                         </Button>
                       </DialogTrigger>
                     </TableCell>
                   </TableRow>
                 
                   <DialogContent className="sm:max-w-[625px]">
                     <DialogHeader>
                       <DialogTitle>Workout Details</DialogTitle>
                       {selectedWorkout && (
                         <DialogDescription>
                           Session from {format(new Date(selectedWorkout.date), "PPP")}
                         </DialogDescription>
                       )}
                     </DialogHeader>
                     <ScrollArea className="max-h-[60vh] pr-6">
                       {isDetailsLoading ? (
                         <div>Loading details...</div>
                       ) : selectedWorkout ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Exercise</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Reps</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>RPE</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedWorkout.logs.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{log.exercise_name}</TableCell>
                                    <TableCell>{log.weight || "-"}</TableCell>
                                    <TableCell>{log.reps || "-"}</TableCell>
                                    <TableCell>{log.duration || "-"}</TableCell>
                                    <TableCell>{log.rpe || "-"}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                    </Table>
                       ) : (
                         <div>Could not load workout details.</div>
                       )}
                     </ScrollArea>
                   </DialogContent>
                 </Dialog>
                ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
}