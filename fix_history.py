import json

HISTORY_FILE = r"C:\Users\avram\Documents\antigravity\joyful-bell\data\history.json"

with open(HISTORY_FILE, "r", encoding="utf-8") as f:
    history = json.load(f)

# Fix by index since pattern matching is tricky with these 
FIXES = {
    26: ("OpenAPI Documentation Viewer", "static\\tools\\openapi_documentation_viewer_tool.html"),
    28: ("Webhook Request Inspector", "static\\tools\\webhook_request_inspector_tool.html"),
    29: ("JSON to TypeScript Converter", "static\\tools\\json_to_typescript_converter_tool.html"),
}

# Entry 27 has no tool file (it was about key pair generator / crypto dashboard)
# Let's check if there's a matching file
import os
tools_dir = r"C:\Users\avram\Documents\antigravity\joyful-bell\static\tools"
print("Entry 27 seed:", history[27]["seed_topic"][:100])
print("Entry 27 tool_path:", history[27].get("tool_path", "NONE"))
print("Entry 27 status:", history[27].get("status", "NONE"))

for idx, (new_topic, new_path) in FIXES.items():
    old = history[idx]["seed_topic"]
    history[idx]["seed_topic"] = new_topic
    history[idx]["tool_path"] = new_path
    print(f"Fixed entry {idx}: '{old[:60]}...' -> '{new_topic}'")

with open(HISTORY_FILE, "w", encoding="utf-8") as f:
    json.dump(history, f, indent=4)

print("\nDone!")
