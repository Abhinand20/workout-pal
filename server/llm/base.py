from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class LLMClient(ABC):
    """Abstract base class for LLM clients."""
    
    @abstractmethod
    async def generate_content(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        """Generate content from the LLM."""
        pass

    @abstractmethod
    async def generate_structured_content(self, prompt: str, system_prompt: str = None, **kwargs) -> Any:
        """
        Generate structured content (like JSON) and parse into specified class.
        
        Args:
            prompt: The input prompt
            response_class: The Pydantic model class to parse the response into
            **kwargs: Additional generation parameters
            
        Returns:
            Instance of response_class
        """
        pass
    @abstractmethod
    def get_config(self) -> Dict[str, Any]:
        """Get the configuration for this LLM client."""
        pass