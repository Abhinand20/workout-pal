# server/services/agents/workout_generator_agent.py
import json
from typing import List, Optional
from datetime import datetime

from models import Exercise, WorkoutRoutine, WorkoutSplit
from llm.agents.base_agent import BaseAgent
from llm.gemini_client import GeminiClient
from config.prompts import WORKOUT_AGENT_SYSTEM_PROMPT, WORKOUT_AGENT_USER_PROMPT
from data.schema import LoggedExercise

class WorkoutGeneratorAgent(BaseAgent):
    """Agent for generating workout routines."""
    
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
        user_preferences = kwargs.get('user_preferences', 'Goal: Gain muscle mass and strength and lose fat')
        user_workout_history = kwargs.get('user_workout_history', [])
        split = kwargs.get('split')
        stretching_exercises = kwargs.get('stretching_exercises', [])
        primary_exercises = kwargs.get('primary_exercises', [])
        
        # Build the context for the model
        context = self._build_context(
            user_preferences=user_preferences, 
            user_workout_history=user_workout_history,
            split=split, 
            stretching_exercises=stretching_exercises,
            primary_exercises=primary_exercises,
        )
        
        # Get the response from the LLM
        print(f"Context: {context}")
        response_text = await self.llm_client.generate_structured_content(context, response_schema=WorkoutRoutine, system_prompt=WORKOUT_AGENT_SYSTEM_PROMPT)
        
        # # Parse the response into a WorkoutRoutine
        return self._parse_workout_response(response_text)
    
    def _build_context(self, 
                     user_preferences: str, 
                     user_workout_history: List[LoggedExercise],
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
        # We already specify the response schema for Gemini
        focus_groups = []
        if split and split.value == WorkoutSplit.PUSH:
            focus_groups = ["Chest", "Triceps"]
        elif split and split.value == WorkoutSplit.PULL:
            focus_groups = ["Back", "Biceps", "Forearms"]
        elif split and split.value == WorkoutSplit.LEGS:
            focus_groups = ["Legs", "Shoulders"]
        elif split and split.value == WorkoutSplit.FULL_BODY:
            focus_groups = ["Full Body"]
        else:
            focus_groups = []

        # Process workout history to string
        past_performance_data = json.dumps([{
            "id": ex.exercise_id,
            "name": ex.name,
            "sets": ex.sets,
        } for ex in (user_workout_history or [])])
        
        rendered_context = WORKOUT_AGENT_USER_PROMPT.render(
            date=datetime.now().strftime('%Y-%m-%d'),
            split=split.value if split else 'Not specified',
            focus_groups=focus_groups,
            user_preferences=user_preferences,
            primary_exercises=primary_json,
            past_performance_data=past_performance_data
        )
        
        return rendered_context
    
    def _parse_workout_response(self, response_text) -> WorkoutRoutine:
        """Parse the LLM response into a WorkoutRoutine object."""
        if isinstance(self.llm_client, GeminiClient):
            return response_text.parsed
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