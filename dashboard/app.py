import asyncio
import json
import logging
from pathlib import Path
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from config import config, load_env
from agent_orchestrator import AegisOrchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aegis_dashboard")

app = FastAPI(title="Aegis-100K Dashboard")

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"

# Create directories if they don't exist
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "tools").mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# Request Models
class TriggerRequest(BaseModel):
    seed_topic: str

# Helper to load history
def load_history():
    history_path = DATA_DIR / "history.json"
    if history_path.exists():
        try:
            with open(history_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

# Background runner helper
def run_orchestrator_task(seed_topic: str):
    orchestrator = AegisOrchestrator()
    # Run the async loop inside the background thread
    asyncio.run(orchestrator.run_iteration(seed_topic))

@app.get("/api/config")
def get_config():
    # Reload env in case it changed
    load_env()
    return {
        "model_backend": config.model_backend,
        "niche": config.niche,
        "starting_budget": config.starting_budget,
        "budget_spent": config.budget_spent,
        "remaining_budget": config.remaining_budget,
        "ollama_model": config.ollama_model,
        "active_domains": config.active_domains,
        "has_gemini_key": bool(config.gemini_api_key)
    }

@app.get("/api/history")
def get_history():
    return load_history()

@app.post("/api/trigger")
def trigger_iteration(request: TriggerRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_orchestrator_task, request.seed_topic)
    return {"status": "triggered", "seed_topic": request.seed_topic}

# Serve static tools built by agents
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/hub")
def read_hub():
    hub_path = BASE_DIR / "index.html"
    if not hub_path.exists():
        raise HTTPException(status_code=404, detail="Developer Hub not compiled yet")
    return FileResponse(hub_path)

# Serve main index.html
@app.get("/")
def read_index():
    index_path = Path(__file__).parent / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Dashboard UI not found")
    return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
