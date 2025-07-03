"""
TODOs: 
1. Add authentication to the APIs. 
2. The FE should pass in the auth token in the request headers. APIs should validate the auth token and extract the user_id from the token.
"""

from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Union, TypeVar, Generic, Any
from enum import Enum
from models import (
    WorkoutSplit,
    Exercise,
    WorkoutRoutine,
    ApiErrorDetail,
    ApiResponse,
    FetchWorkoutData,
    EditExerciseRequest,
    EditExerciseData,
    LogWorkoutRequest,
    LogWorkoutData,
    CreateActiveWorkoutSessionRequest,
    CreateActiveWorkoutSessionData,
    GetActiveWorkoutSessionRequest,
    GetActiveWorkoutSessionData,
    UpdateActiveWorkoutSessionRequest,
    UpdateActiveWorkoutSessionData,
    DeleteActiveWorkoutSessionRequest,
)
from data.database import init_db, get_db
from data.schema import Exercise, Force, Category
from data.queries import (
    get_stretching_exercises, 
    get_push_exercises, 
    get_pull_exercises, 
    get_abs_exercises, 
    get_full_body_exercises,
    fetch_active_workout_session,
    modify_active_workout_session,
    remove_active_workout_session,
    save_user_workout_routine,
    get_cached_user_workout_routine,
    add_active_workout_session,
)
from sqlalchemy.orm import Session
from llm.service import LLMService
from data.queries import create_workout_log

app = FastAPI(title="Workout Pal API")

origins = [
    "http://localhost:3000",
    # You can add other origins here, e.g., your deployed frontend URL
    # "https://your-deployed-frontend.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the database
init_db()
# Initialize the LLM service


@app.get("/api/workout/active", response_model=ApiResponse[GetActiveWorkoutSessionData])
async def get_active_workout_session(request: GetActiveWorkoutSessionRequest, db: Session = Depends(get_db)):
    """
    Gets the active workout session for a user.
    """
    try:
        print(f"Fetching active workout session: {request.active_workout_session_id}")
        active_workout_session = fetch_active_workout_session(db, request.active_workout_session_id)

        if not active_workout_session:
            return ApiResponse[GetActiveWorkoutSessionData](
                success=False,
                error=ApiErrorDetail(message="No active workout session found.", code="NO_ACTIVE_WORKOUT_SESSION")
            )

        return ApiResponse[GetActiveWorkoutSessionData](
            success=True,
            data=GetActiveWorkoutSessionData(activeWorkoutSession=active_workout_session)
        )
    except Exception as e:
        return ApiResponse[GetActiveWorkoutSessionData](
            success=False,  
            error=ApiErrorDetail(message=f"Failed to get active workout session: {str(e)}", code="GET_ACTIVE_WORKOUT_SESSION_ERROR")
        )

@app.post("/api/workout/active", response_model=ApiResponse[CreateActiveWorkoutSessionData])
async def create_active_workout_session(request: CreateActiveWorkoutSessionRequest, db: Session = Depends(get_db)):
    """
    Creates a new active workout session for a user and returns the session id.
    """
    try:
        active_workout_session_id = add_active_workout_session(db, request.userId, request.activeWorkoutSession)
        if not active_workout_session_id:
            return ApiResponse[CreateActiveWorkoutSessionData](
                success=False,
                error=ApiErrorDetail(message="Failed to create active workout session.", code="DB_SAVE_ERROR")
            )
        return ApiResponse[CreateActiveWorkoutSessionData](
            success=True,
            data=CreateActiveWorkoutSessionData(active_workout_session_id=active_workout_session_id)
        )
    except Exception as e:
        return ApiResponse[CreateActiveWorkoutSessionData](
            success=False,
            error=ApiErrorDetail(message=f"Failed to create active workout session: {str(e)}", code="CREATE_ACTIVE_WORKOUT_SESSION_ERROR")
        )

@app.put("/api/workout/active", response_model=ApiResponse[UpdateActiveWorkoutSessionData])
async def update_active_workout_session(request: UpdateActiveWorkoutSessionRequest, db: Session = Depends(get_db)):
    """
    Updates the workout session for a user. If the user is not currently in a workout session, this will create a new one.
    """
    try:
        print(f"Updating active workout session for user: {request.user_id}")
        active_workout_session_id = modify_active_workout_session(db, request.active_workout_session_id, request.activeWorkoutSession)
        if not active_workout_session_id:
            return ApiResponse[UpdateActiveWorkoutSessionData](
                success=False,
                error=ApiErrorDetail(message="Failed to update active workout session.", code="DB_SAVE_ERROR")
            )
        
        return ApiResponse[UpdateActiveWorkoutSessionData](
            success=True,
            data=UpdateActiveWorkoutSessionData(active_workout_session_id=active_workout_session_id)
        )
    except Exception as e:
        return ApiResponse[UpdateActiveWorkoutSessionData](
            success=False,
            error=ApiErrorDetail(message=f"Failed to update active workout session: {str(e)}", code="UPDATE_ACTIVE_WORKOUT_SESSION_ERROR")
        )

@app.delete("/api/workout/active", response_model=ApiResponse[None])
async def delete_active_workout_session(request: DeleteActiveWorkoutSessionRequest, db: Session = Depends(get_db)):
    """
    Deletes the active workout session for a user.
    """
    try:
        remove_active_workout_session(db, request.active_workout_session_id, request.user_id)
        return ApiResponse[None](
            success=True,
            data=None
        )
    except Exception as e:
        return ApiResponse[None](
            success=False,
            error=ApiErrorDetail(message=f"Failed to delete active workout session: {str(e)}", code="DELETE_ACTIVE_WORKOUT_SESSION_ERROR")
        )

# TODO: Extend this to enable re-generation based on request params or add re-generation endpoint.
@app.get("/api/workout/today", response_model=ApiResponse[FetchWorkoutData])
async def fetch_today_workout(split: Optional[WorkoutSplit] = Query(None), user_id: str = Query(...), db: Session = Depends(get_db)):
    """
    Fetches today's workout routine.
    Optionally allows filtering by workout split.

    Use await to make the API and db read calls.
    user_prefs = await db.get_user_preferences(user_id)
    generated_workout = await llm_service.generate_workout(prompt=user_prefs.prompt, split=split)
    """
    # 1. Query stretching exercises
    # 2. Query exercises for the workout split
    # 3. (to be implemented) Query user's workout history
    # 4. (to be implemented) Query user's preferences
    # 5. Prompt LLM to generate the workout
    # 6. Return the workout
    try:
        cached_workout_routine = get_cached_user_workout_routine(db, user_id, split)
        if cached_workout_routine:
            print(f"Found cached workout routine for split: {split}, returning it.")
            return ApiResponse[FetchWorkoutData](
                success=True,
                data=FetchWorkoutData(workout=cached_workout_routine)
            )
        stretching_exercises = get_stretching_exercises(db)
        primary_exercises = []
        if split == WorkoutSplit.PUSH or (split is None):
            primary_exercises = get_push_exercises(db)
        elif split == WorkoutSplit.PULL:
            primary_exercises = get_pull_exercises(db)
        elif split == WorkoutSplit.ABS:
            primary_exercises = get_abs_exercises(db)
        elif split == WorkoutSplit.FULL_BODY:
            primary_exercises = get_full_body_exercises(db)
        else:
            return ApiResponse[FetchWorkoutData](
                success=False,
                error=ApiErrorDetail(message="Not implemented", code="NOT_IMPLEMENTED")
            )
            
        # (TODO) Query workout history for the user
            # 3. Generate the workout using the LLM service
        # For now, use a default prompt since user preferences aren't implemented yet
        curr_split = split.value if split else "PUSH"
        default_prompt = f"Create a workout routine for the {curr_split} split for a 26 year old male who is 180 lbs and 5'10 looking to gain muscle mass and strength."
        llm_service = LLMService()
        generated_workout = await llm_service.generate_workout(
            prompt=default_prompt, 
            split=split,
            stretching_exercises=stretching_exercises,
            primary_exercises=primary_exercises
        )
        response_data = FetchWorkoutData(workout=generated_workout)
        response_data.workout.id = str(split) + "_" + str(datetime.now().strftime("%Y%m%d%H%M%S"))
        # Store the workout routine in the database
        print(f"Saving workout routine to database for user: {user_id}, split: {split}") 
        save_user_workout_routine(db, user_id, split, response_data.workout)
        return ApiResponse[FetchWorkoutData](
            success=True,
            data=response_data
        )
    except Exception as e:
        # In a real app, log the exception 'e'
        return ApiResponse[FetchWorkoutData](
            success=False,
            error=ApiErrorDetail(message=f"Failed to fetch workout: {str(e)}", code="FETCH_WORKOUT_ERROR")
        )


@app.post("/api/workout/edit-exercise", response_model=ApiResponse[EditExerciseData])
async def edit_specific_exercise(request: EditExerciseRequest):
    """
    Edits a specific exercise in a workout routine based on a user prompt.
    """

    try:
        # Placeholder implementation:
        print(f"Received request to edit exercise: {request.exerciseIdToReplace} in workout {request.workoutId}")
        print(f"User prompt: {request.userPrompt}")

        # Simulate LLM generating a new exercise
        new_exercise = Exercise(
            id="ex_new_" + request.exerciseIdToReplace, # Generate a new ID
            name=f"Modified '{request.exerciseIdToReplace}' based on '{request.userPrompt[:20]}...'",
            target_sets=3,
            target_reps="10-12",
            target_weight_kg=None, # LLM might suggest this
            rest_period_seconds=60
        )
        return ApiResponse[EditExerciseData](
            success=True,
            data=EditExerciseData(newExercise=new_exercise)
        )

    except Exception as e:
        # Log exception 'e'
        return ApiResponse[EditExerciseData](
            success=False,
            error=ApiErrorDetail(message=f"Failed to edit exercise: {str(e)}", code="EDIT_EXERCISE_ERROR")
        )


@app.post("/api/workout/log", response_model=ApiResponse[LogWorkoutData])
async def log_workout_data(request: LogWorkoutRequest, db: Session = Depends(get_db)):
    """
    Receives logged workout data from the client and persists it.
    """
    try:
        # For now, use a hardcoded user_id.
        # In a real application, this would come from an authentication system.
        user_id = "default_user"
        print(f"Received request to log workout: {request}")
        persisted_log = create_workout_log(db, user_id, request)

        if not persisted_log:
            return ApiResponse[LogWorkoutData](
                success=False,
                error=ApiErrorDetail(message="Failed to save workout log to database.", code="DB_SAVE_ERROR")
            )

        return ApiResponse[LogWorkoutData](
            success=True,
            data=LogWorkoutData(
                loggedWorkoutId=persisted_log.id,
                message="Workout logged successfully."
            )
        )
    except Exception as e:
        # Log exception 'e'
        return ApiResponse[LogWorkoutData](
            success=False,
            error=ApiErrorDetail(message=f"Failed to log workout: {str(e)}", code="LOG_WORKOUT_ERROR")
        )

# Run from terminal: uvicorn main:app --reload