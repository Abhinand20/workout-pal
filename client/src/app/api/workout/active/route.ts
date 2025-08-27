import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { 
  CreateActiveWorkoutSessionData,
  GetActiveWorkoutSessionData,
  UpdateActiveWorkoutSessionData
} from '@/types/api';
import {
  createActiveWorkoutSession,
  getActiveWorkoutSession,
  updateActiveWorkoutSession,
  deleteActiveWorkoutSession
} from '@/lib/workout-queries';

// GET /api/workout/active - Get active workout session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active_workout_session_id = searchParams.get('active_workout_session_id');

    if (!active_workout_session_id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'active_workout_session_id is required',
          code: 'MISSING_SESSION_ID'
        }
      } as ApiResponse<GetActiveWorkoutSessionData>, { status: 400 });
    }

    console.log(`Fetching active workout session: ${active_workout_session_id}`);
    const activeWorkoutSession = await getActiveWorkoutSession(active_workout_session_id);

    if (!activeWorkoutSession) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No active workout session found.',
          code: 'NO_ACTIVE_WORKOUT_SESSION'
        }
      } as ApiResponse<GetActiveWorkoutSessionData>, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { activeWorkoutSession }
    } as ApiResponse<GetActiveWorkoutSessionData>);

  } catch (error) {
    console.error('Error in GET /api/workout/active:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to get active workout session: ${error instanceof Error ? error.message : String(error)}`,
        code: 'GET_ACTIVE_WORKOUT_SESSION_ERROR'
      }
    } as ApiResponse<GetActiveWorkoutSessionData>, { status: 500 });
  }
}

// POST /api/workout/active - Create active workout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activeWorkoutSession } = body;

    if (!userId || !activeWorkoutSession) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'userId and activeWorkoutSession are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      } as ApiResponse<CreateActiveWorkoutSessionData>, { status: 400 });
    }

    const sessionId = await createActiveWorkoutSession(userId, activeWorkoutSession);
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to create active workout session.',
          code: 'DB_SAVE_ERROR'
        }
      } as ApiResponse<CreateActiveWorkoutSessionData>, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { active_workout_session_id: sessionId }
    } as ApiResponse<CreateActiveWorkoutSessionData>);

  } catch (error) {
    console.error('Error in POST /api/workout/active:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to create active workout session: ${error instanceof Error ? error.message : String(error)}`,
        code: 'CREATE_ACTIVE_WORKOUT_SESSION_ERROR'
      }
    } as ApiResponse<CreateActiveWorkoutSessionData>, { status: 500 });
  }
}

// PUT /api/workout/active - Update active workout session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { active_workout_session_id, activeWorkoutSession } = body;

    if (!active_workout_session_id || !activeWorkoutSession) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'active_workout_session_id and activeWorkoutSession are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      } as ApiResponse<UpdateActiveWorkoutSessionData>, { status: 400 });
    }

    console.log(`Updating active workout session for session: ${active_workout_session_id}`);
    const sessionId = await updateActiveWorkoutSession(active_workout_session_id, activeWorkoutSession);
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Failed to update active workout session.',
          code: 'DB_SAVE_ERROR'
        }
      } as ApiResponse<UpdateActiveWorkoutSessionData>, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { activeWorkoutSessionId: sessionId }
    } as ApiResponse<UpdateActiveWorkoutSessionData>);

  } catch (error) {
    console.error('Error in PUT /api/workout/active:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to update active workout session: ${error instanceof Error ? error.message : String(error)}`,
        code: 'UPDATE_ACTIVE_WORKOUT_SESSION_ERROR'
      }
    } as ApiResponse<UpdateActiveWorkoutSessionData>, { status: 500 });
  }
}

// DELETE /api/workout/active - Delete active workout session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active_workout_session_id = searchParams.get('active_workout_session_id');

    if (!active_workout_session_id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'active_workout_session_id is required',
          code: 'MISSING_SESSION_ID'
        }
      } as ApiResponse<null>, { status: 400 });
    }

    await deleteActiveWorkoutSession(active_workout_session_id);

    return NextResponse.json({
      success: true,
      data: null
    } as ApiResponse<null>);

  } catch (error) {
    console.error('Error in DELETE /api/workout/active:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: `Failed to delete active workout session: ${error instanceof Error ? error.message : String(error)}`,
        code: 'DELETE_ACTIVE_WORKOUT_SESSION_ERROR'
      }
    } as ApiResponse<null>, { status: 500 });
  }
}