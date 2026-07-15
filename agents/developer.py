import asyncio
import logging
from pathlib import Path
from config import config

from google.antigravity import Agent
from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
from google.antigravity.connections.local.local_openai_connection_config import LocalOpenAIAgentConfig
from google.antigravity.hooks import policy

logger = logging.getLogger(__name__)

class ToolDeveloper:
    """Agent specialized in developing and coding single-page micro-SaaS tools (HTML/CSS/JS)."""

    def __init__(self):
        self.backend = config.model_backend

    def _get_agent_config(self) -> LocalAgentConfig | LocalOpenAIAgentConfig:
        system_instructions = (
            "You are an expert front-end software engineer. Your goal is to write clean, self-contained, "
            "responsive, and visually stunning web tools using HTML, CSS (Vanilla), and JavaScript.\n"
            "The tools should be fully functional in a single HTML file (with embedded CSS and JS), "
            "mobile-friendly, and follow high-end design principles: elegant typography (e.g. Inter), "
            "dark mode styling, smooth transitions, and intuitive layouts.\n"
            "CRITICAL: Keep the code compact and clean (strictly under 350 lines total). Do not write "
            "redundant or overly verbose code. Ensure you do not exceed token limits.\n"
            "Return ONLY the complete HTML file content, starting with <!DOCTYPE html> and ending with </html>. "
            "Do not include any markdown formatting, backticks, or explanations outside the HTML code."
        )

        if self.backend == "gemini":
            return LocalAgentConfig(
                system_instructions=system_instructions,
                policies=[policy.allow_all()],
                workspaces=[str(config.BASE_DIR)],
                model="gemini-3.1-flash-lite"
            )
        else:
            return LocalOpenAIAgentConfig(
                model=config.ollama_model,
                base_url=config.ollama_base_url,
                system_instructions=system_instructions,
                policies=[policy.allow_all()],
                workspaces=[str(config.BASE_DIR)]
            )

    async def develop_tool(self, tool_description: str, output_filename: str) -> Path:
        """Develops a single-page web tool based on the description and writes it to a file."""
        agent_config = self._get_agent_config()
        
        # Ensure target folder exists
        tools_dir = config.BASE_DIR / "static" / "tools"
        tools_dir.mkdir(parents=True, exist_ok=True)
        target_path = tools_dir / output_filename
        
        async with Agent(agent_config) as agent:
            prompt = (
                f"Develop a complete, fully functional web utility tool based on this description:\n"
                f"'{tool_description}'\n\n"
                "Remember to write all CSS and JS inline. Make it highly interactive, beautiful, and "
                "responsive. Keep the entire file under 250 lines of code to prevent token limits. "
                "Output only the raw HTML code without markdown code blocks."
            )
            logger.info("Developing micro-SaaS tool: %s", output_filename)
            response = await agent.chat(prompt)
            code = await response.text()
            
            # Clean up the output if the model accidentally wrapped it in ```html ... ```
            code = code.strip()
            if code.startswith("```html"):
                code = code[7:]
            if code.endswith("```"):
                code = code[:-3]
            code = code.strip()
            
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
