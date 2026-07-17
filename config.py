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
    gemini_model: str = Field(default_factory=lambda: os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"))
    
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
    
    # Custom Domain & Monetization configs
    custom_domain: str | None = Field(default_factory=lambda: os.environ.get("AEGIS_CUSTOM_DOMAIN"))
    carbon_ads_src: str | None = Field(default_factory=lambda: os.environ.get("CARBON_ADS_SRC"))
    google_adsense_client: str | None = Field(default_factory=lambda: os.environ.get("GOOGLE_ADSENSE_CLIENT"))
    google_adsense_slot: str | None = Field(default_factory=lambda: os.environ.get("GOOGLE_ADSENSE_SLOT"))
    google_analytics_id: str | None = Field(default_factory=lambda: os.environ.get("GOOGLE_ANALYTICS_ID"))
    affiliate_links_json: str | None = Field(default_factory=lambda: os.environ.get("AFFILIATE_LINKS_JSON"))
    lemonsqueezy_store_url: str | None = Field(default_factory=lambda: os.environ.get("LEMONSQUEEZY_STORE_URL"))

    @property
    def remaining_budget(self) -> float:
        return self.starting_budget - self.budget_spent

    @property
    def affiliate_links(self) -> dict[str, str]:
        import json
        if self.affiliate_links_json:
            cleaned = self.affiliate_links_json.strip().strip("'\"")
            try:
                return json.loads(cleaned)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error("Failed to parse AFFILIATE_LINKS_JSON: %s", e)
        return {}

    @property
    def is_ollama_running(self) -> bool:
        import socket
        try:
            with socket.create_connection(("127.0.0.1", 11434), timeout=1.0):
                return True
        except Exception:
            return False

    def model_post_init(self, __context):
        # Dynamically set domains if custom domain configured
        if self.custom_domain and self.custom_domain not in self.active_domains:
            self.active_domains.append(self.custom_domain)
            
        env_backend = os.environ.get("MODEL_BACKEND")
        if env_backend in ("gemini", "ollama"):
            self.model_backend = env_backend
        elif self.gemini_api_key:
            self.model_backend = "gemini"
        else:
            self.model_backend = "ollama"

# Global Config Instance
config = SystemConfig()
