import asyncio
import logging
from config import config

from google.antigravity import Agent
from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
from google.antigravity.connections.local.local_openai_connection_config import LocalOpenAIAgentConfig
from google.antigravity.hooks import policy

from google.antigravity.types import CapabilitiesConfig

logger = logging.getLogger(__name__)

class ContentPromoter:
    """Agent specialized in creating marketing campaigns and social media promotional posts."""

    def __init__(self):
        self.backend = config.model_backend

    def _get_agent_config(self) -> LocalAgentConfig | LocalOpenAIAgentConfig:
        system_instructions = (
            "You are a growth hacker and social media manager. Your goal is to draft compelling, high-converting "
            "promotional posts for social media platforms (X/Twitter, Reddit, LinkedIn, Pinterest) to drive organic "
            "traffic to a blog post, newsletter subscription, or micro-SaaS tool.\n"
            "Tailor the style to each platform: hook-driven for X, value-first and community-appropriate for Reddit, "
            "professional and story-driven for LinkedIn, and visually evocative for Pinterest.\n"
            "Always include placeholders for links (e.g. [Link]) and appropriate hashtags."
        )

        capabilities = CapabilitiesConfig(enabled_tools=[])

        if self.backend == "gemini":
            return LocalAgentConfig(
                system_instructions=system_instructions,
                capabilities=capabilities,
                policies=[policy.allow_all()],
                workspaces=[str(config.BASE_DIR)],
                model=config.gemini_model
            )
        else:
            return LocalOpenAIAgentConfig(
                model=config.ollama_model,
                base_url=config.ollama_base_url,
                system_instructions=system_instructions,
                capabilities=capabilities,
                policies=[policy.allow_all()],
                workspaces=[str(config.BASE_DIR)]
            )

    async def generate_campaign(self, product_name: str, description: str, keywords: list[str]) -> str:
        """Generates a complete multi-platform social media campaign draft, with robust fallbacks."""
        prompt = (
            f"Draft a social media marketing campaign for: '{product_name}'.\n"
            f"Product/Tool Description: {description}.\n"
            f"Target Keywords: {', '.join(keywords)}.\n\n"
            "Please generate:\n"
            "1. Three alternative X/Twitter threads/posts (with hooks and formatting).\n"
            "2. One detailed, educational Reddit post suitable for relevant subreddits.\n"
            "3. One professional LinkedIn story post explaining the 'why' behind building this tool.\n"
            "4. Pin titles and descriptions for Pinterest."
        )

        async def run_promote_ollama(model_name, sys_instr, prompt_text):
            import httpx
            url = f"{config.ollama_base_url}/api/chat"
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": sys_instr},
                    {"role": "user", "content": prompt_text}
                ],
                "stream": False,
                "options": {
                    "num_predict": 4096,
                    "temperature": 0.5
                }
            }
            logger.info("Starting local Ollama promotion request (direct) for %s...", model_name)
            async with httpx.AsyncClient(timeout=180.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                return res.json()["message"]["content"]

        try:
            if self.backend == "ollama":
                sys_inst = (
                    "You are a growth hacker and social media manager. Your goal is to draft compelling, high-converting "
                    "promotional posts for social media platforms (X/Twitter, Reddit, LinkedIn, Pinterest) to drive organic "
                    "traffic to a blog post, newsletter subscription, or micro-SaaS tool.\n"
                    "Tailor the style to each platform: hook-driven for X, value-first and community-appropriate for Reddit, "
                    "professional and story-driven for LinkedIn, and visually evocative for Pinterest.\n"
                    "Always include placeholders for links (e.g. [Link]) and appropriate hashtags."
                )
                return await run_promote_ollama("gemma4:latest", sys_inst, prompt)

            agent_config = self._get_agent_config()
            logger.info("Generating promotional campaign for: %s using backend: %s", product_name, self.backend)
            async with Agent(agent_config) as agent:
                response = await agent.chat(prompt)
                return await response.text()
        except Exception as e:
            logger.warning("ContentPromoter failed: %s. Falling back to local Ollama (gemma4:latest)...", e)
            if self.backend == "gemini":
                sys_inst = (
                    "You are a growth hacker and social media manager. Your goal is to draft compelling, high-converting "
                    "promotional posts for social media platforms (X/Twitter, Reddit, LinkedIn, Pinterest) to drive organic traffic."
                )
                try:
                    return await run_promote_ollama("gemma4:latest", sys_inst, prompt)
                except Exception as fe:
                    logger.error("Ollama fallback promotion failed: %s. Trying Qwen...", fe)
                    sys_inst_qwen = "You are a social media copywriter."
                    try:
                        return await run_promote_ollama(config.ollama_model, sys_inst_qwen, prompt)
                    except Exception as qe:
                        logger.error("Ollama ultimate fallback promotion failed: %s", qe)
                        raise
            else:
                raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    async def test():
        promoter = ContentPromoter()
        campaign = await promoter.generate_campaign(
            "Visual Git Branch Builder",
            "A drag-and-drop tool to visualize git branch merges and generate command lines.",
            ["git visualization", "git commands", "learn git"]
        )
        print("--- Social Campaign ---")
        print(campaign)
    
    asyncio.run(test())
