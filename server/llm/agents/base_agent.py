# server/services/agents/base_agent.py
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from llm.base import LLMClient

class BaseAgent(ABC):
    """Abstract base class for all agents in the system."""
    
    def __init__(self, llm_client: LLMClient):
        """Initialize with an LLM client."""
        self.llm_client = llm_client
    
    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """Execute the agent's main functionality."""
        pass