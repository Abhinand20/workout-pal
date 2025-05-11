from fastapi import FastAPI, HTTPException, Query
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

@app.get("/api/workout/today", response_model=ApiResponse[FetchWorkoutData])
async def fetch_today_workout(split: Optional[WorkoutSplit] = Query(None)):
    """
    Fetches today's workout routine.
    Optionally allows filtering by workout split.

    Use await to make the API and db read calls.
    user_prefs = await db.get_user_preferences(user_id)
    generated_workout = await llm_service.generate_workout(prompt=user_prefs.prompt, split=split)
    """
    # TODO: Implement logic to generate or retrieve today's workout
    # This might involve:
    # 1. Checking if a workout for today already exists for the user.
    # 2. If not, generating a new one based on user preferences, history, and the 'split' parameter.
    # 3. Interacting with an LLM or a predefined workout generation logic.
    # 4. Storing the generated workout (if applicable).
    # 5. Formatting the workout into the WorkoutRoutine Pydantic model.

    try:
        # Placeholder implementation:
        if split == WorkoutSplit.FULL_BODY:
            # Example: Create a sample full body workout
            sample_exercises = [
                Exercise(id="ex1", name="Squats", target_sets=3, target_reps="8-12", target_weight_kg=60),
                Exercise(id="ex2", name="Bench Press", target_sets=3, target_reps="8-12", target_weight_kg=50),
                Exercise(id="ex3", name="Rows", target_sets=3, target_reps="10-15", target_weight_kg=40),
            ]
            sample_workout_routine = WorkoutRoutine(
                date="2024-07-30", # Should be dynamic (today's date)
                ai_insight="A great full body workout to start your week!",
                routine=sample_exercises
            )
            return ApiResponse[FetchWorkoutData](
                success=True,
                data=FetchWorkoutData(workout=sample_workout_routine)
            )
        else:
            # Example: Generic workout or error if split is required/unsupported
            sample_exercises = [Exercise(id="ex_generic", name="General Exercise", target_sets=3, target_reps="10")]
            sample_workout_routine = WorkoutRoutine(date="2024-07-30", routine=sample_exercises)
            return ApiResponse[FetchWorkoutData](
                success=True,
                data=FetchWorkoutData(workout=sample_workout_routine)
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