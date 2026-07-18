import asyncio
import logging
import argparse
import sys
import os
import random
import datetime
from pathlib import Path

from config import config, load_env
from agent_orchestrator import AegisOrchestrator
from agents.developer import ToolDeveloper
from publish import publish_all

logger = logging.getLogger("aegis_scheduler")

DEFAULT_TOPICS = [
    "Base64 Encoder Decoder",
    "JWT Decoder and Debugger",
    "Cron Job Schedule Expression Generator",
    "CSS Grid Layout Visual Generator",
    "URL Parser and Query Parameter Editor",
    "Diff Checker Side-by-Side Comparison Tool",
    "JSON Schema Visual Generator",
    "SVG File Compressor and Optimizer",
    "HTML Entity Encoder Decoder",
    "HTTP Header Inspector",
    "UUID Guid Generator Tool"
]

# Comprehensive registry: maps SEO-friendly topic name -> expected tool filename.
# The scheduler scans the tools directory and builds the next tool for any registry
# entry that doesn't have a matching file yet. Add new ideas here instead of
# maintaining a separate list that gets exhausted.
TOPIC_REGISTRY = {
    # --- Already built (kept for reference) ---
    "CSS Flexbox Cheat Sheet": "css_flexbox_cheat_sheet_tool.html",
    "Developer Productivity": "developer_productivity_tool.html",
    "Developer Tools": "developer_tools_tool.html",
    "Color Wheel Tool": "color_wheel_tool.html",
    "SaaS UI Boilerplate Exporter": "saas_ui_boilerplate_exporter_tool.html",
    "Analytics Card Builder": "analytics_card_builder_tool.html",
    "PDF Editor": "pdf_editor_tool.html",
    "RegEx Tester Tool": "regex_tester_tool.html",
    "SVG Path Editor": "svg_path_editor_tool.html",
    "JSON Formatter and Validator": "json_formatter_and_validator_tool.html",
    "SQL Query Formatter": "sql_query_formatter_tool.html",
    "Markdown Editor": "markdown_editor_tool.html",
    "Base64 Encoder Decoder": "base64_encoder_decoder_tool.html",
    "JWT Decoder and Debugger": "jwt_decoder_and_debugger_tool.html",
    "Cron Job Schedule Expression Generator": "cron_job_schedule_expression_generator_tool.html",
    "CSS Grid Layout Visual Generator": "css_grid_layout_visual_generator_tool.html",
    "URL Parser and Query Parameter Editor": "url_parser_and_query_parameter_editor_tool.html",
    "Diff Checker Side-by-Side Comparison Tool": "diff_checker_side-by-side_comparison_tool.html",
    "OpenAPI Documentation Viewer": "openapi_documentation_viewer_tool.html",
    "Webhook Request Inspector": "webhook_request_inspector_tool.html",
    "JSON to TypeScript Converter": "json_to_typescript_converter_tool.html",
    "Code Screenshot Generator": "code_screenshot_generator_tool.html",
    "Code Snippet Generator": "code_snippet_generator_tool.html",
    "DNS Record and SSL Certificate Inspector": "dns_record_and_ssl_certificate_inspector_tool.html",
    "UUID NanoID and Snowflake Generator": "uuid,_nanoid,_and_snowflake_string_generator_tool.html",
    # --- New topics to build (gap targets) ---
    "HTML Entity Encoder Decoder": "html_entity_encoder_decoder_tool.html",
    "HTTP Header Inspector": "http_header_inspector_tool.html",
    "JSON Schema Visual Generator": "json_schema_visual_generator_tool.html",
    "SVG File Compressor and Optimizer": "svg_file_compressor_and_optimizer_tool.html",
    "CSS Box Shadow Generator": "css_box_shadow_generator_tool.html",
    "Lorem Ipsum Generator": "lorem_ipsum_generator_tool.html",
    "Tailwind CSS Class Sorter": "tailwind_css_class_sorter_tool.html",
    "Meta Tag Generator for SEO": "meta_tag_generator_for_seo_tool.html",
    "Git Command Cheat Sheet": "git_command_cheat_sheet_tool.html",
    "Responsive Breakpoint Tester": "responsive_breakpoint_tester_tool.html",
    "JavaScript Event Keycode Finder": "javascript_event_keycode_finder_tool.html",
    "Timestamp and Epoch Converter": "timestamp_and_epoch_converter_tool.html",
    "YAML to JSON Converter": "yaml_to_json_converter_tool.html",
    "Password Strength Checker": "password_strength_checker_tool.html",
    "UTM Campaign Parameter Builder": "utm_campaign_parameter_builder_tool.html",
    "Markdown Table Generator": "markdown_table_generator_tool.html",
    "Favicon Generator from Text": "favicon_generator_from_text_tool.html",
    "OG Image Preview Tester": "og_image_preview_tester_tool.html",
    "CSV to JSON Converter": "csv_to_json_converter_tool.html",
    "QR Code Generator": "qr_code_generator_tool.html",
}

IMPROVEMENT_RULES = """IMPROVEMENT RULES (you MUST follow these):
1. Keep ALL existing features intact. Do not remove any working functionality.
2. Keep the <title> tag and H1 heading exactly as they are.
3. Do not apply flex centering styles (display:flex; align-items:center; justify-content:center; height:100vh) to the <body> tag.
4. Use toast notifications, not alert() dialogs.
5. Ensure the tool still does what its name says after your changes.
6. The improved version must have MORE features than the original, never fewer."""


IMPROVEMENT_PROMPTS = [
    f"{IMPROVEMENT_RULES}\n\nYOUR TASK: Add a copy to clipboard toast and a download file button if they are missing or using basic alert popups. Add a clear button to wipe the workspaces.",
    f"{IMPROVEMENT_RULES}\n\nYOUR TASK: Add one extra advanced setting or feature toggle to make the utility more powerful for senior developers.",
    f"{IMPROVEMENT_RULES}\n\nYOUR TASK: Refine the visual spacing and margins. Do not squeeze the body flex properties. Improve mobile responsiveness.",
    f"{IMPROVEMENT_RULES}\n\nYOUR TASK: Add keyboard shortcuts (e.g., Ctrl+Enter to run/format, Escape to clear) to improve productivity.",
    f"{IMPROVEMENT_RULES}\n\nYOUR TASK: Audit all inputs and outputs for potential scripting injection vectors and escape value strings appropriately."
]

def get_next_new_topic() -> str:
    """Scans the TOPIC_REGISTRY for the first topic whose tool file doesn't exist yet."""
    tools_dir = config.BASE_DIR / "static" / "tools"
    for topic, expected_file in TOPIC_REGISTRY.items():
        if not (tools_dir / expected_file).exists():
            logger.info("Gap detected: '%s' (expected file: %s)", topic, expected_file)
            return topic
    
    # All registry topics built — log clearly instead of generating random names
    logger.warning("All %d topics in TOPIC_REGISTRY are built. Add new topics to the registry.", len(TOPIC_REGISTRY))
    return ""

async def wait_until(hour: int, minute: int, label: str):
    """Calculates time delay to next target hour/minute local time and sleeps."""
    now = datetime.datetime.now()
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target <= now:
        target += datetime.timedelta(days=1)
        
    delay = (target - now).total_seconds()
    logger.info("Scheduler: Waiting for %s. Sleeping for %.2f hours (until %s)", label, delay / 3600, target)
    await asyncio.sleep(delay)

async def run_midday_improvement():
    """Triggered at midday. Scans built tools, picks one, and instructs Developer Agent to improve it."""
    logger.info("=========================================")
    logger.info("MIDDAY: Initiating Tool Improvement Pass")
    logger.info("=========================================")
    
    load_env()
    tools_dir = config.BASE_DIR / "static" / "tools"
    
    if not tools_dir.exists():
        logger.warning("No tools directory found. Skipping improvement pass.")
        return
        
    tool_files = list(tools_dir.glob("*_tool.html"))
    if not tool_files:
        logger.warning("No tools generated yet. Skipping improvement pass.")
        return
        
    # Select the oldest modified file to distribute improvements evenly
    selected_tool = min(tool_files, key=lambda p: p.stat().st_mtime)
    logger.info("Selected tool for improvement: %s", selected_tool.name)
    
    developer = ToolDeveloper()
    instruction = random.choice(IMPROVEMENT_PROMPTS)
    logger.info("Improvement instruction: %s", instruction)
    
    try:
        # Run improvement via agent
        await developer.improve_tool(selected_tool, instruction)
        
        # Compile and push sitemap and Vercel deployments
        logger.info("Running static compiler compilation after midday improvement...")
        publish_all()
        logger.info("Midday tool improvement and Vercel push completed successfully!")
    except Exception as e:
        logger.exception("Error running midday improvement pass: %s", e)

async def run_morning_research():
    """Triggered in the morning. Researches a new topic, develops the tool, writes article, and pushes."""
    logger.info("=========================================")
    logger.info("9:00 AM: Initiating New Tool Research & Push")
    logger.info("=========================================")
    
    load_env()
    topic = get_next_new_topic()
    if not topic:
        logger.info("No new topics to build. All registry entries fulfilled. Skipping morning run.")
        return
    logger.info("Selected new topic for morning run: %s", topic)
    
    orchestrator = AegisOrchestrator()
    try:
        # Run iteration
        await orchestrator.run_iteration(topic)
        
        # Publish and push sitemap and pages
        logger.info("Running static compiler compilation after morning generation...")
        publish_all()
        logger.info("Morning research, creation, and Vercel push completed successfully!")
    except Exception as e:
        logger.exception("Error running morning research pass: %s", e)

async def start_scheduler():
    logger.info("Aegis-100K Dual-Clock Scheduler Initialized.")
    
    async def midday_loop():
        while True:
            # Sleep until 12:00 PM (Midday)
            await wait_until(12, 0, "Midday Tool Improvement Pass")
            await run_midday_improvement()
            # Sleep for a minute to avoid double triggering within the same minute
            await asyncio.sleep(60)

    async def morning_loop():
        while True:
            # Sleep until 9:00 AM (Morning)
            await wait_until(9, 0, "Morning New Tool Research & Push")
            await run_morning_research()
            # Sleep for a minute to avoid double triggering
            await asyncio.sleep(60)

    # Run loops concurrently
    await asyncio.gather(
        midday_loop(),
        morning_loop()
    )

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("scheduler.log", encoding="utf-8")
        ]
    )
    
    parser = argparse.ArgumentParser(description="Aegis-100K Background Dual Scheduler")
    parser.add_argument("--test-midday", action="store_true", help="Manually trigger a midday improvement pass test run")
    parser.add_argument("--test-morning", action="store_true", help="Manually trigger a morning research pass test run")
    
    args = parser.parse_args()
    
    if args.test_midday:
        logger.info("Manually triggering Midday Improvement Pass...")
        asyncio.run(run_midday_improvement())
    elif args.test_morning:
        logger.info("Manually triggering Morning Research Pass...")
        asyncio.run(run_morning_research())
    else:
        try:
            asyncio.run(start_scheduler())
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user.")
