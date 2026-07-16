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

        try:
            agent_config = self._get_agent_config()
            logger.info("Generating promotional campaign for: %s using backend: %s", product_name, self.backend)
            async with Agent(agent_config) as agent:
                response = await agent.chat(prompt)
                return await response.text()
        except Exception as e:
            logger.warning("ContentPromoter failed: %s. Falling back to local Ollama (gemma4:latest)...", e)
            if self.backend == "gemini":
                fallback_config = LocalOpenAIAgentConfig(
                    model="gemma4:latest",
                    base_url=config.ollama_base_url,
                    system_instructions=(
                        "You are a growth hacker and social media manager. Your goal is to draft compelling, high-converting "
                        "promotional posts for social media platforms (X/Twitter, Reddit, LinkedIn, Pinterest) to drive organic traffic."
                    ),
                    capabilities=CapabilitiesConfig(enabled_tools=[]),
                    policies=[policy.allow_all()],
                    workspaces=[str(config.BASE_DIR)]
                )
                try:
                    async with Agent(fallback_config) as agent:
                        response = await agent.chat(prompt)
                        return await response.text()
                except Exception as fe:
                    logger.error("Ollama fallback promotion failed: %s. Trying Qwen...", fe)
                    qwen_config = LocalOpenAIAgentConfig(
                        model=config.ollama_model,
                        base_url=config.ollama_base_url,
                        system_instructions="You are a social media copywriter.",
                        capabilities=CapabilitiesConfig(enabled_tools=[]),
                        policies=[policy.allow_all()],
                        workspaces=[str(config.BASE_DIR)]
                    )
                    async with Agent(qwen_config) as agent:
                        response = await agent.chat(prompt)
                        return await response.text()
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
