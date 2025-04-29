// app/(app)/log-workout/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
// import { DatePicker } from "@/components/ui/date-picker"; // Assuming you create/use a DatePicker component
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Trash2, PlusCircle } from "lucide-react"; // Icons
import { format } from "date-fns";
// import { saveWorkoutLog } from '@/lib/api';
// import { useToast } from "@/components/ui/use-toast";

interface ExerciseLogEntry {
    id: number; // Temporary client-side ID
    exerciseName: string;
    weight: string; // Use string to allow "BW" or empty
    reps: string; // e.g., "10, 9, 8"
    duration: string; // e.g., "30s, 30s, 25s"
    rpe: number; // 1-10 scale
}

export default function LogWorkoutPage() {
    // const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
    const [nextId, setNextId] = useState(1); // Simple ID generation for keys
    const [isSaving, setIsSaving] = useState(false);

    // TODO: Pre-fill based on today's recommendation if navigating from dashboard
    useEffect(() => {
        // Example pre-fill (replace with actual logic)
        // const recommendedWorkout = getRecommendedWorkoutFromStateOrParams();
        // if (recommendedWorkout) {
        //     setExerciseLogs(recommendedWorkout.exercises.map((ex, index) => ({
        //         id: index + 1,
        //         exerciseName: ex.exercise,
        //         weight: ex.target_weight?.match(/\d+/)?.[0] ?? '', // Extract number or empty
        //         reps: ex.reps_duration.includes('reps') ? ex.reps_duration.split(' ')[0] : '', // Extract reps like "8-12"
        //         duration: ex.reps_duration.includes('s') ? ex.reps_duration.split(' ')[0] : '', // Extract duration like "30s"
        //         rpe: 7, // Default RPE
        //     })));
        //     setNextId(recommendedWorkout.exercises.length + 1);
        // } else {
            // Add one empty entry to start if not pre-filling
            addExercise();
        // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addExercise = () => {
        setExerciseLogs([
            ...exerciseLogs,
            { id: nextId, exerciseName: '', weight: '', reps: '', duration: '', rpe: 7 }
        ]);
        setNextId(nextId + 1);
    };

    const removeExercise = (id: number) => {
        setExerciseLogs(exerciseLogs.filter(log => log.id !== id));
    };

    const handleInputChange = (id: number, field: keyof ExerciseLogEntry, value: string | number) => {
        setExerciseLogs(exerciseLogs.map(log =>
            log.id === id ? { ...log, [field]: value } : log
        ));
    };

    const handleRpeChange = (id: number, value: number[]) => {
         handleInputChange(id, 'rpe', value[0]);
    };


    const handleSaveWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        console.log("Saving workout:", { date, logs: exerciseLogs });

        // Data validation (basic example)
        if (!date) {
            // toast({ variant: "destructive", title: "Error", description: "Please select a date." });
            console.error("Please select a date.")
            setIsSaving(false);
            return;
        }
        const validLogs = exerciseLogs.filter(log => log.exerciseName.trim() !== '');
        if (validLogs.length === 0) {
             // toast({ variant: "destructive", title: "Error", description: "Please log at least one exercise." });
             console.error("Please log at least one exercise.")
             setIsSaving(false);
             return;
        }

        // try {
        //   const payload = {
        //       date: format(date, "yyyy-MM-dd"), // Format date for backend
        //       exercises: validLogs.map(({ id, ...rest }) => rest) // Remove client-side ID
        //   };
        //   await saveWorkoutLog(payload); // Your API call
        //   toast({ title: "Success", description: "Workout logged successfully!" });
        //   // Optionally redirect to history or dashboard
        //   // router.push('/history');
        //   // Reset form state if needed
        //   setDate(new Date());
        //   setExerciseLogs([]);
        //   addExercise(); // Add one blank entry back
        // } catch (error) {
        //   console.error("Failed to save workout", error);
        //   toast({ variant: "destructive", title: "Error", description: "Could not save workout log." });
        // } finally {
           setIsSaving(false);
        // }
        console.log("Simulating save...");
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
         // toast({ title: "Success", description: "Workout logged successfully! (Simulated)" });
         console.log("Workout logged successfully! (Simulated)");
    };

    return (
        <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Log Workout Session</h1>
         <form onSubmit={handleSaveWorkout}>
            <Card>
            <CardHeader>
                <CardTitle>Workout Details</CardTitle>
                 <div className="flex items-center space-x-4 pt-2">
                    <Label>Date:</Label>
                     {/* Shadcn Calendar in Popover */}
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={`w-[280px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                        >
                            {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full rounded-md border"
                        />
                        </PopoverContent>
                    </Popover>
                 </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {exerciseLogs.map((log, index) => (
                <Card key={log.id} className="p-4 relative"> {/* Exercise Card */}
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeExercise(log.id)}
                        aria-label="Remove exercise"
                        >
                        {/* <Trash2 className="h-4 w-4" /> */} X
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                         {/* Exercise Name */}
                        <div className="space-y-1 md:col-span-2">
                            <Label htmlFor={`exerciseName-${log.id}`}>Exercise Name</Label>
                            <Input
                                id={`exerciseName-${log.id}`}
                                value={log.exerciseName}
                                onChange={(e) => handleInputChange(log.id, 'exerciseName', e.target.value)}
                                placeholder="e.g., Bench Press"
                                required
                            />
                            {/* Consider Combobox here later for searching known exercises */}
                        </div>
                        {/* Weight */}
                        <div className="space-y-1">
                            <Label htmlFor={`weight-${log.id}`}>Weight (kg/lbs)</Label>
                            <Input
                                id={`weight-${log.id}`}
                                value={log.weight}
                                onChange={(e) => handleInputChange(log.id, 'weight', e.target.value)}
                                placeholder="e.g., 50 or BW"
                            />
                        </div>
                         {/* Reps */}
                        <div className="space-y-1">
                            <Label htmlFor={`reps-${log.id}`}>Reps per Set</Label>
                            <Input
                                id={`reps-${log.id}`}
                                value={log.reps}
                                onChange={(e) => handleInputChange(log.id, 'reps', e.target.value)}
                                placeholder="e.g., 10, 9, 8"
                            />
                        </div>
                        {/* Duration */}
                         <div className="space-y-1">
                            <Label htmlFor={`duration-${log.id}`}>Duration per Set</Label>
                            <Input
                                id={`duration-${log.id}`}
                                value={log.duration}
                                onChange={(e) => handleInputChange(log.id, 'duration', e.target.value)}
                                placeholder="e.g., 30s, 30s, 25s"
                            />
                        </div>
                    </div>
                     {/* RPE */}
                     <div className="mt-4 space-y-2">
                        <Label htmlFor={`rpe-${log.id}`}>Rate of Perceived Exertion (RPE: {log.rpe})</Label>
                         <Slider
                            id={`rpe-${log.id}`}
                            min={1}
                            max={10}
                            step={1}
                            value={[log.rpe]}
                            onValueChange={(value) => handleRpeChange(log.id, value)}
                         />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Easy</span>
                            <span>Max Effort</span>
                         </div>
                     </div>
                </Card>
                ))}

                 {/* Add Exercise Button */}
                 <Button type="button" variant="outline" onClick={addExercise} className="mt-4">
                    {/* <PlusCircle className="mr-2 h-4 w-4" /> */} Add Exercise
                </Button>

            </CardContent>
            </Card>

            {/* Save Button */}
             <div className="mt-6 flex justify-end">
                 <Button type="submit" disabled={isSaving}>
                     {isSaving ? "Saving..." : "Save Workout"}
                 </Button>
             </div>
         </form>
        </div>
    );
}