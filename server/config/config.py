from typing import Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os


class GeminiConfig(BaseModel):
    """Gemini configuration settings."""
    api_key: str = Field(..., description="Gemini API key")
    model: str = Field(default="gemini-2.5-flash-preview-04-17", description="Gemini model to use")
    temperature: float = Field(default=0.0, description="Model temperature")
    max_tokens: Optional[int] = Field(default=None, description="Maximum tokens to generate")

class ServerConfig(BaseModel):
    """Server configuration settings."""
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    debug: bool = Field(default=True, description="Debug mode")
    cors_origins: list[str] = Field(default=[], description="Allowed CORS origins")

class DataConfig(BaseModel):
    """Data source configuration settings."""
    source_file: str = Field(default="data/exercises.json", description="Path to the data source file")
    vector_store_path: str = Field(default="data/vector_store", description="Path to store the vector database")

class Config(BaseModel):
    """Main configuration class that combines all config sections."""
    server: ServerConfig = Field(default_factory=ServerConfig)
    data: DataConfig = Field(default_factory=DataConfig)
    gemini: GeminiConfig = Field(default_factory=GeminiConfig)

class ConfigManager:
    """Singleton class to manage configuration."""
    _instance: Optional['ConfigManager'] = None
    _config: Optional[Config] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._config is None:
            self._load_config()

    def _load_config(self) -> None:
        """Load configuration from environment variables."""
        load_dotenv()

        gemini_config = GeminiConfig(
            api_key=os.getenv("GEMINI_API_KEY", ""),
            model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
            temperature=float(os.getenv("GEMINI_TEMPERATURE", "0.0")),
            max_tokens=int(os.getenv("GEMINI_MAX_TOKENS", "0")) if os.getenv("GEMINI_MAX_TOKENS") else None
        )

        # Load server config
        server_config = ServerConfig(
            host=os.getenv("SERVER_HOST", "0.0.0.0"),
            port=int(os.getenv("SERVER_PORT", "8000")),
            debug=os.getenv("DEBUG", "True").lower() == "true",
            cors_origins=os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
        )

        # Load data config
        data_config = DataConfig(
            source_file=os.getenv("DATA_SOURCE_FILE", "src/scraper/data.json"),
            vector_store_path=os.getenv("VECTOR_STORE_PATH", "src/data/vector_store")
        )

        self._config = Config(
            gemini=gemini_config,
            server=server_config,
            data=data_config
        )

    @property
    def config(self) -> Config:
        """Get the current configuration."""
        return self._config

    def get_gemini_config(self) -> GeminiConfig:
        """Get OpenAI configuration."""
        return self._config.gemini

    def get_server_config(self) -> ServerConfig:
        """Get server configuration."""
        return self._config.server

    def get_data_config(self) -> DataConfig:
        """Get data configuration."""
        return self._config.data 