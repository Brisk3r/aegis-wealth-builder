import asyncio
import logging
from config import config

# Import the Google Antigravity SDK components
from google.antigravity import Agent
from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
from google.antigravity.connections.local.local_openai_connection_config import LocalOpenAIAgentConfig
from google.antigravity.hooks import policy

from google.antigravity.types import CapabilitiesConfig, BuiltinTools

logger = logging.getLogger(__name__)

class NicheResearcher:
    """Agent specialized in market research, keyword analysis, and identifying niche business opportunities."""

    def __init__(self):
        self.backend = config.model_backend
        logger.info("Initializing NicheResearcher with backend: %s", self.backend)

    def _get_agent_config(self) -> LocalAgentConfig | LocalOpenAIAgentConfig:
        system_instructions = (
            "You are an expert market researcher and SEO specialist. Your goal is to identify highly profitable, "
            "low-competition niches, keywords, and affiliate programs for a new website or micro-SaaS tool.\n"
            "Use search_web to find trending topics, search volume estimates, keyword difficulty, and relevant "
            "affiliate links. Compile your findings into a clean, markdown-formatted report containing:\n"
            "1. Recommended Niche with justification.\n"
            "2. Top 5 low-difficulty SEO keywords with estimated volume.\n"
            "3. Top 3 affiliate programs or monetization methods for this niche.\n"
            "4. Suggested 3 micro-SaaS tool ideas that could capture traffic in this niche."
        )

        capabilities = CapabilitiesConfig(
            enabled_tools=[BuiltinTools.SEARCH_WEB, BuiltinTools.READ_URL_CONTENT]
        )

        if self.backend == "gemini":
            return LocalAgentConfig(
                system_instructions=system_instructions,
                capabilities=capabilities,
                policies=[policy.allow_all()],  # Allow search_web and other read tools
                workspaces=[str(config.BASE_DIR)],
                model=config.gemini_model
            )
        else:
            # Local Ollama connection
            return LocalOpenAIAgentConfig(
                model=config.ollama_model,
                base_url=config.ollama_base_url,
                system_instructions=system_instructions,
                capabilities=capabilities,
                policies=[policy.allow_all()],
                workspaces=[str(config.BASE_DIR)]
            )

    async def research_topic(self, seed_topic: str) -> str:
        """Runs the agent to perform market research on a seed topic."""
        agent_config = self._get_agent_config()
        
        # We start the agent session using 'async with'
        async with Agent(agent_config) as agent:
            prompt = f"Perform deep market research on the seed topic: '{seed_topic}'. Analyze keywords, affiliate programs, and potential SaaS tools."
            logger.info("Starting research chat for seed topic: %s", seed_topic)
            response = await agent.chat(prompt)
            return await response.text()

if __name__ == "__main__":
    # Test script for researcher
    logging.basicConfig(level=logging.INFO)
    async def test():
        researcher = NicheResearcher()
        report = await researcher.research_topic("developer productivity")
        print("--- Research Report ---")
        print(report)
    
    asyncio.run(test())
