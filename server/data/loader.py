import json
from sqlalchemy.orm import Session
from data.schema import Exercise, Base
from sqlalchemy import create_engine

def load_exercises_from_json(json_path: str, db_path: str = "sqlite:///exercises.db"):
    # Setup DB
    engine = create_engine(db_path)
    Base.metadata.create_all(engine)
    session = Session(bind=engine)

    # Load data
    with open(json_path, 'r') as f:
        data = json.load(f)

    # Insert into DB
    for item in data:
        exercise = Exercise(
            id=item["id"],
            name=item["name"],
            force=item.get("force"),
            level=item.get("level"),
            mechanic=item.get("mechanic"),
            equipment=item.get("equipment"),
            primary_muscles=item.get("primaryMuscles", []),
            secondary_muscles=item.get("secondaryMuscles", []),
            instructions=item.get("instructions", []),
            category=item.get("category"),
            images=item.get("images", [])
        )
        session.merge(exercise)  # avoids duplicates on rerun

    session.commit()
    session.close()
    print("✅ Exercises loaded into database.")

if __name__ == "__main__":
    load_exercises_from_json("exercises.json")