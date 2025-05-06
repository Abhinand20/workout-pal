import { TodayWorkout } from '@/components/today-workout';
import { WorkoutRoutine } from '@/types';

// Function to fetch data (can be moved to lib/api.ts later)
async function getTodayWorkout(): Promise<{ data: WorkoutRoutine | null; error: string | null }> {
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // if (!apiUrl) {
  //   console.error("API URL is not defined in environment variables.");
  //   return { data: null, error: "API configuration error." };
  // }

  // try {
  //   // Add { cache: 'no-store' } if you ALWAYS want fresh data on page load,
  //   // otherwise Next.js might cache the result. For a 'daily' workout,
  //   // default caching might be okay, or use revalidate tags later.
  //   const response = await fetch(`${apiUrl}/api/v1/workout/today`, { cache: 'no-store' });

  //   if (!response.ok) {
  //       // Try to get error message from backend if available
  //       let errorBody = 'Failed to fetch workout data.';
  //       try {
  //           const errorJson = await response.json();
  //           errorBody = errorJson.detail || errorBody; // Assuming FastAPI error format
  //       } catch (e) { /* Ignore parsing error */ }
  //       throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
  //   }

  //   const data: WorkoutRoutine = await response.json();
  //   return { data, error: null };

  // } catch (error) {
  //   console.error("Error fetching workout:", error);
  //   return { data: null, error: error instanceof Error ? error.message : "An unknown error occurred." };
  // }
   // --- MOCK DATA FOR LOCAL DEVELOPMENT ---
  // Replace the real API call with a dummy response
  console.log("Using mock workout data for local development.");

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockWorkout: WorkoutRoutine = {
    date: "20th Aug 1998", // Example date
    ai_insight: "Great mix of strength and cardio!",
    routine: [
      { id: "id1", name: "Push-ups", target_sets: 3, target_reps: "8-10"},
      { id: "id2", name: "Squats", target_sets: 3, target_reps: "8-10"},
    ],
  };

  return { data: mockWorkout, error: null };

  // --- END MOCK DATA ---
}

export default async function HomePage() {
  // Fetch data directly in the Server Component
  const { data: workoutData, error } = await getTodayWorkout();

  // Note: isLoading is implicitly handled by the Server Component's async nature.
  // The page won't render until the fetch is complete (or errors out).
  // We pass isLoading=false because by the time TodayWorkout renders, loading is done.
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Pass fetched data and error status to the client component */}
      <TodayWorkout workoutData={workoutData} isLoading={false} error={error} />
    </main>
  );
}