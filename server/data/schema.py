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
    

# TODO: Define schema for the workout log
