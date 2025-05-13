from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from data.schema import Exercise, PrimaryMuscle, Level, Category, Force, Mechanic

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

# Example usage
if __name__ == "__main__":
    filter = ExerciseFilter(primary_muscle=PrimaryMuscle.CHEST, level=Level.BEGINNER)
    engine = create_engine("sqlite:///exercises.db")
    session = Session(bind=engine)
    for ex in search_exercises(filter, session):
        print(ex)
