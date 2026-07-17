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
                    
                    if cleaned_audit == "APPROVED" or ("APPROVED" in cleaned_audit.upper() and len(cleaned_audit) < 50):
                        logger.info("Code self-audit APPROVED by developer agent.")
                        break
                    else:
                        logger.info("Self-auditor updated the code with corrections.")
                        code = cleaned_audit
                return code

        async def run_dev_loop_ollama(system_instructions):
            import httpx
            url = f"{config.ollama_base_url}/api/chat"
            prompt = (
                f"Develop a complete, fully functional interactive web utility tool based on this description:\n"
                f"'{tool_description}'\n\n"
                "Remember to write all CSS and JS inline. Make it highly interactive, beautiful, and "
                "responsive. Ensure there are NO mock or simulated behaviors. Output only the raw HTML code without markdown code blocks."
            )
            messages = [
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": prompt}
            ]
            payload = {
                "model": config.ollama_model,
                "messages": messages,
                "stream": False,
                "options": {
                    "num_predict": 16384,
                    "temperature": 0.2
                }
            }
            logger.info("Starting local Ollama development request (direct)...")
            async with httpx.AsyncClient(timeout=300.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                code = res.json()["message"]["content"]
                code = clean_code(code)

                # Self-correction loop
                for iteration in range(1, 3):
                    logger.info("Triggering local Ollama self-correction iteration %d...", iteration)
                    audit_prompt = (
                        "Please audit the code you just generated for any flaws, specifically checking for:\n"
                        "1. Mock, simulated, or placeholder logic (e.g. fake setTimeout loaders instead of real operations, download functions that just download a dummy string, TODO comments).\n"
                        "2. Layout & Theme compatibility: Does it use a premium glassmorphic dark-mode design that matches our Outfit font and navbar?\n"
                        "3. Any missing script references or broken tags.\n\n"
                        "If the code has ANY issues, write the complete, updated HTML file fixing all issues. "
                        "If the code is already 100% complete, fully functional, and visually stunning, simply output 'APPROVED'."
                    )
                    messages.append({"role": "assistant", "content": code})
                    messages.append({"role": "user", "content": audit_prompt})
                    payload["messages"] = messages
                    
                    res = await client.post(url, json=payload)
                    res.raise_for_status()
                    audit_text = res.json()["message"]["content"]
                    cleaned_audit = clean_code(audit_text)

                    if cleaned_audit == "APPROVED" or ("APPROVED" in cleaned_audit.upper() and len(cleaned_audit) < 50):
                        logger.info("Code self-audit APPROVED by local Ollama.")
                        break
                    else:
                        logger.info("Local Ollama updated the code with corrections.")
                        code = cleaned_audit
                return code

        # Attempt to run with primary config
        try:
            if self.backend == "ollama":
                # Run direct Ollama
                system_instructions = (
                    "You are an expert lead front-end software engineer. Your goal is to write clean, self-contained, "
                    "responsive, and visually stunning web tools using HTML, CSS (Vanilla), and JavaScript.\n"
                    "The tools should be 100% fully functional in a single HTML file (with embedded CSS and JS), "
                    "mobile-friendly, and follow high-end design principles: elegant typography (e.g. Outfit, Inter), "
                    "dark mode styling, glassmorphism card layouts, smooth transitions, and intuitive interfaces.\n"
                    "CRITICAL: Do not write mock, simulated, or placeholder logic. All actions MUST be fully functional "
                    "and run locally in the browser. You may import third-party libraries from CDN.\n"
                    "Return ONLY the complete HTML file content, starting with <!DOCTYPE html> and ending with </html>. "
                    "Do not include any markdown formatting, backticks, or explanations outside the HTML code."
                )
                code = await run_dev_loop_ollama(system_instructions)
            else:
                agent_config = self._get_agent_config()
                logger.info("Developing micro-SaaS tool: %s using backend: %s", output_filename, self.backend)
                code = await run_dev_loop(agent_config)
        except Exception as e:
            logger.warning("ToolDeveloper failed on primary backend: %s. Attempting fallback...", e)
            
            # Fallback to local Ollama (free/unlimited) if Gemini failed
            if self.backend == "gemini":
                logger.info("Falling back to local Qwen 2.5 Coder via Ollama (direct)...")
                system_instructions = (
                    "You are an expert lead front-end software engineer. Your goal is to write clean, self-contained, "
                    "responsive, and visually stunning web tools using HTML, CSS (Vanilla), and JavaScript.\n"
                    "The tools should be 100% fully functional in a single HTML file (with embedded CSS and JS), "
                    "mobile-friendly, and follow high-end design principles.\n"
                    "All actions MUST be fully functional and run locally in the browser. You may import CDN libraries. "
                    "Return ONLY the complete HTML file content, starting with <!DOCTYPE html> and ending with </html>."
                )
                try:
                    code = await run_dev_loop_ollama(system_instructions)
                except Exception as fe:
                    logger.error("Ollama fallback development failed: %s", fe)
                    raise
            else:
                raise

        with open(target_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        logger.info("Successfully wrote tool to: %s", target_path)
        return target_path

    async def improve_tool(self, tool_path: Path, improvement_instruction: str = "") -> Path:
        """Improves an existing HTML tool file in-place, adding features and fixing bugs."""
        if not tool_path.exists():
            raise FileNotFoundError(f"Tool path {tool_path} does not exist.")
            
        with open(tool_path, "r", encoding="utf-8") as f:
            current_code = f.read()

        def clean_code(c: str) -> str:
            c = c.strip()
            if c.startswith("```html"):
                c = c[7:]
            elif c.startswith("```"):
                c = c[3:]
            if c.endswith("```"):
                c = c[:-3]
            return c.strip()

        prompt = (
            f"You are tasked with reviewing and improving this existing HTML web utility tool file.\n"
            f"Here is the current implementation code:\n"
            f"--- START CODE ---\n{current_code}\n--- END CODE ---\n\n"
            f"Goal: Improve this tool code. Additional focus areas: {improvement_instruction}\n"
            f"Specifically:\n"
            f"1. Fix any bugs, UI glitches, or raw/basic design elements. Bring it up to a premium dark-mode glassmorphic theme matching our design rules.\n"
            f"2. Add a useful new feature to make it a fully-featured product.\n"
            f"3. Make sure copy to clipboard features use visual toast/notifications (no default alerts) and file downloads work in-browser.\n"
            f"4. Keep all existing features intact.\n\n"
            f"Output only the full, updated HTML code starting with <!DOCTYPE html> and ending with </html>. Do not wrap in markdown code blocks."
        )

        async def run_dev_loop(agent_config):
            async with Agent(agent_config) as agent:
                logger.info("Starting tool improvement chat...")
                response = await agent.chat(prompt)
                code = await response.text()
                code = clean_code(code)
                return code

        async def run_dev_loop_ollama(system_instructions):
            import httpx
            url = f"{config.ollama_base_url}/api/chat"
            messages = [
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": prompt}
            ]
            payload = {
                "model": config.ollama_model,
                "messages": messages,
                "stream": False,
                "options": {
                    "num_predict": 16384,
                    "temperature": 0.2
                }
            }
            logger.info("Starting local Ollama tool improvement request...")
            async with httpx.AsyncClient(timeout=300.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                code = res.json()["message"]["content"]
                return clean_code(code)

        try:
            if self.backend == "ollama":
                system_instructions = "You are an expert lead front-end software engineer specializing in UI/UX improvements. Output only the complete improved HTML code."
                code = await run_dev_loop_ollama(system_instructions)
            else:
                agent_config = self._get_agent_config()
                code = await run_dev_loop(agent_config)
        except Exception as e:
            logger.warning("ToolDeveloper improve_tool failed on primary backend: %s. Falling back to Ollama...", e)
            if self.backend == "gemini":
                system_instructions = "You are an expert lead front-end software engineer specializing in UI/UX improvements. Output only the complete improved HTML code."
                try:
                    code = await run_dev_loop_ollama(system_instructions)
                except Exception as fe:
                    logger.error("Ollama fallback improvement failed: %s", fe)
                    raise
            else:
                raise

        with open(tool_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        logger.info("Successfully updated and improved tool file: %s", tool_path)
        return tool_path

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
