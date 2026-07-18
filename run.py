import asyncio
import os
import sys
import argparse
import logging
from pathlib import Path

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from config import config, load_env

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("run.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("aegis_runner")

async def run_pipeline(seed_topic: str, force_ollama: bool = False):
    """Executes the full Aegis-100K creation and publishing pipeline for a given seed topic."""
    logger.info("Initializing Aegis-100K on-demand pipeline...")
    
    # Reload env and configuration
    load_env()
    if force_ollama:
        logger.info("Forcing local Ollama backend for this run.")
        os.environ["MODEL_BACKEND"] = "ollama"
        # Re-initialize config backend manually
        config.model_backend = "ollama"
    
    logger.info("Active Backend: %s", config.model_backend)
    logger.info("Seed Topic: %s", seed_topic)
    
    from agent_orchestrator import AegisOrchestrator
    orchestrator = AegisOrchestrator()
    
    try:
        logger.info("=========================================")
        logger.info("STEP 1: Starting Pipeline Generation Loop")
        logger.info("=========================================")
        iteration_data = await orchestrator.run_iteration(seed_topic)
        
        logger.info("=========================================")
        logger.info("STEP 2: Running Static Compiler Compilation")
        logger.info("=========================================")
        from publish import publish_all
        publish_all()
        
        logger.info("=========================================")
        logger.info("Aegis-100K Pipeline execution SUCCESSFUL!")
        logger.info("=========================================")
        logger.info("Tool path: %s", iteration_data.get("tool_path"))
        logger.info("Article generated successfully.")
        
    except Exception as e:
        logger.exception("Pipeline run encountered a fatal error: %s", e)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aegis-100K On-Demand Pipeline Runner")
    parser.add_argument("--seed", type=str, default=None, help="Seed topic to research and build for")
    parser.add_argument("--ollama", action="store_true", help="Force local Ollama model backend")
    
    args = parser.parse_args()
    
    # Run pipeline
    seed_topic = args.seed
    if not seed_topic:
        from scheduler import get_next_new_topic
        seed_topic = get_next_new_topic()
        logger.info("No seed topic provided. Dynamically selected unbuilt topic: %s", seed_topic)
        
    asyncio.run(run_pipeline(seed_topic, force_ollama=args.ollama))
