import argparse
import asyncio
import shutil
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from rnd.agent import build_workflow

def parse_args():
    parser = argparse.ArgumentParser(description="Run R&D tool improver LangGraph agent.")
    parser.add_argument(
        "--tool",
        type=str,
        default="cron_job_schedule_expression_generator_tool.html",
        help="Name of the tool HTML file in static/tools/"
    )
    parser.add_argument(
        "--backend",
        type=str,
        choices=["gemini", "ollama"],
        default="gemini",
        help="Model backend to use (gemini or ollama)"
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=2,
        help="Maximum audit-improvement iterations"
    )
    return parser.parse_args()

async def main():
    args = parse_args()
    
    # Paths
    src_tool_path = BASE_DIR / "static" / "tools" / args.tool
    rnd_dir = BASE_DIR / "rnd"
    rnd_tools_dir = rnd_dir / "tools"
    rnd_tools_dir.mkdir(parents=True, exist_ok=True)
    dest_tool_path = rnd_tools_dir / args.tool
    
    # 1. Verification of source
    if not src_tool_path.exists():
        print(f"Error: Source tool not found at {src_tool_path}")
        sys.exit(1)
        
    print(f"Copying '{args.tool}' to R&D folder: {dest_tool_path}")
    shutil.copy2(src_tool_path, dest_tool_path)
    
    with open(dest_tool_path, "r", encoding="utf-8") as f:
        original_code = f.read()
        
    # 2. Setup initial State
    initial_state = {
        "tool_name": args.tool,
        "original_code": original_code,
        "current_code": original_code,
        "improvement_goal": (
            "Add a fully functioning 'Next 5 Runs' preview list or calendar calculated dynamically using JavaScript. "
            "Add standard cron expression presets (e.g. Every Day at Midnight, Every Hour, Every 15 Minutes) to make the generator interactive. "
            "Enhance the design to match premium glassmorphic dark-mode aesthetics: dark deep navy background (#0b0f19), "
            "Outfit Google Font, cards with semi-transparent background (rgba(17,24,39,0.55)), backdrop-filter blur (12px), "
            "subtle borders (1px solid rgba(255,255,255,0.05)), and visual toast notifications (no default browser alerts)."
        ),
        "iteration": 0,
        "max_iterations": args.max_iterations,
        "logs": [],
        "errors": [],
        "feedback": "",
        "approved": False,
        "backend": args.backend
    }
    
    print("\n" + "="*50)
    print(f"Starting LangGraph workflow execution using backend: {args.backend.upper()}")
    print("="*50 + "\n")
    
    workflow = build_workflow()
    final_state = await workflow.ainvoke(initial_state)
    
    # 3. Write final code to the R&D tool file
    with open(dest_tool_path, "w", encoding="utf-8") as f:
        f.write(final_state["current_code"])
        
    print("\n" + "="*50)
    print("LangGraph Workflow Finished!")
    print("="*50)
    print(f"Final Approval Status: {final_state['approved']}")
    print(f"Total Iterations Run: {final_state['iteration']}")
    print(f"Saved improved tool output to: {dest_tool_path.relative_to(BASE_DIR)}")
    
    print("\n--- Workflow Execution Log ---")
    for log in final_state.get("logs", []):
        print(f" - {log}")
        
    if final_state.get("errors"):
        print("\n--- Errors Encountered ---")
        for err in final_state["errors"]:
            print(f" - {err}")

if __name__ == "__main__":
    asyncio.run(main())
