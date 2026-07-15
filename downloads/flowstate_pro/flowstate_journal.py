#!/usr/bin/env python3
"""
FlowState Pro: CLI Focus state logger and Git branch context manager.
"""
import sys
import os
import json
from datetime import datetime

STATE_FILE = os.path.expanduser("~/.flowstate_active")
LOGS_FILE = os.path.expanduser("~/.flowstate_history.json")

def set_focus(text):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        f.write(text)
    
    # Save to history
    history = []
    if os.path.exists(LOGS_FILE):
        try:
            with open(LOGS_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            pass
            
    history.insert(0, {
        "timestamp": datetime.now().isoformat(),
        "focus": text
    })
    
    with open(LOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(history[:100], f, indent=4)
        
    print(f"[FlowState] Focus logged successfully: '{text}'")

def export_logs(target_md):
    if not os.path.exists(LOGS_FILE):
        print("[FlowState] No focus history logs found.")
        return
        
    try:
        with open(LOGS_FILE, "r", encoding="utf-8") as f:
            history = json.load(f)
    except Exception as e:
        print(f"[FlowState] Error reading logs: {e}")
        return
        
    with open(target_md, "w", encoding="utf-8") as f:
        f.write("# FlowState Developer Focus Logs\n\n")
        for item in history:
            time_str = datetime.fromisoformat(item["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"### {time_str}\n")
            f.write(f"* {item['focus']}\n\n")
            
    print(f"[FlowState] Successfully exported focus history logs to: {target_md}")

def main():
    if len(sys.argv) < 2:
        print("FlowState Pro CLI Usage:")
        print("  python flowstate_journal.py log \"my focus context\"")
        print("  python flowstate_journal.py export report.md")
        return
        
    cmd = sys.argv[1].lower()
    if cmd == "log" and len(sys.argv) > 2:
        set_focus(sys.argv[2])
    elif cmd == "export" and len(sys.argv) > 2:
        export_logs(sys.argv[2])
    else:
        print("[FlowState] Unknown command or missing parameters.")

if __name__ == "__main__":
    main()
