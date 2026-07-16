import asyncio
import sys
import httpx
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from config import config

async def main():
    print(f"Ollama Base URL: {config.ollama_base_url}")
    print(f"Ollama Model: {config.ollama_model}")
    
    try:
        async with httpx.AsyncClient() as client:
            # Check Ollama version or running status
            response = await client.get(f"{config.ollama_base_url}/api/tags")
            print("Ollama tags response status:", response.status_code)
            if response.status_code == 200:
                print("Available Ollama models:")
                models_data = response.json()
                for m in models_data.get("models", []):
                    print(f" - {m['name']} ({m.get('details', {}).get('parameter_size', 'unknown size')})")
            else:
                print("Ollama response:", response.text)
    except Exception as e:
        print("Could not connect to Ollama:", e)

if __name__ == "__main__":
    asyncio.run(main())
