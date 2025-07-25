from enum import Enum
import uuid
from sqlalchemy import BigInteger, Column, String, Text, create_engine, Date, Boolean
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import ForeignKey

Base = declarative_base()


# Define enums for relevant fields in the exercise table
class Force(Enum):
    PUSH = "push"
    PULL = "pull"
    STATIC = "static"
    UNK = "None"

class Level(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"

class Category(Enum):
    STRENGTH = "strength"
    STRETCHING = "stretching"
    POLYMETRICS = "polymetrics"
    POWERLIFTING = "powerlifting"
    CARDIO = "cardio"
    
class Mechanic(Enum):
    COMPOUND = "compound"
    ISOLATION = "isolation"
    UNK = "None"

class PrimaryMuscle(Enum):
    QUADRICEPS = "quadriceps"
    SHOULDERS = "shoulders"
    ABDOMINALS = "abdominals"
    CHEST = "chest"
    HAMSTRINGS = "hamstrings"
    TRICEPS = "triceps"
    BICEPS = "biceps"
    LATS = "lats"
    MIDDLE_BACK = "middle back"
    CALVES = "calves"
    LOWER_BACK = "lower back"
    FOREARMS = "forearms"
    GLUTES = "glutes"
    TRAPS = "traps"
    ADDUCTORS = "adductors"
    NECK = "neck"
    ABDUCTORS = "abductors"
    

class UserWorkoutRoutine(Base):
    __tablename__ = "user_workout_routines"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4())) 
    user_id = Column(String, index=True,) 
    split = Column(String) 
    generated_date = Column(Date) 
    routine_json = Column(JSON) 

# For each user, we store the active workout session
# which will be updated by the client as the workout progresses
class ActiveWorkoutSessions(Base):
    __tablename__ = "active_workout_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True)
    active_workout_session_json = Column(JSON)


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String, primary_key=True)
    name = Column(String)
    force = Column(String)
    level = Column(String)
    mechanic = Column(String, nullable=True)
    equipment = Column(String)
    primary_muscles = Column(JSON)  # stores as array
    secondary_muscles = Column(JSON)
    instructions = Column(JSON)
    category = Column(String)
    images = Column(JSON)

    def __str__(self):
        return f"{self.name} {self.primary_muscles} {self.secondary_muscles} {self.equipment} {self.force} {self.mechanic} {self.level} {self.category}"
    

# --- Workout Log Schema ---
class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(String, primary_key=True) # e.g., log_WORKOUT_ROUTINE_ID_TIMESTAMP
    workout_routine_id = Column(String) # Reference to the original WorkoutRoutine.id if applicable
    user_id = Column(String, index=True) # To associate logs with a user
    split = Column(String) # The split of the workout
    start_time = Column(BigInteger) # Unix timestamp (milliseconds)
    end_time = Column(BigInteger, nullable=True) # Unix timestamp (milliseconds)
    total_duration_seconds = Column(BigInteger, nullable=True)
    notes = Column(Text, nullable=True)

class LoggedExercise(Base):
    __tablename__ = "logged_exercises"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workout_log_id = Column(String, ForeignKey("workout_logs.id")) # Foreign key to WorkoutLog.id
    exercise_id = Column(String, ForeignKey("exercises.id")) # Reference to the original Exercise.id from 'exercises' table
    name = Column(String) # Name of the exercise at the time of logging
    # Actual performance data
    sets = Column(JSON) # Store the list of LoggedSet Pydantic models as JSON
    # Example structure for 'sets' column (JSON):
    # [
    #   {"set_number": 1, "weight_kg": 50, "reps": 10, "rpe": 8, "elapsedTime_ms": 30000, "status": "completed"},
    #   {"set_number": 2, "weight_kg": 50, "reps": 9, "rpe": 8.5, "elapsedTime_ms": 28000, "status": "completed"}
    # ]
    start_time = Column(BigInteger, nullable=True) # Unix timestamp for this specific exercise
    elapsed_time_ms = Column(BigInteger)
    status = Column(String) # e.g., 'completed', 'skipped'
    active_work_time_ms = Column(BigInteger, nullable=True)

