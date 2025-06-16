from datetime import datetime, timedelta
import json
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.exc import SQLAlchemyError
from data.schema import Exercise, PrimaryMuscle, Level, Category, Force, Mechanic, WorkoutLog, LoggedExercise as LoggedExerciseDB, ActiveWorkoutSessions, UserWorkoutRoutine    
from models import LogWorkoutRequest, WorkoutRoutine, WorkoutSplit, ActiveWorkoutSession
from typing import Optional, List

class ExerciseFilter:
    def __init__(self,
                 primary_muscle: PrimaryMuscle = None, 
                 level: Level = None,
                 category: Category = None,
                 force: Force = None,
                 mechanic: Mechanic = None):
        self.primary_muscle = primary_muscle
        self.level = level
        self.category = category
        self.force = force
        self.mechanic = mechanic
        
    def __str__(self):
        return f"ExerciseFilter(primary_muscle={self.primary_muscle.value}, level={self.level.value}, category={self.category.value}, force={self.force.value}, mechanic={self.mechanic.value})"

def search_exercises(filter: ExerciseFilter, session: Session) -> list[Exercise]:
    query = session.query(Exercise)

    if filter.primary_muscle:
        query = query.filter(Exercise.primary_muscles.contains([filter.primary_muscle.value]))
    if filter.level:
        query = query.filter(Exercise.level == filter.level.value)
    if filter.category:
        query = query.filter(Exercise.category == filter.category.value)
    if filter.force:
        query = query.filter(Exercise.force == filter.force.value)
    if filter.mechanic:
        query = query.filter(Exercise.mechanic == filter.mechanic.value)
    
    results = query.all()
    return results

def get_stretching_exercises(db: Session):
    stretching_filter = ExerciseFilter(category=Category.STRETCHING)
    stretching_exercises = search_exercises(stretching_filter, db)
    return stretching_exercises

def get_push_exercises(db: Session):
    push_filter = ExerciseFilter(force=Force.PUSH)
    push_exercises = search_exercises(push_filter, db)
    return push_exercises

def get_pull_exercises(db: Session):
    pull_filter = ExerciseFilter(force=Force.PULL)
    pull_exercises = search_exercises(pull_filter, db)
    return pull_exercises

def get_abs_exercises(db: Session):
    abs_filter = ExerciseFilter(primary_muscle=PrimaryMuscle.ABDOMINALS)
    abs_exercises = search_exercises(abs_filter, db)
    return abs_exercises

def get_full_body_exercises(db: Session):
    full_body_filter = ExerciseFilter(mechanic=Mechanic.COMPOUND)
    full_body_exercises = search_exercises(full_body_filter, db)
    return full_body_exercises

def create_workout_log(db: Session, user_id: str, log_data: LogWorkoutRequest) -> Optional[WorkoutLog]:
    """
    Creates a new workout log entry in the database along with its associated logged exercises.
    """
    try:
        # Create the main workout log entry
        new_log_id = f"log_{log_data.workoutRoutineId}_{log_data.startTime or 'manual'}"
        db_workout_log = WorkoutLog(
            id=new_log_id,
            workout_routine_id=log_data.workoutRoutineId,
            user_id=user_id,
            start_time=log_data.startTime,
            end_time=log_data.endTime,
            total_duration_seconds=log_data.totalDurationSeconds,
            split=log_data.split,
            notes=log_data.notes
        )
        db.add(db_workout_log)

        # Create entries for each logged exercise
        for exercise_log_data in log_data.loggedExercises:
            # Convert Pydantic LoggedSet models to dictionaries for JSON storage
            sets_data = [s.model_dump() for s in exercise_log_data.sets]

            db_logged_exercise = LoggedExerciseDB(
                workout_log_id=new_log_id,
                exercise_id=exercise_log_data.exercise_id,
                name=exercise_log_data.name,
                sets=sets_data, # Store as JSON
                start_time=exercise_log_data.startTime,
                elapsed_time_ms=exercise_log_data.elapsedTime_ms,
                status=exercise_log_data.status.value, # Assuming status is an Enum
                active_work_time_ms=exercise_log_data.activeWorkTime_ms
            )
            db.add(db_logged_exercise)
        
        db.commit()
        db.refresh(db_workout_log)
        return db_workout_log

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error creating workout log: {e}")
        return None

def get_workout_log_by_id(db: Session, log_id: str, user_id: str) -> Optional[WorkoutLog]:
    """
    Retrieves a specific workout log by its ID for a given user.
    """
    try:
        return db.query(WorkoutLog).filter(WorkoutLog.id == log_id, WorkoutLog.user_id == user_id).first()
    except SQLAlchemyError as e:
        print(f"Error fetching workout log by ID: {e}")
        return None

def get_logged_exercises_for_log(db: Session, workout_log_id: str) -> List[LoggedExerciseDB]:
    """
    Retrieves all logged exercises associated with a specific workout_log_id.
    """
    try:
        return db.query(LoggedExerciseDB).filter(LoggedExerciseDB.workout_log_id == workout_log_id).all()
    except SQLAlchemyError as e:
        print(f"Error fetching logged exercises: {e}")
        return []

def get_user_workout_logs(db: Session, user_id: str, limit: int = 100, offset: int = 0) -> List[WorkoutLog]:
    """
    Retrieves a list of workout logs for a specific user, with pagination.
    """
    try:
        return db.query(WorkoutLog)\
                 .filter(WorkoutLog.user_id == user_id)\
                 .order_by(WorkoutLog.start_time.desc())\
                 .offset(offset)\
                 .limit(limit)\
                 .all()
    except SQLAlchemyError as e:
        print(f"Error fetching user workout logs: {e}")
        return []

def fetch_active_workout_session(db: Session, session_id: str, user_id: str | None = None) -> Optional[ActiveWorkoutSessions]:
    """
    Fetches the active workout session for a user.
    """
    try:
        res = db.query(ActiveWorkoutSessions).filter(ActiveWorkoutSessions.id == session_id).first()
        return ActiveWorkoutSession(**res.active_workout_session_json) if res else None
    except SQLAlchemyError as e:
        print(f"Error fetching active workout session: {e}")
        raise e

def insert_or_update_active_workout_session(
    db: Session,
    user_id: str,
    active_workout_session: ActiveWorkoutSession
) -> Optional[str]:
    """
    Upserts (inserts or updates) the active workout session for a user.
    Returns the session ID (primary key).
    """
    try:
        session_data = active_workout_session.model_dump()

        stmt = insert(ActiveWorkoutSessions).values(
            user_id=user_id,
            active_workout_session_json=session_data
        ).on_conflict_do_update(
            index_elements=["user_id"],  # user_id must be unique
            set_={
                "active_workout_session_json": session_data
            }
        )

        db.execute(stmt)
        db.commit()

        # Fetch the updated or inserted row to get the session ID
        session_row = db.query(ActiveWorkoutSessions).filter_by(user_id=user_id).first()
        return session_row.id if session_row else None

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error upserting active workout session: {e}")
        raise e
    
def remove_active_workout_session(db: Session, active_workout_session_id: str, user_id: str):
    """
    Removes the active workout session for a user.
    """
    try:
        # TODO: Add validations for user_id.
        db.query(ActiveWorkoutSessions).filter(ActiveWorkoutSessions.id == active_workout_session_id).delete()
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error removing active workout session: {e}")
        raise e


def save_user_workout_routine(db: Session, user_id: str, split: WorkoutSplit, workout_routine: WorkoutRoutine):
    """
    Stores a user's workout routine in the database.
    """
    try:
        db_workout_routine = UserWorkoutRoutine(
            user_id=user_id,
            split=split,
            generated_date=datetime.now(),
            routine_json=workout_routine.model_dump()
        )
        db.add(db_workout_routine)
        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error storing user workout routine: {e}")
        raise e

def get_cached_user_workout_routine(db: Session, user_id: str, split: WorkoutSplit) -> Optional[WorkoutRoutine]:
    """
    Retrieves a cached workout routine for a user and split.
    """
    try:
        latest_routine = db.query(UserWorkoutRoutine).filter(UserWorkoutRoutine.user_id == user_id, UserWorkoutRoutine.split == split).order_by(desc(UserWorkoutRoutine.generated_date)).first()
        if latest_routine and latest_routine.generated_date == datetime.now().date():
            return WorkoutRoutine(
                id=latest_routine.id,
                date=latest_routine.generated_date.strftime("%Y-%m-%d"),
                ai_insight=latest_routine.routine_json["ai_insight"],
                routine=latest_routine.routine_json["routine"]
            )
            
        else:
            return None
    except SQLAlchemyError as e:
        print(f"Error fetching cached user workout routine: {e}")
        raise e

# TODO: Add functions for updating and deleting workout logs if needed
# TODO: Add functions for more complex queries, e.g., exercise history for a specific exercise_id

# Example usage
if __name__ == "__main__":
    filter = ExerciseFilter(primary_muscle=PrimaryMuscle.CHEST, level=Level.BEGINNER)
    engine = create_engine("sqlite:///exercises.db")
    session = Session(bind=engine)
    for ex in search_exercises(filter, session):
        print(ex)
