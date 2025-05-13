from google import genai
from google.genai import types
from typing import Dict, Any, Optional

from config.config import ConfigManager
from llm.base import LLMClient

class GeminiClient(LLMClient):
    """Client for interacting with Google's Gemini models."""
    
    def __init__(self):
        """Initialize the Gemini client with configuration."""
        config_manager = ConfigManager()
        self.gemini_config = config_manager.get_gemini_config()
        
        self.client = genai.Client(api_key=self.gemini_config.api_key)
        
    async def generate_content(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        """
        Generate content using Gemini model.
        
        Args:
            prompt: The input prompt
            system_prompt: The system prompt
            **kwargs: Additional parameters for generation
            
        Returns:
            Generated text response
        """
        response = await self.client.aio.models.generate_content(
            model=self.gemini_config.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=self.gemini_config.temperature,
                max_output_tokens=self.gemini_config.max_tokens,
                system_instruction=system_prompt,
            )
        )
        return response.text
    
    async def generate_structured_content(self, prompt: str, system_prompt: str = None, **kwargs) -> Any:
        """
        Generate structured (json) content using Gemini model.

        Args:
            prompt: The input prompt
            system_prompt: The system prompt
            response_schema: The schema of the response as defined in https://ai.google.dev/gemini-api/docs/migrate#json-response 
            **kwargs: Additional parameters for generation
            
        Returns:
            Structured content
        """
        if kwargs.get("response_schema") is None:
            raise ValueError("response_schema is required")
        response_schema = kwargs.get("response_schema")
        response = await self.client.aio.models.generate_content(
            model=self.gemini_config.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=self.gemini_config.temperature,
                max_output_tokens=self.gemini_config.max_tokens,
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=response_schema,
            )
        )
        return response.parsed

    def get_config(self) -> Dict[str, Any]:
        """Get the configuration for this client."""
        return {
            "model": self.gemini_config.model,
            "temperature": self.gemini_config.temperature,
            "max_tokens": self.gemini_config.max_tokens
        }