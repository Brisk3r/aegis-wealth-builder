import asyncio
import logging
from pathlib import Path
from config import config

from google.antigravity import Agent
from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
from google.antigravity.connections.local.local_openai_connection_config import LocalOpenAIAgentConfig
from google.antigravity.hooks import policy

from google.antigravity.types import CapabilitiesConfig

logger = logging.getLogger(__name__)

class ToolDeveloper:
    """Agent specialized in developing and coding single-page micro-SaaS tools (HTML/CSS/JS)."""

    def __init__(self):
        self.backend = config.model_backend

    def _get_agent_config(self) -> LocalAgentConfig | LocalOpenAIAgentConfig:
        system_instructions = (
            "You are an expert lead front-end software engineer. Your goal is to write clean, self-contained, "
            "responsive, and visually stunning web tools using HTML, CSS (Vanilla), and JavaScript.\n"
            "The tools should be 100% fully functional in a single HTML file (with embedded CSS and JS), "
            "mobile-friendly, and follow high-end design principles: elegant typography (e.g. Outfit, Inter), "
            "dark mode styling, glassmorphism card layouts, smooth transitions, and intuitive interfaces.\n"
            "CRITICAL: Do not write mock, simulated, or placeholder logic. All actions (e.g., calculations, "
            "conversions, drawing, PDF parsing, context-saving, exports) MUST be fully functional and run "
            "locally in the browser. You may import third-party libraries from CDN (such as tailwind-css, "
            "pdf-lib, chart.js, lucide-icons, canvas-confetti, etc.) via <script> or <link> tags to deliver "
            "production-grade interfaces.\n"
            "Return ONLY the complete HTML file content, starting with <!DOCTYPE html> and ending with </html>. "
            "Do not include any markdown formatting, backticks, or explanations outside the HTML code."
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

    async def develop_tool(self, tool_description: str, output_filename: str) -> Path:
        """Develops a single-page web tool based on the description and writes it to a file, using iterative self-reflection."""
        # Ensure target folder exists
        tools_dir = config.BASE_DIR / "static" / "tools"
        tools_dir.mkdir(parents=True, exist_ok=True)
        target_path = tools_dir / output_filename

        def clean_code(c: str) -> str:
            c = c.strip()
            if c.startswith("```html"):
                c = c[7:]
            elif c.startswith("```"):
                c = c[3:]
            if c.endswith("```"):
                c = c[:-3]
            return c.strip()

        # Helper to execute the core creation & self-correction chat loop
        async def run_dev_loop(agent_config):
            async with Agent(agent_config) as agent:
                prompt = (
                    f"Develop a complete, fully functional interactive web utility tool based on this description:\n"
                    f"'{tool_description}'\n\n"
                    "Remember to write all CSS and JS inline. Make it highly interactive, beautiful, and "
                    "responsive. Ensure there are NO mock or simulated behaviors. Output only the raw HTML code without markdown code blocks."
                )
                logger.info("Starting development chat...")
                response = await agent.chat(prompt)
                code = await response.text()
                code = clean_code(code)

                # Iterative self-correction loop (slower but highly robust)
                for iteration in range(1, 3):
                    logger.info("Triggering self-correction loop iteration %d...", iteration)
                    audit_prompt = (
                        "Please audit the code you just generated for any flaws, specifically checking for:\n"
                        "1. Mock, simulated, or placeholder logic (e.g. fake setTimeout loaders instead of real operations, download functions that just download a dummy string, TODO comments).\n"
                        "2. Layout & Theme compatibility: Does it use a premium glassmorphic dark-mode design that matches our Outfit font and navbar?\n"
                        "3. Any missing script references or broken tags.\n\n"
                        "If the code has ANY issues, write the complete, updated HTML file fixing all issues. "
                        "If the code is already 100% complete, fully functional, and visually stunning, simply output 'APPROVED'."
                    )
                    audit_response = await agent.chat(audit_prompt)
                    audit_text = await audit_response.text()
                    cleaned_audit = clean_code(audit_text)
                    
                    if cleaned_audit == "APPROVED" or "APPROVED" in cleaned_audit.upper() and len(cleaned_audit) < 50:
                        logger.info("Code self-audit APPROVED by developer agent.")
                        break
                    else:
                        logger.info("Self-auditor updated the code with corrections.")
                        code = cleaned_audit
                return code

        # Attempt to run with primary config
        try:
            agent_config = self._get_agent_config()
            logger.info("Developing micro-SaaS tool: %s using backend: %s", output_filename, self.backend)
            code = await run_dev_loop(agent_config)
        except Exception as e:
            logger.warning("ToolDeveloper failed on primary backend: %s. Attempting fallback...", e)
            
            # Fallback to local Ollama (free/unlimited) if Gemini failed
            if self.backend == "gemini":
                logger.info("Falling back to local Qwen 2.5 Coder via Ollama...")
                system_instructions = (
                    "You are an expert lead front-end software engineer. Your goal is to write clean, self-contained, "
                    "responsive, and visually stunning web tools using HTML, CSS (Vanilla), and JavaScript.\n"
                    "The tools should be 100% fully functional in a single HTML file (with embedded CSS and JS), "
                    "mobile-friendly, and follow high-end design principles.\n"
                    "All actions MUST be fully functional and run locally in the browser. You may import CDN libraries. "
                    "Return ONLY the complete HTML file content, starting with <!DOCTYPE html> and ending with </html>."
                )
                fallback_config = LocalOpenAIAgentConfig(
                    model="qwen2.5-coder:14b",
                    base_url=config.ollama_base_url,
                    system_instructions=system_instructions,
                    capabilities=CapabilitiesConfig(enabled_tools=[]),
                    policies=[policy.allow_all()],
                    workspaces=[str(config.BASE_DIR)]
                )
                try:
                    code = await run_dev_loop(fallback_config)
                except Exception as fe:
                    logger.error("Ollama fallback development failed: %s", fe)
                    raise
            else:
                raise

        with open(target_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        logger.info("Successfully wrote tool to: %s", target_path)
        return target_path

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    async def test():
        dev = ToolDeveloper()
        file_path = await dev.develop_tool(
            "An interactive timestamp converter and epoch display tool with a sleek dark mode.",
            "timestamp_converter.html"
        )
        print("Tool created at:", file_path)
    
    asyncio.run(test())
