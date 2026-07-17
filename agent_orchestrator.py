import asyncio
import json
import logging
from pathlib import Path
from datetime import datetime

from config import config
from agents.researcher import NicheResearcher
from agents.writer import ContentWriter
from agents.developer import ToolDeveloper
from agents.promoter import ContentPromoter

logger = logging.getLogger(__name__)

async def run_with_retry(coro_func, *args, **kwargs):
    """Retries a coroutine function in case of rate limit (429/quota) errors with exponential backoff."""
    max_retries = 4
    delay = 20
    for attempt in range(max_retries):
        try:
            return await coro_func(*args, **kwargs)
        except Exception as e:
            err_str = str(e)
            if "Quota exceeded" in err_str or "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                logger.warning(
                    "Rate limit hit. Retrying in %d seconds... (Attempt %d/%d). Error: %s",
                    delay, attempt + 1, max_retries, err_str.split('\n')[0]
                )
                await asyncio.sleep(delay)
                delay *= 2
            else:
                raise
    # Final attempt that propagates the error if it still fails
    return await coro_func(*args, **kwargs)

class AegisOrchestrator:
    """Orchestrator for the Aegis-100K system, coordinating researcher, writer, developer, and promoter."""

    def __init__(self):
        self.data_dir = config.BASE_DIR / "data"
        self.data_dir.mkdir(exist_ok=True)
        self.history_path = self.data_dir / "history.json"
        
        # Load history
        if self.history_path.exists():
            try:
                with open(self.history_path, "r", encoding="utf-8") as f:
                    self.history = json.load(f)
            except Exception:
                self.history = []
        else:
            self.history = []

    def _save_history(self):
        with open(self.history_path, "w", encoding="utf-8") as f:
            json.dump(self.history, f, indent=4)

    async def run_iteration(self, seed_topic: str) -> dict:
        """Executes a full iteration of market research, tool building, article writing, and marketing campaign."""
        timestamp = datetime.now().isoformat()
        logger.info("Starting Aegis-100K iteration for seed topic: '%s' at %s", seed_topic, timestamp)
        
        iteration_data = {
            "timestamp": timestamp,
            "seed_topic": seed_topic,
            "status": "in_progress",
            "research_report": "",
            "tool_path": "",
            "article": "",
            "campaign": ""
        }
        self.history.append(iteration_data)
        self._save_history()
        
        try:
            # 1. Market Research
            logger.info("[Step 1/4] Starting Niche Research...")
            researcher = NicheResearcher()
            report = await run_with_retry(researcher.research_topic, seed_topic)
            iteration_data["research_report"] = report
            self._save_history()
            
            # Rate limit guard sleep
            logger.info("Sleeping to respect rate limits...")
            await asyncio.sleep(15)
            
            # 2. Develop Micro-SaaS Tool
            logger.info("[Step 2/4] Starting Micro-SaaS Tool Development...")
            developer = ToolDeveloper()
            slug = seed_topic.lower().replace(" ", "_")
            if slug.endswith("_tool"):
                tool_name = slug + ".html"
            else:
                tool_name = slug + "_tool.html"
            tool_description = f"A single-page utility tool for {seed_topic} based on this report:\n{report}"
            tool_path = await run_with_retry(developer.develop_tool, tool_description, tool_name)
            iteration_data["tool_path"] = str(tool_path.relative_to(config.BASE_DIR))
            self._save_history()
            
            # Rate limit guard sleep
            logger.info("Sleeping to respect rate limits...")
            await asyncio.sleep(15)
            
            # 3. Write SEO Blog Post / Article
            logger.info("[Step 3/4] Starting Content Writing...")
            writer = ContentWriter()
            article = await run_with_retry(
                writer.write_article,
                topic=f"Essential tools for {seed_topic}",
                keywords=[seed_topic, "niche tools", "productivity apps"],
                research_data=report
            )
            iteration_data["article"] = article
            self._save_history()
            
            # Rate limit guard sleep
            logger.info("Sleeping to respect rate limits...")
            await asyncio.sleep(15)
            
            # 4. Generate Promotion Campaign
            logger.info("[Step 4/4] Generating Social Media Campaign...")
            promoter = ContentPromoter()
            campaign = await run_with_retry(
                promoter.generate_campaign,
                product_name=seed_topic.title() + " Toolkit",
                description=f"Automated tool built to solve problems in {seed_topic}.",
                keywords=[seed_topic, "growth", "automation"]
            )
            iteration_data["campaign"] = campaign
            iteration_data["status"] = "completed"
            self._save_history()
            
            # 5. Compile and Publish/Deploy
            # NOTE: publish_all() is called by run.py after this method returns.
            # Do NOT call publish.py here to avoid double publishing.
                
            logger.info("Successfully completed Aegis-100K iteration for: '%s'", seed_topic)
            return iteration_data
            
        except Exception as e:
            logger.exception("Iteration failed for seed topic: %s", seed_topic)
            iteration_data["status"] = "failed"
            iteration_data["error"] = str(e)
            self._save_history()
            raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    async def main():
        orchestrator = AegisOrchestrator()
        result = await orchestrator.run_iteration("Developer Productivity")
        print("Iteration Status:", result["status"])
    
    asyncio.run(main())

