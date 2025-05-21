from enum import Enum
from sqlalchemy import Column, String, Integer, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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
    start_time = Column(Integer) # Unix timestamp (milliseconds)
    end_time = Column(Integer, nullable=True) # Unix timestamp (milliseconds)
    total_duration_seconds = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    # Could add more fields like workout_name, workout_focus, etc.

class LoggedExercise(Base):
    __tablename__ = "logged_exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workout_log_id = Column(String, index=True) # Foreign key to WorkoutLog.id
    exercise_id = Column(String) # Reference to the original Exercise.id from 'exercises' table
    name = Column(String) # Name of the exercise at the time of logging
    # Actual performance data
    sets = Column(JSON) # Store the list of LoggedSet Pydantic models as JSON
    # Example structure for 'sets' column (JSON):
    # [
    #   {"set_number": 1, "weight_kg": 50, "reps": 10, "rpe": 8, "elapsedTime_ms": 30000, "status": "completed"},
    #   {"set_number": 2, "weight_kg": 50, "reps": 9, "rpe": 8.5, "elapsedTime_ms": 28000, "status": "completed"}
    # ]
    start_time = Column(Integer, nullable=True) # Unix timestamp for this specific exercise
    elapsed_time_ms = Column(Integer)
    status = Column(String) # e.g., 'completed', 'skipped'
    active_work_time_ms = Column(Integer, nullable=True)

