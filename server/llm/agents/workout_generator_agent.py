# server/services/agents/workout_generator_agent.py
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import Exercise, WorkoutRoutine, WorkoutSplit
from llm.base import LLMClient
from llm.agents.base_agent import BaseAgent

class WorkoutGeneratorAgent(BaseAgent):
    """Agent for generating workout routines."""
    
    # TODO: 1) Add prompts 2) Massage the exercise data to be more useful in the context 3) Define a correct response schema
    async def execute(self, **kwargs) -> WorkoutRoutine:
        """
        Generate a workout routine.
        
        Args:
            prompt: User prompt or preferences
            split: Workout split type
            stretching_exercises: List of stretching exercises
            primary_exercises: List of main exercises
            
        Returns:
            Generated WorkoutRoutine
        """
        prompt = kwargs.get('prompt', '')
        split = kwargs.get('split')
        stretching_exercises = kwargs.get('stretching_exercises', [])
        primary_exercises = kwargs.get('primary_exercises', [])
        
        # Build the context for the model
        context = self._build_context(
            prompt=prompt, 
            split=split, 
            stretching_exercises=stretching_exercises,
            primary_exercises=primary_exercises
        )
        
        # Get the response from the LLM
        response_text = await self.llm_client.generate_structured_content(context, response_schema=WorkoutRoutine)
        
        # Parse the response into a WorkoutRoutine
        return self._parse_workout_response(response_text, split)
    
    def _build_context(self, 
                     prompt: str, 
                     split: Optional[WorkoutSplit],
                     stretching_exercises: List[Exercise],
                     primary_exercises: List[Exercise]) -> str:
        """Build the prompt context for the LLM model."""
        # Format the available exercises as JSON
        stretching_json = json.dumps([{
            "id": ex.id,
            "name": ex.name,
            "force": ex.force,
            "level": ex.level,
            "equipment": ex.equipment,
            "primary_muscles": ex.primary_muscles,
        } for ex in (stretching_exercises or [])])
        
        primary_json = json.dumps([{
            "id": ex.id,
            "name": ex.name,
            "force": ex.force,
            "level": ex.level,
            "equipment": ex.equipment,
            "primary_muscles": ex.primary_muscles,
        } for ex in (primary_exercises or [])])
        
        # Build the model prompt
        context = f"""
        You are a professional fitness coach creating a personalized workout routine.
        
        Today's date: {datetime.now().strftime('%Y-%m-%d')}
        Workout split: {split.value if split else 'Not specified'}
        User preferences: {prompt}
        
        Available stretching exercises:
        {stretching_json}
        
        Available primary exercises for this split:
        {primary_json}
        
        Create a workout routine with the following format:
        1. A brief insight about the workout (1-2 sentences)
        2. A list of 2-3 stretching exercises from the available options
        3. A list of 4-6 primary exercises from the available options
        
        For each exercise, specify:
        - Exercise ID (must match one from the available exercises)
        - Exercise name
        - Number of sets (typically 3-5)
        - Rep range (e.g., "8-10" or "12")
        - Rest period in seconds (typically 30-120)
        - Target weight in kg (optional, can be null)
        
        Format your response as a valid JSON object with the following structure:
        {
            "ai_insight": "string",
            "routine": [
                {
                    "id": "string",
                    "name": "string",
                    "target_sets": number,
                    "target_reps": "string",
                    "rest_period_seconds": number,
                    "target_weight_kg": number | null
                },
                ...
            ]
        }
        
        Only return the JSON object, nothing else.
        """
        
        return context
    
    def _parse_workout_response(self, response_text: str, split: Optional[WorkoutSplit]) -> WorkoutRoutine:
        """Parse the LLM response into a WorkoutRoutine object."""
        try:
            # Extract the JSON portion of the response
            json_str = response_text.strip()
            
            # Handle potential markdown code block wrapping
            if json_str.startswith("```json"):
                json_str = json_str[7:].strip()
            if json_str.startswith("```"):
                json_str = json_str[3:].strip()
            if json_str.endswith("```"):
                json_str = json_str[:-3].strip()
                
            # Parse the JSON
            workout_data = json.loads(json_str)
            
            # Create the workout routine
            exercises = [
                Exercise(
                    id=ex["id"],
                    name=ex["name"],
                    target_sets=ex["target_sets"],
                    target_reps=ex["target_reps"],
                    rest_period_seconds=ex.get("rest_period_seconds"),
                    target_weight_kg=ex.get("target_weight_kg")
                )
                for ex in workout_data["routine"]
            ]
            
            return WorkoutRoutine(
                date=datetime.now().strftime("%Y-%m-%d"),
                ai_insight=workout_data.get("ai_insight"),
                routine=exercises
            )
            
        except Exception as e:
            # Fallback for parsing errors
            print(f"Error parsing LLM response: {str(e)}")
            print(f"Raw response: {response_text}")
            
            # Return a minimal valid workout
            return WorkoutRoutine(
                date=datetime.now().strftime("%Y-%m-%d"),
                ai_insight="Failed to generate a proper workout. Please try again.",
                routine=[]
            )