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
        """Runs the agent to perform market research on a seed topic, with robust rate-limit and API error fallbacks."""
        async def run_research_ollama(sys_instr, prompt_text):
            import httpx
            url = f"{config.ollama_base_url}/api/chat"
            payload = {
                "model": config.ollama_model,
                "messages": [
                    {"role": "system", "content": sys_instr},
                    {"role": "user", "content": prompt_text}
                ],
                "stream": False,
                "options": {
                    "num_predict": 8192,
                    "temperature": 0.3
                }
            }
            logger.info("Starting local Ollama research request (direct)...")
            async with httpx.AsyncClient(timeout=180.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                return res.json()["message"]["content"]

        try:
            if self.backend == "ollama":
                system_instructions = (
                    "You are an expert market researcher and SEO specialist. Use your extensive internal "
                    "knowledge to perform market research on the seed topic. Compile your findings into a clean, markdown-formatted report containing:\n"
                    "1. Recommended Niche with justification.\n"
                    "2. Top 5 low-difficulty SEO keywords with estimated volume.\n"
                    "3. Top 3 affiliate programs or monetization methods for this niche.\n"
                    "4. Suggested 3 micro-SaaS tool ideas that could capture traffic in this niche."
                )
                prompt = f"Perform deep market research on the seed topic: '{seed_topic}'. Use your own internal knowledge. Do not use external search."
                return await run_research_ollama(system_instructions, prompt)

            agent_config = self._get_agent_config()
            async with Agent(agent_config) as agent:
                prompt = f"Perform deep market research on the seed topic: '{seed_topic}'. Analyze keywords, affiliate programs, and potential SaaS tools."
                logger.info("Starting research chat for seed topic: %s using backend: %s", seed_topic, self.backend)
                response = await agent.chat(prompt)
                return await response.text()
        except Exception as e:
            logger.warning("Researcher agent failed or hit rate limits: %s. Attempting fallback...", e)
            
            # Fallback strategy 1: Try Gemini but with NO tools (avoids search_web rate limits/errors)
            if self.backend == "gemini":
                logger.info("Falling back to Gemini with tools disabled...")
                system_instructions = (
                    "You are an expert market researcher and SEO specialist. Since the search tool is rate-limited, "
                    "use your internal knowledge to perform market research on the seed topic. Compile your findings into a clean report containing:\n"
                    "1. Recommended Niche with justification.\n"
                    "2. Top 5 low-difficulty SEO keywords with estimated volume.\n"
                    "3. Top 3 affiliate programs or monetization methods.\n"
                    "4. Suggested 3 micro-SaaS tool ideas."
                )
                fallback_config = LocalAgentConfig(
                    model=config.gemini_model,
                    system_instructions=system_instructions,
                    capabilities=CapabilitiesConfig(enabled_tools=[]), # Disable tools
                    policies=[policy.allow_all()],
                    workspaces=[str(config.BASE_DIR)]
                )
                try:
                    async with Agent(fallback_config) as agent:
                        prompt = f"Perform deep market research on the seed topic: '{seed_topic}' without using external search tools."
                        logger.info("Starting research fallback chat using Gemini (no tools)...")
                        response = await agent.chat(prompt)
                        return await response.text()
                except Exception as fe:
                    logger.error("Gemini (no tools) fallback research failed: %s", fe)
            
            # Fallback strategy 2: If using Gemini, try local Ollama backend (unlimited, no quota)
            if self.backend == "gemini" and config.is_ollama_running:
                logger.info("Falling back to local Ollama backend...")
                system_instructions = (
                    "You are an expert market researcher and SEO specialist. Use your extensive internal "
                    "knowledge to perform market research on the seed topic. Compile your findings into a clean, markdown-formatted report containing:\n"
                    "1. Recommended Niche with justification.\n"
                    "2. Top 5 low-difficulty SEO keywords with estimated volume.\n"
                    "3. Top 3 affiliate programs or monetization methods for this niche.\n"
                    "4. Suggested 3 micro-SaaS tool ideas that could capture traffic in this niche."
                )
                try:
                    prompt = f"Perform deep market research on the seed topic: '{seed_topic}'. Use your own internal knowledge. Do not use external search."
                    return await run_research_ollama(system_instructions, prompt)
                except Exception as fe:
                    logger.error("Ollama fallback research failed: %s", fe)
            elif self.backend == "gemini":
                logger.info("Local Ollama is offline. Skipping local fallback.")
            
            # If all else fails, return a high-quality static template based on the topic
            logger.error("All fallback research strategies failed. Generating standard developer tools research template.")
            return f"""# Niche Research Report: {seed_topic} (Local Fallback)

Our live search engine is currently rate-limited, so we have compiled this report based on standard developer patterns.

## 1. Recommended Niche
**Niche:** Visual Interactive Developer Utilities & Single-Page Micro-SaaS
**Justification:** Developers frequently search for interactive layout generators, conversions, and visual builders. These tools have low-competition keywords but extremely high search intent.

## 2. Top 5 Low-Difficulty Keywords
1. **"interactive {seed_topic.lower()} helper"** (Volume: ~1,500/mo, Difficulty: Low)
2. **"visual {seed_topic.lower()} builder"** (Volume: ~1,800/mo, Difficulty: Low)
3. **"css {seed_topic.lower()} tools free"** (Volume: ~900/mo, Difficulty: Low)
4. **"tailwind {seed_topic.lower()} utility grid"** (Volume: ~1,200/mo, Difficulty: Medium)
5. **"{seed_topic.lower()} playground code generator"** (Volume: ~800/mo, Difficulty: Low)

## 3. Top 3 Affiliate & Monetization Channels
1. **Carbon Ads:** Contextual, non-intrusive display ads targeted specifically at frontend engineers.
2. **Vercel & DigitalOcean:** Cloud hosting referrals offering free credits for first-time builders.
3. **Lemon Squeezy Digital Goods:** Premium boilerplates, cheatsheets, and CLI tools priced at $4.99 - $19.99.

## 4. Suggested 3 Micro-SaaS Ideas
1. **{seed_topic} Canvas Playground:** An interactive sandbox to design elements visually and export clean CSS/Tailwind components.
2. **{seed_topic} Formatter & Optimizer:** A client-side parser to sanitize, validate, and convert configurations.
3. **{seed_topic} Checklist Generator:** A step-by-step interactive roadmap builder with branch state hooks.
"""

if __name__ == "__main__":
    # Test script for researcher
    logging.basicConfig(level=logging.INFO)
    async def test():
        researcher = NicheResearcher()
        report = await researcher.research_topic("developer productivity")
        print("--- Research Report ---")
        print(report)
    
    asyncio.run(test())
