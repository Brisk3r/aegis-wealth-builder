import asyncio
import logging
import argparse
import sys
from agent_orchestrator import AegisOrchestrator

logger = logging.getLogger("aegis_scheduler")

async def run_scheduler(interval_hours: float, seed_topic: str):
    orchestrator = AegisOrchestrator()
    logger.info("Aegis-100K Scheduler started. Running every %s hours for niche: '%s'", interval_hours, seed_topic)
    
    while True:
        try:
            logger.info("Triggering scheduled wealth-building iteration...")
            await orchestrator.run_iteration(seed_topic)
            logger.info("Iteration completed successfully. Sleeping for %s hours...", interval_hours)
        except Exception as e:
            logger.error("Error running iteration: %s. Retrying next cycle.", e)
            
        await asyncio.sleep(interval_hours * 3600)

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("scheduler.log", encoding="utf-8")
        ]
    )
    
    parser = argparse.ArgumentParser(description="Aegis-100K Background Scheduler")
    parser.add_argument("--now", action="store_true", help="Run a single iteration immediately and exit")
    parser.add_argument("--interval", type=float, default=24.0, help="Interval in hours between iterations (default: 24.0)")
    parser.add_argument("--seed", type=str, default="Developer Tools", help="Seed topic to research and build for")
    
    args = parser.parse_args()
    
    if args.now:
        logger.info("Running manual immediate execution...")
        orchestrator = AegisOrchestrator()
        asyncio.run(orchestrator.run_iteration(args.seed))
    else:
        try:
            asyncio.run(run_scheduler(args.interval, args.seed))
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user.")
