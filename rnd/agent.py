import asyncio
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from rnd.utils import validate_html

class AgentState(TypedDict):
    tool_name: str
    original_code: str
    current_code: str
    improvement_goal: str
    iteration: int
    max_iterations: int
    logs: List[str]
    errors: List[str]
    feedback: str
    approved: bool
    backend: str  # "gemini" or "ollama"

async def query_gemini(system_instructions: str, prompt: str) -> str:
    from google.antigravity import Agent
    from google.antigravity.connections.local.local_connection_config import LocalAgentConfig
    from google.antigravity.hooks import policy
    from google.antigravity.types import CapabilitiesConfig
    from config import config
    
    agent_config = LocalAgentConfig(
        system_instructions=system_instructions,
        capabilities=CapabilitiesConfig(enabled_tools=[]),
        policies=[policy.allow_all()],
        workspaces=[str(config.BASE_DIR)],
        model=config.gemini_model
    )
    async with Agent(agent_config) as agent:
        response = await agent.chat(prompt)
        return await response.text()

async def query_ollama(system_instructions: str, prompt: str) -> str:
    import httpx
    from config import config
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
    async with httpx.AsyncClient(timeout=300.0) as client:
        res = await client.post(url, json=payload)
        res.raise_for_status()
        return res.json()["message"]["content"]

async def improve_node(state: AgentState) -> dict:
    backend = state.get("backend", "gemini")
    current_code = state["current_code"]
    improvement_goal = state["improvement_goal"]
    feedback = state.get("feedback", "")
    iteration = state.get("iteration", 0)
    
    system_instructions = (
        "You are an expert lead front-end software engineer. Your goal is to write clean, self-contained, "
        "responsive, and visually stunning web tools using HTML, CSS (Vanilla), and JavaScript.\n"
        "The tools should be 100% fully functional in a single HTML file (with embedded CSS and JS), "
        "mobile-friendly, and follow high-end design principles: elegant typography (e.g. Outfit, Inter), "
        "dark mode styling, glassmorphism card layouts, smooth transitions, and intuitive interfaces.\n"
        "CRITICAL: Do not write mock, simulated, or placeholder logic. All actions MUST be fully functional "
        "and run locally in the browser. You may import third-party libraries from CDN (such as tailwind-css, "
        "pdf-lib, chart.js, lucide-icons, canvas-confetti, etc.) via <script> or <link> tags.\n"
        "Return ONLY the complete HTML file content, starting with <!DOCTYPE html> and ending with </html>. "
        "Do not include any markdown formatting, backticks, or explanations outside the HTML code."
    )
    
    prompt = (
        f"You are tasked with reviewing and improving this existing HTML web utility tool file.\n"
        f"Here is the current implementation code:\n"
        f"--- START CODE ---\n{current_code}\n--- END CODE ---\n\n"
        f"Goal: Improve this tool code. Additional focus areas: {improvement_goal}\n"
    )
    if feedback:
        prompt += f"\nThe previous attempt failed some audit checks with the following feedback:\n{feedback}\n"
    prompt += (
        "\nSpecifically, follow these requirements:\n"
        "1. Fix any bugs, UI glitches, or raw/basic design elements. Bring it up to a premium dark-mode glassmorphic theme matching our design rules.\n"
        "2. Add a useful new feature to make it a fully-featured product.\n"
        "3. Make sure copy to clipboard features use visual toast/notifications (no default alerts) and file downloads work in-browser.\n"
        "4. Keep all existing features intact. NEVER remove the original sticky navbar (<div class=\"navbar\">...</div>) or the Aussie APPs disclaimer footer (<footer>...</footer>). Copy them exactly from the source code.\n"
        "5. For parsing and computing next execution times in JavaScript, load and use the Croner library: 'https://cdn.jsdelivr.net/npm/croner@8.1.0/dist/croner.umd.min.js'. Usage in JS: const c = new Cron('* * * * *'); const nextTimes = c.nextRuns(5);. Do NOT use modules or other packages that don't load globally.\n\n"
        "Output only the full, updated HTML code starting with <!DOCTYPE html> and ending with </html>. Do not wrap in markdown code blocks."
    )
    
    log_msg = f"[Node: improve] Iteration {iteration + 1}: Querying {backend.upper()} backend..."
    print(log_msg)
    
    try:
        if backend == "gemini":
            updated_code = await query_gemini(system_instructions, prompt)
        else:
            updated_code = await query_ollama(system_instructions, prompt)
        
        # clean code from backticks
        def clean_code(c: str) -> str:
            c = c.strip()
            if c.startswith("```html"):
                c = c[7:]
            elif c.startswith("```"):
                c = c[3:]
            if c.endswith("```"):
                c = c[:-3]
            return c.strip()
            
        updated_code = clean_code(updated_code)
        
        return {
            "current_code": updated_code,
            "iteration": iteration + 1,
            "logs": state.get("logs", []) + [log_msg],
            "errors": []
        }
    except Exception as e:
        err_msg = f"[Node: improve] Iteration {iteration + 1} failed: {e}"
        print(err_msg)
        return {
            "iteration": iteration + 1,
            "logs": state.get("logs", []) + [err_msg],
            "errors": state.get("errors", []) + [err_msg]
        }

async def audit_node(state: AgentState) -> dict:
    backend = state.get("backend", "gemini")
    current_code = state["current_code"]
    original_title = "CronPro | Advanced Cron Generator"
    
    # 1. Programmatic checks
    prog_errors = validate_html(current_code, original_title)
    
    # 2. LLM semantic audit
    system_instructions = (
        "You are a Senior QA Automation Engineer and UI/UX Auditor. Your job is to audit a single-page HTML/JS tool "
        "to ensure it has high-fidelity interactivity, no mock/simulated behaviors, is fully functional, "
        "and complies with modern styling rules."
    )
    
    prompt = (
        "Please audit this generated HTML code for any flaws or rule violations:\n"
        f"--- START CODE ---\n{current_code}\n--- END CODE ---\n\n"
        "Verify these specific criteria:\n"
        "1. Real functionality: Check if there is any mock, simulated, or placeholder logic (e.g. fake setTimeout, hardcoded arrays instead of real calculations, TODO comments).\n"
        "2. Features: Verify that the tool has a functioning 'Next 5 Runs' preview list or calendar calculated dynamically using JavaScript.\n"
        "3. Design: Confirm it has a dark mode styling with semi-transparent background panels and subtle borders (glassmorphism style).\n"
        "4. Layout: Confirm there is no flex centering directly applied to the body tag.\n\n"
        "If there are any issues, respond with a bulleted list of issues starting with 'ISSUES FOUND:'.\n"
        "If the code is 100% complete, fully functional, and visually stunning, simply output 'APPROVED'."
    )
    
    log_msg = f"[Node: audit] Performing semantic audit using {backend.upper()}..."
    print(log_msg)
    
    llm_feedback = ""
    try:
        if backend == "gemini":
            audit_result = await query_gemini(system_instructions, prompt)
        else:
            audit_result = await query_ollama(system_instructions, prompt)
            
        audit_result = audit_result.strip()
        if "APPROVED" in audit_result.upper() and len(audit_result) < 50:
            llm_feedback = ""
        else:
            llm_feedback = audit_result
    except Exception as e:
        llm_feedback = f"Auditor LLM failed: {e}"
        
    all_errors = prog_errors.copy()
    if llm_feedback:
        all_errors.append(f"LLM Auditor feedback:\n{llm_feedback}")
        
    if all_errors:
        feedback_str = "\n".join(all_errors)
        print(f"[Node: audit] Audit failed with issues:\n{feedback_str}")
        return {
            "approved": False,
            "feedback": feedback_str,
            "logs": state.get("logs", []) + [log_msg, f"Audit failed: {len(all_errors)} issues found."]
        }
    else:
        print("[Node: audit] Audit approved successfully!")
        return {
            "approved": True,
            "feedback": "",
            "logs": state.get("logs", []) + [log_msg, "Audit passed."]
        }

def should_continue(state: AgentState):
    if state["approved"]:
        print("[Workflow Edge] Code approved. Ending workflow.")
        return "end"
    if state["iteration"] >= state["max_iterations"]:
        print(f"[Workflow Edge] Iteration limit reached ({state['iteration']}/{state['max_iterations']}). Ending workflow.")
        return "end"
    print(f"[Workflow Edge] Audit failed. Re-routing back to improve node (iteration {state['iteration'] + 1}).")
    return "improve"

def build_workflow() -> StateGraph:
    workflow = StateGraph(AgentState)
    
    # Define the nodes
    workflow.add_node("improve", improve_node)
    workflow.add_node("audit", audit_node)
    
    # Set the entrypoint
    workflow.set_entry_point("improve")
    
    # Add transition from improve to audit
    workflow.add_edge("improve", "audit")
    
    # Add conditional transition from audit
    workflow.add_conditional_edges(
        "audit",
        should_continue,
        {
            "improve": "improve",
            "end": END
        }
    )
    
    return workflow.compile()
