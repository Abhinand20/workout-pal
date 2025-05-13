# server/services/llm_service.py
from typing import Dict, Optional, Type

from models import WorkoutSplit, WorkoutRoutine
from llm.base import LLMClient
from llm.gemini_client import GeminiClient
from llm.agents.base_agent import BaseAgent
from llm.agents.workout_generator_agent import WorkoutGeneratorAgent

class LLMService:
    """Service for managing LLM clients and agents."""
    
    def __init__(self):
        """Initialize the LLM service with default client."""
        self.llm_client = GeminiClient()
        self.agents: Dict[str, BaseAgent] = {}
        self._register_agents()
    
    def _register_agents(self):
        """Register all available agents."""
        self.agents["workout_generator"] = WorkoutGeneratorAgent(self.llm_client)
        # Add more agents here as they are implemented
    
    def set_llm_client(self, client: LLMClient):
        """
        Change the LLM client for all agents.
        
        Args:
            client: The new LLM client to use
        """
        self.llm_client = client
        # Update client for all agents
        for agent_name, agent in self.agents.items():
            agent.llm_client = client
    
    async def generate_workout(self, prompt: str, split: Optional[WorkoutSplit] = None, **kwargs) -> WorkoutRoutine:
        """
        Generate a workout routine.
        
        Args:
            prompt: User preferences
            split: Workout split type
            **kwargs: Additional parameters for the agent
            
        Returns:
            A generated workout routine
        """
        workout_agent = self.agents["workout_generator"]
        return await workout_agent.execute(prompt=prompt, split=split, **kwargs)

def create_llm_service() -> LLMService:
    """Create a singleton instance of the LLM service."""
    return LLMService()