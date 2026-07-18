# Tool Improver Guide — Rules for Automated Quality Passes

This document defines the constraints and rules that the automated tool improvement agent
(triggered by the scheduler midday pass) must follow. These rules prevent regressions
observed during previous automated improvement runs.

---

## Critical Rules (NEVER violate)

### 1. Never Strip Existing Features
The improvement pass must **add** capability, not remove it. If the tool currently has 5 functional
features, the improved version must have at least 5 features plus whatever was added.

**Anti-pattern to avoid:** Previous passes reduced the FlowState Journal from a 46KB fully-featured
Pomodoro + context logger into a 10KB shell with just a timer.

### 2. Never Rename or Re-brand the Tool
The tool's `<title>` tag, H1 heading, and primary identity must remain consistent. The tool name
on the landing page comes from `history.json` → `seed_topic`, and renaming causes SEO URL mismatches.

**Rule:** If the current `<title>` says "FlowState Professional | Aegis Dev Hub", keep it.

### 3. Preserve SEO-Critical Tags
Do NOT remove or modify:
- `<title>` tag (keep existing wording)
- `<meta name="description">` (only improve, never delete)
- `<link rel="canonical">` (if present)
- `<link rel="icon">` (if present)
- Navbar injection markers (if present)

### 4. Body Flex Squeeze Guard
NEVER apply centering flex styles (`display: flex; align-items: center; justify-content: center; height: 100vh;`)
directly to the `<body>` tag. This squeezes the injected sticky navigation bar.

Instead, use a wrapper `<main>` or `<div>` inside body for centering.

### 5. Test Before Replacing
Before outputting the improved code, mentally verify:
- Does the tool still do what its title says?
- Are all interactive buttons still wired to working JavaScript functions?
- Are toast notifications used instead of `alert()` calls?
- Does the copy-to-clipboard function exist and work?
- Is there a clear/reset button?

---

## Recommended Improvements (Pick ONE per pass)

1. **Add copy-to-clipboard with toast notification** — If missing or using `alert()`.
2. **Add a download/export button** — Allow users to download generated output as a file.
3. **Add a clear/reset button** — Wipe all inputs and outputs to fresh state.
4. **Add keyboard shortcuts** — e.g., Ctrl+Enter to execute, Ctrl+K to clear.
5. **Add dark/light theme toggle** — With persistence in localStorage.
6. **Add an advanced settings panel** — A collapsible panel with extra configuration options.
7. **Refine mobile responsiveness** — Ensure the tool works on 375px viewport.
8. **Add input validation** — Show inline error messages for invalid input instead of silent failures.

---

## Improvement Prompt Template

When generating the improvement instruction, use this format:

```
IMPROVEMENT RULES (you MUST follow these):
1. Keep ALL existing features intact. Do not remove any working functionality.
2. Keep the <title> tag and H1 heading exactly as they are.
3. Do not apply flex centering to the <body> tag.
4. Use toast notifications, not alert() dialogs.
5. Ensure the tool still does what its name says.

YOUR TASK: [specific improvement instruction here]
```

---

## Observation Notes (from July 2026 audit)

| Tool | Issue Found | Suggested Improvement |
|---|---|---|
| FlowState Journal | Improvement pass stripped features | REVERTED to pre-improvement version |
| JWT Decoder | Works but basic styling | Add claim expiry countdown timer |
| Cron Expression Generator | Minimal interactivity | Add next-5-runs preview calendar |
| CSS Grid Generator | Basic layout | Add named grid areas visualization |
| Diff Checker | Functional | Add line numbers and word-level diff |
| Code Screenshot Generator | Clean but minimal | Add more gradient presets |
| OpenAPI Viewer | Functional | Add "Try It" request sandbox |
| Webhook Inspector | Simulated only | Clarify it's browser-side simulation |
