import { NextResponse } from 'next/server';
import { clearCachedWorkoutRoutines } from '@/lib/workout-queries';

// DELETE /api/workout/clear-cache - Clear cached workout routines (for development/debugging)
export async function DELETE() {
  try {
    await clearCachedWorkoutRoutines();
    
    return NextResponse.json({
      success: true,
      message: 'Cached workout routines cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cached workouts:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to clear cached workouts: ${error instanceof Error ? error.message : String(error)}`,
        code: 'CLEAR_CACHE_ERROR'
      }
    }, { status: 500 });
  }
}