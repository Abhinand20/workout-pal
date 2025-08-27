from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data.schema import Base
from data.loader import load_exercises_from_json
from dotenv import load_dotenv
from sqlalchemy import inspect
from data.schema import Exercise
from sqlalchemy.orm import Session
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///exercises.db")
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes the database tables based on the schema."""
    # Creates all tables defined in Base.metadata
    Base.metadata.create_all(bind=engine)
    # Load data into the database
    # Check if exercises table exists and has data before loading
    inspector = inspect(engine)
    if 'exercises' not in inspector.get_table_names():
        load_exercises_from_json("data/exercises.json", engine)
    else:
        # Check if table is empty
        session = Session(bind=engine)
        try:
            exercise_count = session.query(Exercise).count()
            if exercise_count == 0:
                load_exercises_from_json("data/exercises.json", engine)
        finally:
            session.close()
    print("Database initialized.")


def get_db():
    """Dependency function to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    init_db()