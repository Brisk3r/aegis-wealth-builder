# Next Session Guide & Future Run Notes

Use this document to quickly onboard and continue the Aegis Developer Hub iteration.

## 1. How to Run the Pipeline
We built a unified command-line runner at the root of the workspace. To trigger a complete iteration (Research &rarr; Code Tool &rarr; Write Article &rarr; Write Social Promotion &rarr; Compile &rarr; Git Publish), run:

```powershell
python run.py --seed "Your Target Topic"
```

To force the runner to use the local Ollama backend instead of checking Gemini:
```powershell
python run.py --seed "Your Target Topic" --ollama
```

## 2. Active Model Profile & Configuration
*   **Gemini (Cloud):** The API key is active but may return quota limits or 404s for `gemini-2.5-flash`.
*   **Ollama (Local):** Ollama is running at `http://localhost:11434` with:
    *   `qwen2.5-coder:14b` (specialized coding model, used by `developer.py` as default/fallback)
    *   `gemma4:latest` (specialized content model, used by `writer.py`, `promoter.py`, and `researcher.py` as local fallback)

## 3. Iterative Self-Correction Architecture
The developer agent utilizes a multi-turn feedback loop. When generating a tool:
1.  **Initial Draft:** Generates the tool.
2.  **Audit Step:** The agent reviews its own code for simulated/mock behaviors (like setTimeout download placeholders) or styling mismatches.
3.  **Correction Step:** Automatically corrects any issues before saving.

## 4. Completed Assets
*   **PDF Redactor:** Fully functional client-side redaction utility at [pdf_editor_tool.html](file:///c:/Users/avram/Documents/antigravity/joyful-bell/static/tools/pdf_editor_tool.html).
*   **FlowState Productivity Logger:** Context logging & Pomodoro focus dashboard at [developer_productivity_tool.html](file:///c:/Users/avram/Documents/antigravity/joyful-bell/static/tools/developer_productivity_tool.html).
*   **RegEx Tester Tool:** Automatically generated, compiled, and published at [regex_tester_tool_tool.html](file:///c:/Users/avram/Documents/antigravity/joyful-bell/static/tools/regex_tester_tool_tool.html).

## 5. Strategic Roadmap: Financial Freedom Mandate
Based on the validated concept dataset within `developer_tools_tool.html`, here are the top 3 highest-leverage paths forward to achieve rapid profitability and financial freedom:

### Phase 1: High-Speed, High-Demand Low-Hanging Fruit (Fast Time-to-Market)
1.  **SaaS UI Boilerplate Exporter (Next.js)**
    *   *Metrics:* Demand: 95%, Profitability: 80%, Complexity: Low.
    *   *Strategic Path:* Build a library of copy-paste Tailwind components that support custom themes. Monetize with a one-time license ($19) via Lemon Squeezy.
2.  **Tailwind CSS Real-Time Sandbox Inspector (Chrome Extension)**
    *   *Metrics:* Demand: 90%, Profitability: 60%, Complexity: Low.
    *   *Strategic Path:* Develop a browser extension to inspect and modify elements live, then export the code. Sell a lifetime premium license ($14) for custom config exports.

### Phase 2: Recurring Revenue Escalation (Stable Cash Flow)
3.  **Next.js Feature Flag Audit & Optimizer (Next.js)**
    *   *Metrics:* Demand: 86%, Profitability: 82%, Complexity: Medium.
    *   *Strategic Path:* Scan repositories for dead/unused feature flags. Offer subscription tiers at $29/mo (up to 5 repos) and $79/mo (enterprises).
4.  **Developer Payment Webhook Router API (API/Proxy)**
    *   *Metrics:* Demand: 88%, Profitability: 83%, Complexity: Medium.
    *   *Strategic Path:* Route payment events to telemetry systems like Mixpanel/PostHog. Subscription model at $19/mo base.

### Phase 3: Enterprise Capture (High Ticket Sales)
5.  **LLM Guardrails & Prompt Injection Sandbox API (Python/Security)**
    *   *Metrics:* Demand: 96%, Profitability: 98%, Complexity: High.
    *   *Strategic Path:* Security compliance filters for enterprise LLM apps. Monetize via high-tier corporate licenses starting at $499/mo.
