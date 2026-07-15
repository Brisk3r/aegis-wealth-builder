import os
from pathlib import Path
from pydantic import BaseModel, Field

# Base Directory of the Workspace
BASE_DIR = Path(__file__).resolve().parent

# Load .env file manually to avoid dependencies on dotenv if not installed,
# though we can use it if we want.
def load_env():
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()

load_env()

class SystemConfig(BaseModel):
    # Base directory
    BASE_DIR: Path = Field(default=BASE_DIR)
    
    # API credentials
    gemini_api_key: str | None = Field(default_factory=lambda: os.environ.get("GEMINI_API_KEY"))
    
    # Ollama settings
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_model: str = Field(default="qwen2.5-coder:14b")
    
    # Active backend selection ("gemini" or "ollama")
    # Defaults to gemini if API key is present, otherwise ollama
    model_backend: str = Field(default="ollama")
    
    # Financial settings
    starting_budget: float = Field(default=500.0)
    budget_spent: float = Field(default=0.0)
    
    # Business selection
    niche: str = Field(default="Developer Tools & Micro-SaaS")
    
    # Active domains managed by Aegis
    active_domains: list[str] = Field(default_factory=list)
    
    @property
    def remaining_budget(self) -> float:
        return self.starting_budget - self.budget_spent

    def model_post_init(self, __context):
        env_backend = os.environ.get("MODEL_BACKEND")
        if env_backend in ("gemini", "ollama"):
            self.model_backend = env_backend
        elif self.gemini_api_key:
            self.model_backend = "gemini"
        else:
            self.model_backend = "ollama"

# Global Config Instance
config = SystemConfig()
