import asyncio
import logging
from config import config

from google.antigravity import Agent
from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
from google.antigravity.connections.local.local_openai_connection_config import LocalOpenAIAgentConfig
from google.antigravity.hooks import policy

from google.antigravity.types import CapabilitiesConfig

logger = logging.getLogger(__name__)

class ContentWriter:
    """Agent specialized in writing SEO-optimized blog posts, newsletters, and marketing copy."""

    def __init__(self):
        self.backend = config.model_backend

    def _get_agent_config(self) -> LocalAgentConfig | LocalOpenAIAgentConfig:
        system_instructions = (
            "You are an elite copywriter and SEO blog author. Your goal is to write engaging, informative, and "
            "deeply researched articles and newsletters. You must naturally integrate specified keywords to "
            "maximize search engine ranking. Avoid keyword stuffing, write high-value educational content, and "
            "include clear calls-to-action (CTAs) pointing to relevant affiliate links or micro-SaaS tools.\n"
            "Produce structured Markdown with clear headings (H2, H3), bullet points, and clean syntax."
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

    async def write_article(self, topic: str, keywords: list[str], research_data: str) -> str:
        """Generates an SEO-optimized article based on a topic, keywords, and research data, with robust fallbacks."""
        prompt = (
            f"Write a comprehensive, SEO-optimized blog article (minimum 1000 words) on the topic: '{topic}'.\n"
            f"Keywords to integrate: {', '.join(keywords)}.\n"
            f"Here is the market research data for reference:\n{research_data}\n\n"
            "Provide the complete article in formatted Markdown."
        )

        async def run_write_ollama(model_name, sys_instr, prompt_text):
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
                    "num_predict": 8192,
                    "temperature": 0.4
                }
            }
            logger.info("Starting local Ollama writing request (direct) for %s...", model_name)
            async with httpx.AsyncClient(timeout=180.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                return res.json()["message"]["content"]

        try:
            if self.backend == "ollama":
                sys_inst = (
                    "You are an elite copywriter and SEO blog author. Your goal is to write engaging, informative, and "
                    "deeply researched articles and newsletters. You must naturally integrate specified keywords to "
                    "maximize search engine ranking. Avoid keyword stuffing, write high-value educational content, and "
                    "include clear calls-to-action (CTAs) pointing to relevant affiliate links or micro-SaaS tools.\n"
                    "Produce structured Markdown with clear headings (H2, H3), bullet points, and clean syntax."
                )
                # For articles, writer uses gemma4:latest or fallback
                model_to_use = "gemma4:latest"
                return await run_write_ollama(model_to_use, sys_inst, prompt)

            agent_config = self._get_agent_config()
            logger.info("Generating article for topic: %s using backend: %s", topic, self.backend)
            async with Agent(agent_config) as agent:
                response = await agent.chat(prompt)
                return await response.text()
        except Exception as e:
            logger.warning("ContentWriter failed on primary backend: %s. Falling back to local Ollama (gemma4:latest)...", e)
            if self.backend == "gemini" and config.is_ollama_running:
                sys_inst = (
                    "You are an elite copywriter and SEO blog author. Write engaging, informative, and "
                    "deeply researched articles. Integrate specified keywords naturally. Write high-value educational content."
                )
                try:
                    return await run_write_ollama("gemma4:latest", sys_inst, prompt)
                except Exception as fe:
                    logger.error("Ollama fallback content writing failed: %s. Falling back to Qwen...", fe)
                    # Try Qwen as ultimate fallback
                    sys_inst_qwen = "You are an elite copywriter and SEO blog author."
                    try:
                        return await run_write_ollama(config.ollama_model, sys_inst_qwen, prompt)
                    except Exception as qe:
                        logger.error("Ollama ultimate fallback writing failed: %s", qe)
                        raise e
            elif self.backend == "gemini":
                logger.warning("Local Ollama is offline. Propagating primary Gemini error to the orchestrator.")
                raise e
            else:
                raise

    async def write_newsletter(self, topic: str, product_name: str, cta_link: str) -> str:
        """Generates an engaging email newsletter draft with a clear CTA, with robust fallbacks."""
        prompt = (
            f"Draft an engaging email newsletter for our subscribers. The topic is '{topic}'.\n"
            f"We are promoting a product/tool named '{product_name}' which they can check out here: {cta_link}.\n"
            "The email should have a catchy subject line, clear value proposition, and a strong, clickable call to action."
        )

        async def run_write_ollama(model_name, sys_instr, prompt_text):
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
            async with httpx.AsyncClient(timeout=180.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                return res.json()["message"]["content"]

        try:
            if self.backend == "ollama":
                sys_inst = "You are an elite copywriter and email marketer."
                return await run_write_ollama("gemma4:latest", sys_inst, prompt)

            agent_config = self._get_agent_config()
            logger.info("Generating newsletter for topic: %s using backend: %s", topic, self.backend)
            async with Agent(agent_config) as agent:
                response = await agent.chat(prompt)
                return await response.text()
        except Exception as e:
            logger.warning("ContentWriter newsletter failed: %s. Falling back to local Ollama (gemma4:latest)...", e)
            if self.backend == "gemini" and config.is_ollama_running:
                sys_inst = "You are an elite copywriter and email marketer."
                try:
                    return await run_write_ollama("gemma4:latest", sys_inst, prompt)
                except Exception as fe:
                    logger.error("Ollama fallback newsletter failed: %s. Trying Qwen...", fe)
                    sys_inst_qwen = "You are an elite copywriter."
                    try:
                        return await run_write_ollama(config.ollama_model, sys_inst_qwen, prompt)
                    except Exception as qe:
                        logger.error("Ollama ultimate fallback newsletter failed: %s", qe)
                        raise e
            elif self.backend == "gemini":
                logger.warning("Local Ollama is offline. Propagating primary Gemini error to the orchestrator.")
                raise e
            else:
                raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    async def test():
        writer = ContentWriter()
        article = await writer.write_article(
            "Top Developer Tools for 2026", 
            ["developer tools", "productivity hacks", "best IDE extensions"],
            "Research shows high interest in AI-assisted developer environments."
        )
        print("--- Article Draft ---")
        print(article)
    
    asyncio.run(test())
