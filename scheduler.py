import asyncio
import logging
import argparse
import sys
import os
import random
import datetime
from pathlib import Path

from config import config, load_env
from agent_orchestrator import AegisOrchestrator
from agents.developer import ToolDeveloper
from publish import publish_all

logger = logging.getLogger("aegis_scheduler")

DEFAULT_TOPICS = [
    "Base64 Encoder Decoder",
    "JWT Decoder and Debugger",
    "Cron Job Schedule Expression Generator",
    "CSS Grid Layout Visual Generator",
    "URL Parser and Query Parameter Editor",
    "Diff Checker Side-by-Side Comparison Tool",
    "JSON Schema Visual Generator",
    "SVG File Compressor and Optimizer",
    "HTML Entity Encoder Decoder",
    "HTTP Header Inspector",
    "UUID Guid Generator Tool"
]

IMPROVEMENT_PROMPTS = [
    "Add a copy to clipboard toast and a download file button if they are missing or using basic alert popups. Add a clear button to wipe the workspaces. Ensure a premium glassmorphic layout is used.",
    "Add one extra advanced setting or feature toggle to make the utility more powerful for senior developers.",
    "Refine the visual spacing and margins to ensure the tool complies with layout guards. Do not squeeze the body flex properties.",
    "Add keyboard shortcuts or quick action keys (e.g., Ctrl+Enter to run/format) to improve productivity.",
    "Audit all inputs and outputs for potential scripting injection vectors and escape value strings appropriately."
]

def get_next_new_topic() -> str:
    """Finds the next topic in the default list that hasn't been built yet, or generates a random fallback."""
    tools_dir = config.BASE_DIR / "static" / "tools"
    for topic in DEFAULT_TOPICS:
        slug = topic.lower().replace(" ", "_")
        filename = f"{slug}_tool.html"
        if not (tools_dir / filename).exists():
            return topic
            
    # If all built, suggest a new one or return a random permutation
    adjectives = ["Pro", "Interactive", "Visual", "Quick", "Smart"]
    nouns = ["CSS Flexbox Grid", "Git Commands Cheat Sheet", "Markdown to HTML Editor", "Colors Palette Sandbox"]
    return f"{random.choice(adjectives)} {random.choice(nouns)}"

async def wait_until(hour: int, minute: int, label: str):
    """Calculates time delay to next target hour/minute local time and sleeps."""
    now = datetime.datetime.now()
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target <= now:
        target += datetime.timedelta(days=1)
        
    delay = (target - now).total_seconds()
    logger.info("Scheduler: Waiting for %s. Sleeping for %.2f hours (until %s)", label, delay / 3600, target)
    await asyncio.sleep(delay)

async def run_midday_improvement():
    """Triggered at midday. Scans built tools, picks one, and instructs Developer Agent to improve it."""
    logger.info("=========================================")
    logger.info("MIDDAY: Initiating Tool Improvement Pass")
    logger.info("=========================================")
    
    load_env()
    tools_dir = config.BASE_DIR / "static" / "tools"
    
    if not tools_dir.exists():
        logger.warning("No tools directory found. Skipping improvement pass.")
        return
        
    tool_files = list(tools_dir.glob("*_tool.html"))
    if not tool_files:
        logger.warning("No tools generated yet. Skipping improvement pass.")
        return
        
    # Select the last page to be updated (most recently modified file)
    selected_tool = max(tool_files, key=lambda p: p.stat().st_mtime)
    logger.info("Selected tool for improvement: %s", selected_tool.name)
    
    developer = ToolDeveloper()
    instruction = random.choice(IMPROVEMENT_PROMPTS)
    logger.info("Improvement instruction: %s", instruction)
    
    try:
        # Run improvement via agent
        await developer.improve_tool(selected_tool, instruction)
        
        # Compile and push sitemap and Vercel deployments
        logger.info("Running static compiler compilation after midday improvement...")
        publish_all()
        logger.info("Midday tool improvement and Vercel push completed successfully!")
    except Exception as e:
        logger.exception("Error running midday improvement pass: %s", e)

async def run_morning_research():
    """Triggered in the morning. Researches a new topic, develops the tool, writes article, and pushes."""
    logger.info("=========================================")
    logger.info("9:00 AM: Initiating New Tool Research & Push")
    logger.info("=========================================")
    
    load_env()
    topic = get_next_new_topic()
    logger.info("Selected new topic for morning run: %s", topic)
    
    orchestrator = AegisOrchestrator()
    try:
        # Run iteration
        await orchestrator.run_iteration(topic)
        
        # Publish and push sitemap and pages
        logger.info("Running static compiler compilation after morning generation...")
        publish_all()
        logger.info("Morning research, creation, and Vercel push completed successfully!")
    except Exception as e:
        logger.exception("Error running morning research pass: %s", e)

async def start_scheduler():
    logger.info("Aegis-100K Dual-Clock Scheduler Initialized.")
    
    async def midday_loop():
        while True:
            # Sleep until 12:00 PM (Midday)
            await wait_until(12, 0, "Midday Tool Improvement Pass")
            await run_midday_improvement()
            # Sleep for a minute to avoid double triggering within the same minute
            await asyncio.sleep(60)

    async def morning_loop():
        while True:
            # Sleep until 9:00 AM (Morning)
            await wait_until(9, 0, "Morning New Tool Research & Push")
            await run_morning_research()
            # Sleep for a minute to avoid double triggering
            await asyncio.sleep(60)

    # Run loops concurrently
    await asyncio.gather(
        midday_loop(),
        morning_loop()
    )

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("scheduler.log", encoding="utf-8")
        ]
    )
    
    parser = argparse.ArgumentParser(description="Aegis-100K Background Dual Scheduler")
    parser.add_argument("--test-midday", action="store_true", help="Manually trigger a midday improvement pass test run")
    parser.add_argument("--test-morning", action="store_true", help="Manually trigger a morning research pass test run")
    
    args = parser.parse_args()
    
    if args.test_midday:
        logger.info("Manually triggering Midday Improvement Pass...")
        asyncio.run(run_midday_improvement())
    elif args.test_morning:
        logger.info("Manually triggering Morning Research Pass...")
        asyncio.run(run_morning_research())
    else:
        try:
            asyncio.run(start_scheduler())
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user.")
