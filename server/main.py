from fastapi import FastAPI, HTTPException, Query, Depends
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
    LogWorkoutData
)
from data.database import init_db, get_db
from data.schema import Exercise, Force, Category
from data.queries import get_stretching_exercises, get_push_exercises, get_pull_exercises, get_abs_exercises, get_full_body_exercises
from sqlalchemy.orm import Session
from llm.service import LLMService

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

@app.get("/api/workout/today", response_model=ApiResponse[FetchWorkoutData])
async def fetch_today_workout(split: Optional[WorkoutSplit] = Query(None), db: Session = Depends(get_db)):
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
        return ApiResponse[FetchWorkoutData](
            success=True,
            data=FetchWorkoutData(workout=generated_workout)
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
async def log_workout_data(request: LogWorkoutRequest):
    """
    Receives logged workout data from the client and persists it.
    """

    try:
        # Placeholder implementation:
        print(f"Received workout log for routine: {request.workoutRoutineId}")
        print(f"Number of exercises logged: {len(request.loggedExercises)}")
        if request.loggedExercises:
            print(f"First logged exercise: {request.loggedExercises[0].name}, Sets: {len(request.loggedExercises[0].sets)}")
        
        # Simulate saving to DB and getting an ID
        persisted_log_id = f"log_{request.workoutRoutineId}_{request.startTime or 'manual'}"

        return ApiResponse[LogWorkoutData](
            success=True,
            data=LogWorkoutData(
                loggedWorkoutId=persisted_log_id,
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