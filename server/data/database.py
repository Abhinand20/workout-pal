from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data.schema import Base
from data.loader import load_exercises_from_json

DATABASE_URL = "sqlite:///exercises.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes the database tables based on the schema."""
    print("Initializing database...")
    # Creates all tables defined in Base.metadata
    Base.metadata.create_all(bind=engine)
    # Load data into the database
    load_exercises_from_json("data/exercises.json")
    print("Database initialized.")


def get_db():
    """Dependency function to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()