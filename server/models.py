from pydantic import BaseModel, Field
from typing import List, Optional, Union, TypeVar, Generic, Any
from enum import Enum

# --- Enums ---
class WorkoutSplit(str, Enum):
    FULL_BODY = "FULL_BODY"
    PUSH = "PUSH"
    PULL = "PULL"
    LEGS = "LEGS"
    ABS = "ABS"

class LogSetStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class LogExerciseStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

# --- Domain Models (mirroring client/src/types/index.ts) ---
class Exercise(BaseModel):
    id: str
    name: str
    target_sets: int
    target_reps: str  # e.g., "8-10" or "15"
    target_weight_kg: Optional[float] = None
    rest_period_seconds: Optional[int] = None
    tip: Optional[str] = None
    # Add other relevant fields from your TS Exercise if they are sent/received
    # For example, if your TS Exercise has description, tips, imageUrl, add them here.

class WorkoutRoutine(BaseModel):
    date: str  # e.g., "YYYY-MM-DD"
    ai_insight: Optional[str] = None
    routine: List[Exercise]

class LoggedSet(BaseModel):
    set_number: int
    weight_kg: Union[float, str] # Allow string for inputs like "bodyweight" or empty
    reps: Union[int, str]        # Allow string for inputs like "failure" or empty
    rpe: Optional[Union[int, str]] = None
    startTime: Optional[int] = None # JS timestamp (milliseconds)
    elapsedTime_ms: int
    status: LogSetStatus
    endTime: Optional[int] = None # JS timestamp (milliseconds)

class LoggedExercise(BaseModel):
    exercise_id: str # Links to Exercise.id in the WorkoutRoutine
    name: str        # For convenience, mirrors Exercise.name
    sets: List[LoggedSet]
    startTime: Optional[int] = None # JS timestamp (milliseconds)
    elapsedTime_ms: int
    status: LogExerciseStatus
    activeWorkTime_ms: Optional[int] = None


# --- Generic API Response Wrapper ---
T = TypeVar('T')

class ApiErrorDetail(BaseModel):
    code: Optional[str] = None
    message: str
    details: Optional[Any] = None

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ApiErrorDetail] = None


# --- API Specific Request/Response Data Payloads (mirroring client/src/types/api.ts) ---

# 1. Fetch Today's Workout
class FetchWorkoutData(BaseModel):
    workout: WorkoutRoutine

# 2. Edit a Specific Exercise
class EditExerciseRequest(BaseModel):
    workoutId: str
    exerciseIdToReplace: str
    userPrompt: str

class EditExerciseData(BaseModel):
    newExercise: Exercise

# 3. Log Workout Data
class LogWorkoutRequest(BaseModel):
    workoutRoutineId: str
    loggedExercises: List[LoggedExercise]
    startTime: Optional[int] = None
    endTime: Optional[int] = None
    totalDurationSeconds: Optional[int] = None
    notes: Optional[str] = None

class LogWorkoutData(BaseModel):
    loggedWorkoutId: str
    message: str
