# server/services/agents/workout_generator_agent.py
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

from models import Exercise, WorkoutRoutine, WorkoutSplit
from llm.base import LLMClient
from llm.agents.base_agent import BaseAgent
from llm.gemini_client import GeminiClient
from config.prompts import WORKOUT_AGENT_SYSTEM_PROMPT

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
        prompt = kwargs.get('prompt', 'Goal: Gain muscle mass and strength and lose fat')
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
        print(f"Context: {context}")
        response_text = await self.llm_client.generate_structured_content(context, response_schema=WorkoutRoutine, system_prompt=WORKOUT_AGENT_SYSTEM_PROMPT)
        
        # Parse the response into a WorkoutRoutine
        return self._parse_workout_response(response_text)
    
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
        # We already specify the response schema for Gemini
        focus_groups = []
        if split and split.value == WorkoutSplit.PUSH:
            focus_groups = ["Chest", "Shoulders", "Triceps"]
        elif split and split.value == WorkoutSplit.PULL:
            focus_groups = ["Back", "Biceps", "Forearms"]
        context = f"""
        Create a workout routine for the user based on the following information:
        
        Today's date: {datetime.now().strftime('%Y-%m-%d')}
        Workout split: {split.value if split else 'Not specified'}
        Workout focus groups: {", ".join(focus_groups) if focus_groups else 'Not specified'}
        User preferences: {prompt}
        
        The data below is the relevant exercises from the exercises.json file. ONLY SELECT EXERCISES FROM THIS LIST AND USE THE EXERCISE IDS PROVIDED.
        Available stretching exercises:
        {stretching_json}
        
        Available primary exercises for this split:
        {primary_json}
        
        Create a workout routine with the following format:
        1. A brief insight about the workout (1-2 sentences) providing an overview of the workout
        2. A list of 2-3 stretching exercises from the available options
        3. A list of 5 primary exercises from the available options
        
        For each exercise, specify:
        - Exercise ID (must match one from the available exercises)
        - Exercise name
        - Number of sets (typically 3-5)
        - Rep range (e.g., "8-10" or "12")
        - Target weight in lbs (a single number, can be null for stretching exercises)
        - Rest period in seconds (typically 30-120)
        - Tip (short and concise tip for the exercise that a personal trainer would give to help the user perform the exercise better)
        - Focus groups (optional, can be null)
        """
        
        return context
    
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