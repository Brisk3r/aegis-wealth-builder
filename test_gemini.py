import asyncio
import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from config import config
from google.antigravity import Agent
from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
from google.antigravity.hooks import policy
from google.antigravity.types import CapabilitiesConfig

async def main():
    print(f"Backend: {config.model_backend}")
    print(f"Gemini API key preset: {bool(config.gemini_api_key)}")
    print(f"Model: {config.gemini_model}")
    
    models = ["gemini-3.1-flash-lite", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"]
    for model in models:
        print(f"\n--- Testing model: {model} ---")
        agent_config = LocalAgentConfig(
            system_instructions="You are a helpful assistant.",
            capabilities=CapabilitiesConfig(enabled_tools=[]),
            policies=[policy.allow_all()],
            workspaces=[str(config.BASE_DIR)],
            model=model
        )
        try:
            async with Agent(agent_config) as agent:
                response = await agent.chat("Say hello!")
                print(f"Success with {model}:", await response.text())
                break
        except Exception as e:
            print(f"Failed for {model}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
