import os
import json
import re
import html as html_module
import subprocess
from pathlib import Path
from config import config

BASE_DIR = Path(__file__).parent.resolve()
STATIC_DIR = BASE_DIR / "static"
TOOLS_DIR = STATIC_DIR / "tools"
ARTICLES_DIR = STATIC_DIR / "articles"
HISTORY_FILE = BASE_DIR / "data" / "history.json"

DOMAIN = config.custom_domain or "aegis-wealth-builder.vercel.app"

TOOL_DESCRIPTIONS = {
    "CSS Flexbox Cheat Sheet": "Interactive Flexbox playground and alignment generator with real-time visual grid testing and CSS/Tailwind export.",
    "Developer Productivity": "FlowState Journal: Document current branch contexts before switching to minimize team context-switching toil.",
    "Developer Tools": "DevTools Ideation Hub: Instantly brainstorm and prototype developer micro-SaaS concepts for targeted niches.",
    "Color Wheel Tool": "Paletton-inspired visual HSL color wheel and harmony palette generator with CSS variables and Tailwind config exporter.",
    "SaaS UI Boilerplate Exporter": "Interactive boilerplate configuration sandbox with live file explorer and dynamic browser-side ZIP exporter.",
    "Analytics Card Builder": "Interactive utility to customize and export pixel-perfect, glassmorphic analytics KPI cards in Tailwind CSS or Vanilla CSS.",
    "PDF Editor": "Client-side PDF redaction and annotation utility with page-level editing, text overlay, and secure local-only processing.",
    "RegEx Tester Tool": "Live regular expression testing sandbox with real-time match highlighting, capture group inspection, and common pattern library.",
    "SVG Path Editor": "Visual SVG path authoring tool with interactive Bézier curve handles, live preview, and optimized path data export.",
    "JSON Formatter and Validator": "Interactive utility to validate, parse, format, and export structured JSON data with real-time syntax checking.",
    "SQL Query Formatter": "Client-side SQL formatting sandbox to clean, optimize, and beautify queries with custom indentation settings.",
    "Base64 Encoder Decoder": "Real-time client-side Base64 converter supporting text-to-base64, image-to-base64, and binary data translations.",
    "Markdown Editor": "Compliance-ready Markdown editor (AuditTrailMD) featuring paragraph-level change history tracking and PDF export.",
    "JWT Decoder and Debugger": "Paste any JSON Web Token to instantly decode its header, payload, and signature with expiration validation and claim inspection.",
    "Cron Job Schedule Expression Generator": "Visual cron expression builder with human-readable schedule preview, next-run predictions, and copy-ready crontab output.",
    "CSS Grid Layout Visual Generator": "Interactive CSS Grid sandbox with drag-to-resize tracks, named areas, and instant CSS/Tailwind code export.",
    "URL Parser and Query Parameter Editor": "Decode, inspect, and edit URL components and query parameters in real-time with structured parameter table editing.",
    "Diff Checker Side-by-Side Comparison Tool": "Side-by-side text diff comparison utility with inline change highlighting, line-level diffing, and merge conflict resolution.",
    "OpenAPI Documentation Viewer": "Paste an OpenAPI spec (JSON/YAML) and instantly generate a beautiful, interactive API documentation dashboard in-browser.",
    "Webhook Request Inspector": "Simulated local webhook endpoint that captures and displays incoming HTTP request headers and JSON payloads live on screen.",
    "JSON to TypeScript Converter": "Convert raw JSON objects into TypeScript types, interfaces, or Zod validation schemas with a single click and clipboard export.",
    "Code Screenshot Generator": "Paste code, select a syntax theme and gradient background, and download a beautiful padded snippet image for social sharing.",
    "Code Snippet Generator": "Create and export syntax-highlighted code snippets with customizable themes, padding, and watermark-free image downloads.",
    "DNS Record and SSL Certificate Inspector": "Look up DNS records (A, AAAA, MX, TXT, CNAME) and inspect SSL certificate details for any domain directly in-browser.",
    "UUID NanoID and Snowflake Generator": "Generate UUID v4, NanoID, and Snowflake IDs with configurable lengths, bulk generation, and one-click copy to clipboard."
}

AFFILIATE_DESCRIPTIONS = {
    "digitalocean": "Deploy your next web application or backend cloud. Get a $200 free trial credit.",
    "vercel": "Instantly deploy static frontends and serverless API endpoints. The default home of React & Next.js.",
    "hosting": "Get high-performance web hosting, free custom domains, and automated sitemaps for your portfolio or blogs.",
}

def get_analytics_tag(indent=4) -> str:
    if not config.google_analytics_id:
        return ""
    spaces = " " * indent
    return f"""
{spaces}<!-- Google tag (gtag.js) -->
{spaces}<script async src="https://www.googletagmanager.com/gtag/js?id={config.google_analytics_id}"></script>
{spaces}<script>
{spaces}  window.dataLayer = window.dataLayer || [];
{spaces}  function gtag(){{dataLayer.push(arguments);}}
{spaces}  gtag('js', new Date());
{spaces}  gtag('config', '{config.google_analytics_id}');
{spaces}</script>"""

def ensure_dirs():
    STATIC_DIR.mkdir(exist_ok=True)
    TOOLS_DIR.mkdir(exist_ok=True)
    ARTICLES_DIR.mkdir(exist_ok=True)

def simple_markdown_to_html(md_text: str) -> str:
    """Converts basic markdown elements to HTML."""
    if not md_text:
        return ""
    
    # Escape HTML to prevent injection issues
    html = html_module.escape(md_text)
    
    # Code blocks
    html = re.sub(r"```(.*?)\n(.*?)```", r"<pre><code>\2</code></pre>", html, flags=re.DOTALL)
    
    # Headers
    html = re.sub(r"^### (.*?)$", r"<h3>\1</h3>", html, flags=re.MULTILINE)
    html = re.sub(r"^## (.*?)$", r"<h2>\1</h2>", html, flags=re.MULTILINE)
    html = re.sub(r"^# (.*?)$", r"<h1>\1</h1>", html, flags=re.MULTILINE)
    
    # Bold / Strong
    html = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", html)
    
    # Unordered Lists
    def repl_list(match):
        items = match.group(0).strip().split('\n')
        list_items = "".join([f"<li>{item.strip('* ').strip('- ')}</li>" for item in items if item])
        return f"<ul>{list_items}</ul>"
    html = re.sub(r"(?:^[*-] .+\n?)+", repl_list, html, flags=re.MULTILINE)
    
    # Paragraphs (any line that isn't a block element)
    lines = html.split('\n')
    output_lines = []
    in_pre = False
    for line in lines:
        if "<pre>" in line:
            in_pre = True
        if "</pre>" in line:
            in_pre = False
            output_lines.append(line)
            continue
        
        if in_pre:
            output_lines.append(line)
        elif line.strip() and not line.strip().startswith('<h') and not line.strip().startswith('<u') and not line.strip().startswith('<l') and not line.strip().startswith('<p'):
            output_lines.append(f"<p>{line.strip()}</p>")
        else:
            output_lines.append(line)
            
    return "\n".join(output_lines)

def generate_article_page(title: str, content_html: str, article_rel_path: str) -> str:
    ads_html = ""
    if config.carbon_ads_src:
        ads_html = f"""
        <div style="margin-bottom: 30px;">
            <script async type="text/javascript" src="{config.carbon_ads_src}" id="_carbonads_js"></script>
        </div>
        """
    elif config.google_adsense_client and config.google_adsense_slot:
        ads_html = f"""
        <div style="margin-bottom: 30px; text-align: center;">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="{config.google_adsense_client}"
                 data-ad-slot="{config.google_adsense_slot}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({{}});</script>
        </div>
        """

    adsense_tag = ""
    if config.google_adsense_client:
        adsense_tag = f'\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={config.google_adsense_client}" crossorigin="anonymous"></script>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Aegis Developer Hub</title>
    <link rel="icon" type="image/png" href="/static/logo.png">
    <link rel="canonical" href="https://{DOMAIN}/{article_rel_path}">{adsense_tag}
    <script defer src="/_vercel/insights/script.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-color: #080b11;
            --card-bg: rgba(17, 24, 39, 0.55);
            --border-color: rgba(255, 255, 255, 0.05);
            --primary-accent: #3b82f6;
            --secondary-accent: #60a5fa;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
        }}
        body {{
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.7;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.03) 0%, transparent 40%);
            background-attachment: fixed;
        }}
        .navbar {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 40px;
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(8, 11, 17, 0.85);
        }}
        .navbar a {{
            color: var(--text-main);
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: opacity 0.2s;
        }}
        .navbar a:hover {{
            opacity: 0.9;
        }}
        .back-link {{
            color: var(--secondary-accent) !important;
            font-size: 0.95rem;
            font-weight: 500;
        }}
        .container {{
            max-width: 800px;
            margin: 60px auto;
            padding: 0 20px;
        }}
        article {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 45px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(16px);
        }}
        h1 {{
            font-size: 2.8rem;
            font-weight: 800;
            margin-top: 0;
            margin-bottom: 25px;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--secondary-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1.25;
        }}
        p {{
            color: var(--text-main);
            margin-bottom: 25px;
            font-size: 1.05rem;
        }}
        h2, h3 {{
            color: var(--secondary-accent);
            margin-top: 40px;
            font-weight: 600;
        }}
        h2 {{
            font-size: 1.8rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
        }}
        h3 {{
            font-size: 1.4rem;
        }}
        ul, ol {{
            padding-left: 24px;
            margin-bottom: 30px;
        }}
        li {{
            margin-bottom: 12px;
            font-size: 1.05rem;
        }}
        pre {{
            background: rgba(0, 0, 0, 0.45);
            border: 1px solid var(--border-color);
            padding: 22px;
            border-radius: 12px;
            overflow-x: auto;
            margin: 25px 0;
        }}
        code {{
            font-family: 'Courier New', Courier, monospace;
            color: #34d399;
            font-size: 0.95rem;
        }}
        footer {{
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
            font-size: 0.95rem;
            border-top: 1px solid var(--border-color);
            margin-top: 100px;
            background: rgba(8, 11, 17, 0.4);
        }}
        .disclosure {{
            font-size: 0.85rem;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
            margin-bottom: 30px;
        }}
    </style>{get_analytics_tag(indent=4)}
</head>
<body>
    <div class="navbar">
        <a href="/">
            <img src="/static/logo.png" alt="Aegis Hub Logo" style="height: 30px;">
            <span>Aegis Developer Hub</span>
        </a>
        <a href="/" class="back-link">&larr; Back to Hub</a>
    </div>
    <div class="container">
        <article>
            {ads_html}
            {content_html}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed var(--border-color); font-size: 0.85rem; color: var(--text-muted);">
                <strong>Disclaimer:</strong> The tools and content provided on this website are for educational and informational purposes only and do not constitute financial, investment, legal, or professional advice.
            </div>
        </article>
    </div>
    <footer>
        <p>&copy; 2026 Aegis Developer Hub. All rights reserved.</p>
        <p style="margin-top: 15px;">
            <a href="/static/privacy.html" style="color: var(--text-muted); text-decoration: underline; margin-right: 15px;">Privacy Policy</a>
            <a href="/static/terms.html" style="color: var(--text-muted); text-decoration: underline;">Terms of Service & Disclaimer</a>
        </p>
    </footer>
</body>
</html>
"""


def get_category_for_tool(topic: str) -> str:
    topic_lower = topic.lower()
    if any(x in topic_lower for x in ["flex", "color", "wheel", "card", "svg", "pattern"]):
        return "ui"
    elif any(x in topic_lower for x in ["boilerplate", "regex", "json", "base64", "sql"]):
        return "code"
    elif any(x in topic_lower for x in ["productivity", "tools", "pdf", "editor", "markdown"]):
        return "productivity"
    return "code"

def get_category_for_article(title: str) -> str:
    title_lower = title.lower()
    if any(x in title_lower for x in ["flexbox", "color", "wheel", "card", "svg", "pattern"]):
        return "ui"
    elif any(x in title_lower for x in ["boilerplate", "regex", "json", "base64", "sql"]):
        return "code"
    elif any(x in title_lower for x in ["productivity", "tools", "pdf", "editor", "markdown"]):
        return "productivity"
    return "code"

def generate_index_page(tools, articles) -> str:
    tools_list_html = ""
    for tool in tools:
        cat = get_category_for_tool(tool['name'])
        tools_list_html += f"""
        <div class="card" data-category="{cat}">
            <div class="card-header">
                <span class="badge badge-tool">Interactive Tool</span>
            </div>
            <h3>{tool['name']}</h3>
            <p>{tool['description']}</p>
            <a href="/{tool['path'].replace(chr(92), '/')}" class="btn">Launch Tool &rarr;</a>
        </div>
        """
    
    if not tools:
        tools_list_html = "<p class='empty'>No tools generated yet. Checking back soon!</p>"

    articles_list_html = ""
    for art in articles:
        cat = get_category_for_article(art['title'])
        articles_list_html += f"""
        <div class="card" data-category="{cat}">
            <div class="card-header">
                <span class="badge badge-article">Companion Guide</span>
            </div>
            <h3>{art['title']}</h3>
            <p>{art['description']}</p>
            <a href="/{art['path'].replace(chr(92), '/')}" class="btn sec">Read Article &rarr;</a>
        </div>
        """
    
    if not articles:
        articles_list_html = "<p class='empty'>No articles published yet. Checking back soon!</p>"

    ads_html = ""
    if config.carbon_ads_src:
        ads_html = f"""
        <div style="margin: 20px auto; max-width: 330px;">
            <script async type="text/javascript" src="{config.carbon_ads_src}" id="_carbonads_js"></script>
        </div>
        """
    elif config.google_adsense_client and config.google_adsense_slot:
        ads_html = f"""
        <div style="margin: 30px auto 0 auto; max-width: 728px; text-align: center;">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="{config.google_adsense_client}"
                 data-ad-slot="{config.google_adsense_slot}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({{}});</script>
        </div>
        """

    adsense_tag = ""
    if config.google_adsense_client:
        adsense_tag = f'\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={config.google_adsense_client}" crossorigin="anonymous"></script>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aegis Developer Hub</title>
    <meta name="description" content="A curated sandbox of high-utility interactive developer tools, SaaS UI components, and premium coding guides. Free browser-based utilities for frontend engineers.">
    <meta property="og:title" content="Aegis Developer Hub">
    <meta property="og:description" content="Free interactive developer tools, SaaS UI components, and premium coding guides for frontend engineers.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://{DOMAIN}/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Aegis Developer Hub">
    <meta name="twitter:description" content="Free interactive developer tools, SaaS UI components, and premium coding guides.">
    <link rel="icon" type="image/png" href="/static/logo.png">
    <link rel="canonical" href="https://{DOMAIN}/">{adsense_tag}
    <script defer src="/_vercel/insights/script.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-color: #080b11;
            --card-bg: rgba(17, 24, 39, 0.55);
            --border-color: rgba(255, 255, 255, 0.05);
            --primary-accent: #3b82f6;
            --secondary-accent: #60a5fa;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
        }}
        body {{
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.03) 0%, transparent 40%);
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }}
        .hero {{
            padding: 120px 20px 90px 20px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(rgba(8, 11, 17, 0.8), rgba(8, 11, 17, 0.95)), url('/static/hero_banner.png') no-repeat center center;
            background-size: cover;
            position: relative;
        }}
        .hero::after {{
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
        }}
        .hero h1 {{
            font-size: 3.8rem;
            font-weight: 800;
            margin: 0 0 20px 0;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--secondary-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1px;
        }}
        .hero p {{
            color: var(--text-muted);
            font-size: 1.3rem;
            max-width: 650px;
            margin: 0 auto;
            line-height: 1.6;
            font-weight: 300;
        }}
        .controls-panel {{
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin: 40px auto 10px auto;
            max-width: 1200px;
            padding: 0 20px;
            width: calc(100% - 40px);
            box-sizing: border-box;
        }}
        @media (min-width: 768px) {{
            .controls-panel {{
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }}
        }}
        .search-wrapper {{
            position: relative;
            flex-grow: 1;
            max-width: 500px;
            width: 100%;
        }}
        .search-icon {{
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            stroke: var(--text-muted);
            pointer-events: none;
        }}
        #search-input {{
            width: 100%;
            box-sizing: border-box;
            background: rgba(17, 24, 39, 0.45);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 12px 16px 12px 48px;
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            transition: all 0.3s;
            backdrop-filter: blur(8px);
        }}
        #search-input:focus {{
            outline: none;
            border-color: rgba(59, 130, 246, 0.5);
            background: rgba(17, 24, 39, 0.6);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
        }}
        .filter-tabs {{
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 5px;
            scrollbar-width: none;
            width: 100%;
        }}
        @media (min-width: 768px) {{
            .filter-tabs {{
                width: auto;
            }}
        }}
        .filter-tabs::-webkit-scrollbar {{
            display: none;
        }}
        .filter-btn {{
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            padding: 10px 20px;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-weight: 500;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.25s;
            white-space: nowrap;
            backdrop-filter: blur(8px);
        }}
        .filter-btn:hover {{
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
        }}
        .filter-btn.active {{
            color: #ffffff;
            background: linear-gradient(135deg, var(--primary-accent), #4f46e5);
            border-color: transparent;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35);
        }}
        .container {{
            max-width: 1200px;
            margin: 20px auto 60px auto;
            padding: 0 20px;
            flex-grow: 1;
            width: calc(100% - 40px);
            box-sizing: border-box;
        }}
        .section-title {{
            font-size: 1.8rem;
            font-weight: 800;
            margin-top: 40px;
            margin-bottom: 25px;
            border-left: 4px solid var(--primary-accent);
            padding-left: 15px;
            letter-spacing: -0.5px;
            transition: opacity 0.3s;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
            gap: 30px;
            margin-bottom: 70px;
            transition: opacity 0.3s;
        }}
        .card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 35px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
            position: relative;
            overflow: hidden;
        }}
        .card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
            opacity: 0;
            transition: opacity 0.3s;
        }}
        .card:hover {{
            transform: translateY(-6px) scale(1.01);
            border-color: rgba(59, 130, 246, 0.25);
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
        }}
        .card:hover::before {{
            opacity: 1;
        }}
        .card-header {{
            margin-bottom: 15px;
        }}
        .badge {{
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 99px;
            letter-spacing: 0.5px;
        }}
        .badge-tool {{
            background: rgba(59, 130, 246, 0.1);
            color: var(--secondary-accent);
            border: 1px solid rgba(59, 130, 246, 0.15);
        }}
        .badge-article {{
            background: rgba(139, 92, 246, 0.1);
            color: #a78bfa;
            border: 1px solid rgba(139, 92, 246, 0.15);
        }}
        .card h3 {{
            margin-top: 0;
            font-size: 1.45rem;
            font-weight: 700;
            line-height: 1.3;
        }}
        .card p {{
            color: var(--text-muted);
            font-size: 1rem;
            line-height: 1.6;
            margin: 15px 0 30px 0;
            flex-grow: 1;
        }}
        .btn {{
            display: inline-block;
            text-align: center;
            background: var(--primary-accent);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.2s;
            border: 1px solid transparent;
        }}
        .btn:hover {{
            background: #2563eb;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
        }}
        .btn.sec {{
            background: transparent;
            border: 1px solid rgba(59, 130, 246, 0.4);
            color: var(--secondary-accent);
        }}
        .btn.sec:hover {{
            background: rgba(59, 130, 246, 0.1);
            border-color: var(--primary-accent);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
        }}
        .empty {{
            color: var(--text-muted);
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            background: var(--card-bg);
            border: 1px dashed var(--border-color);
            border-radius: 20px;
            backdrop-filter: blur(12px);
        }}
        footer {{
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
            border-top: 1px solid var(--border-color);
            font-size: 0.95rem;
            background: rgba(8, 11, 17, 0.4);
            margin-top: auto;
        }}
    </style>{get_analytics_tag(indent=4)}
</head>
<body>
    <div class="hero">
        <img src="/static/logo.png" alt="Aegis Hub Logo" style="height: 80px; margin-bottom: 25px; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.55));">
        <h1>Aegis Developer Hub</h1>
        <p>A curated sandbox of high-utility web tools, interactive components, and premium developer guides.</p>
        {ads_html}
    </div>
    
    <div class="controls-panel">
        <div class="search-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" id="search-input" placeholder="Search sandbox utilities, guides, and articles..." autocomplete="off">
        </div>
        <div class="filter-tabs">
            <button class="filter-btn active" data-filter="all">All Utilities</button>
            <button class="filter-btn" data-filter="ui">Layout & UI</button>
            <button class="filter-btn" data-filter="code">Code Utilities</button>
            <button class="filter-btn" data-filter="productivity">Productivity & Docs</button>
        </div>
    </div>

    <div class="container">
        <div class="section-title" id="tools-title">Interactive SaaS Utilities</div>
        <div class="grid" id="tools-grid">
            {tools_list_html}
        </div>
        
        <div class="section-title" id="articles-title">Guides & Insights</div>
        <div class="grid" id="articles-grid">
            {articles_list_html}
        </div>
    </div>
    
    <footer>
        <p>&copy; 2026 Aegis Developer Hub. All rights reserved.</p>
        <p style="font-size: 0.85rem; max-width: 600px; margin: 15px auto; line-height: 1.5; color: var(--text-muted);">
            <strong>Disclaimer:</strong> The tools and content provided on this website are for educational and informational purposes only and do not constitute financial, investment, legal, or professional advice.
        </p>
        <p style="margin-top: 20px;">
            <a href="/static/privacy.html" style="color: var(--text-muted); text-decoration: underline; margin-right: 15px;">Privacy Policy</a>
            <a href="/static/terms.html" style="color: var(--text-muted); text-decoration: underline;">Terms of Service & Disclaimer</a>
        </p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            const searchInput = document.getElementById('search-input');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const cards = document.querySelectorAll('.card');
            
            const toolsTitle = document.getElementById('tools-title');
            const toolsGrid = document.getElementById('tools-grid');
            const articlesTitle = document.getElementById('articles-title');
            const articlesGrid = document.getElementById('articles-grid');
            
            // Create empty state elements dynamically if they do not exist
            let emptyTools = document.getElementById('empty-tools-msg');
            if (!emptyTools) {{
                emptyTools = document.createElement('div');
                emptyTools.id = 'empty-tools-msg';
                emptyTools.className = 'empty';
                emptyTools.style.display = 'none';
                emptyTools.textContent = 'No matching tools found.';
                toolsGrid.appendChild(emptyTools);
            }}
            
            let emptyArticles = document.getElementById('empty-articles-msg');
            if (!emptyArticles) {{
                emptyArticles = document.createElement('div');
                emptyArticles.id = 'empty-articles-msg';
                emptyArticles.className = 'empty';
                emptyArticles.style.display = 'none';
                emptyArticles.textContent = 'No matching guides found.';
                articlesGrid.appendChild(emptyArticles);
            }}
            
            let activeFilter = 'all';
            let searchQuery = '';
            
            function filterItems() {{
                let visibleTools = 0;
                let visibleArticles = 0;
                
                cards.forEach(card => {{
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    const desc = card.querySelector('p').textContent.toLowerCase();
                    const cat = card.getAttribute('data-category');
                    
                    const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);
                    const matchesCategory = activeFilter === 'all' || cat === activeFilter;
                    
                    const isTool = card.querySelector('.badge-tool') !== null;
                    
                    if (matchesSearch && matchesCategory) {{
                        card.style.display = 'flex';
                        setTimeout(() => {{
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }}, 10);
                        if (isTool) visibleTools++;
                        else visibleArticles++;
                    }} else {{
                        card.style.display = 'none';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                    }}
                }});
                
                // Hide/show headers if no elements fit
                toolsTitle.style.display = (visibleTools === 0 && searchQuery !== '') ? 'none' : 'block';
                articlesTitle.style.display = (visibleArticles === 0 && searchQuery !== '') ? 'none' : 'block';
                
                // Show empty states if filtered grid is completely empty
                emptyTools.style.display = (visibleTools === 0) ? 'block' : 'none';
                emptyArticles.style.display = (visibleArticles === 0) ? 'block' : 'none';
            }}
            
            searchInput.addEventListener('input', (e) => {{
                searchQuery = e.target.value.toLowerCase().trim();
                filterItems();
            }});
            
            filterBtns.forEach(btn => {{
                btn.addEventListener('click', () => {{
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeFilter = btn.getAttribute('data-filter');
                    filterItems();
                }});
            }});
        }});
    </script>
</body>
</html>
"""

def post_process_tool(tool_abs_path: Path, topic: str):
    if not tool_abs_path.exists():
        return
        
    try:
        with open(tool_abs_path, "r", encoding="utf-8") as f:
            html = f.read()
    except Exception as e:
        print(f"Error reading tool file {tool_abs_path}: {e}")
        return
        
    modified = False

    # 1. Google AdSense client script injection
    if config.google_adsense_client:
        adsense_tag = f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={config.google_adsense_client}" crossorigin="anonymous"></script>'
        if "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" not in html and "</head>" in html:
            html = html.replace("</head>", f"    {adsense_tag}\n</head>", 1)
            modified = True
            
    # 1.5 Inject Vercel Analytics script
    analytics_tag = '\n    <script defer src="/_vercel/insights/script.js"></script>'
    if '/_vercel/insights/script.js' not in html and '</head>' in html:
        html = html.replace('</head>', f'{analytics_tag}\n</head>', 1)
        modified = True

    # 1.6 Inject Favicon Link tag
    if 'rel="icon"' not in html and "rel='icon'" not in html and '</head>' in html:
        favicon_tag = '\n    <link rel="icon" type="image/png" href="/static/logo.png">'
        html = html.replace('</head>', f'{favicon_tag}\n</head>', 1)
        modified = True
        
    # 1.7 Inject Google Analytics script
    if config.google_analytics_id and f'googletagmanager.com/gtag/js?id={config.google_analytics_id}' not in html and '</head>' in html:
        ga_tag = get_analytics_tag(indent=4)
        html = html.replace('</head>', f'{ga_tag}\n</head>', 1)
        modified = True

    # 1.9 Inject Lemon Squeezy script in head if not present
    ls_script = '\n    <script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>'
    if 'lemonsqueezy.com' not in html and 'lemon.js' not in html and '</head>' in html:
        html = html.replace('</head>', f'{ls_script}\n</head>', 1)
        modified = True

    # 2. Inject Navbar right after <body> if NOT already present
    if "Aegis Hub Logo" not in html and "navbar" not in html:
        navbar_html = """
    <div class="navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(11, 15, 25, 0.7); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; font-family: 'Outfit', sans-serif;">
        <a href="/" style="display: flex; align-items: center; gap: 10px; color: #f3f4f6; text-decoration: none; font-weight: 600;">
            <img src="/static/logo.png" alt="Aegis Hub Logo" style="height: 30px;">
            <span>Aegis Developer Hub</span>
        </a>
        <a href="/" style="color: #60a5fa; text-decoration: none; font-size: 0.95rem;">&larr; Back to Hub</a>
    </div>
    """
        if "<body>" in html:
            html = html.replace("<body>", f"<body>\n{navbar_html}", 1)
            modified = True
        elif "<body" in html:
            # handle attributes
            match = re.search(r"<body[^>]*>", html)
            if match:
                body_tag = match.group(0)
                html = html.replace(body_tag, f"{body_tag}\n{navbar_html}", 1)
                modified = True

    # 3. Inject default Outfit Font & basic styles only if the tool has no built-in styling system
    if "Aegis Hub Logo" not in html and "fonts.googleapis.com/css2?family=Outfit" not in html and "</head>" in html:
        if "tailwindcss" not in html and "tailwind.config" not in html:
            font_link = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">'
            custom_styles = f"""
    {font_link}
    <style>
        :root {{
            --bg-color: #0b0f19;
            --card-bg: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --primary-accent: #3b82f6;
            --secondary-accent: #60a5fa;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
        }}
        body {{
            background-color: var(--bg-color) !important;
            color: var(--text-main) !important;
            font-family: 'Outfit', sans-serif !important;
        }}
    </style>
"""
            html = html.replace("</head>", f"{custom_styles}\n</head>", 1)
            modified = True

    # 4. Lemon Squeezy product checkout injections (placeholders replacement)
    checkout_premium = "https://aegishub.lemonsqueezy.com/checkout/buy/22815780-b4e8-466d-a4eb-5bd71d121707?embed=1"
    checkout_kit = "https://aegishub.lemonsqueezy.com/checkout/buy/0f7285e8-f8d2-4d19-8856-1e6d08ef423f?embed=1"

    if '<span class="text-[10px] text-gray-500">Secure checkout handled by Lemon Squeezy</span>' in html and checkout_kit not in html:
        html = html.replace(
            '<span class="text-[10px] text-gray-500">Secure checkout handled by Lemon Squeezy</span>',
            f'<a href="{checkout_kit}" class="lemonsqueezy-button bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 text-xs md:text-sm text-center w-full" data-cb-type="checkout" data-cb-embed="1">Get Starter Kit - $29</a>\n                    <span class="text-[10px] text-gray-500">Secure checkout handled by Lemon Squeezy</span>'
        )
        modified = True
        
    if '<p class="text-[10px] text-gray-500 text-center">Checkout powered secure by Lemon Squeezy</p>' in html and checkout_premium not in html:
        html = html.replace(
            '<p class="text-[10px] text-gray-500 text-center">Checkout powered secure by Lemon Squeezy</p>',
            f'<a href="{checkout_premium}" class="lemonsqueezy-button block text-center bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 font-semibold py-2 px-4 rounded-lg text-xs transition-all duration-200" data-cb-type="checkout" data-cb-embed="1">Get Premium Spec - $4.99</a>\n                                        <p class="text-[10px] text-gray-500 text-center">Checkout powered secure by Lemon Squeezy</p>'
        )
        modified = True
        
    if modified:
        try:
            with open(tool_abs_path, "w", encoding="utf-8") as f:
                f.write(html)
        except Exception as e:
            print(f"Error writing tool file {tool_abs_path}: {e}")

def generate_sitemap(tools, articles):
    import datetime
    now_str = datetime.date.today().isoformat()
    
    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://{DOMAIN}/</loc>
        <lastmod>{now_str}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://{DOMAIN}/static/privacy.html</loc>
        <lastmod>{now_str}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
    <url>
        <loc>https://{DOMAIN}/static/terms.html</loc>
        <lastmod>{now_str}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.3</priority>
    </url>
"""
    
    for tool in tools:
        path = html_module.escape(tool['path'].replace('\\', '/'))
        sitemap_xml += f"""    <url>
        <loc>https://{DOMAIN}/{path}</loc>
        <lastmod>{now_str}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
"""
        
    for art in articles:
        path = html_module.escape(art['path'].replace('\\', '/'))
        sitemap_xml += f"""    <url>
        <loc>https://{DOMAIN}/{path}</loc>
        <lastmod>{now_str}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
"""
        
    sitemap_xml += "</urlset>\n"
    
    sitemap_path = BASE_DIR / "sitemap.xml"
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(sitemap_xml)
    print(f"Sitemap written successfully to {sitemap_path}")

def publish_all():
    ensure_dirs()
    if not HISTORY_FILE.exists():
        print("No history found, skipping compile.")
        return
        
    with open(HISTORY_FILE, "r") as f:
        history = json.load(f)
        
    tools = []
    articles = []
    seen_tools = set()
    seen_articles = set()
    
    for entry in history:
        if entry.get("status") != "completed":
            continue
            
        topic = entry.get("seed_topic")
        
        # 1. Gather tools
        tool_path = entry.get("tool_path")
        if tool_path and os.path.exists(BASE_DIR / tool_path):
            if tool_path not in seen_tools:
                seen_tools.add(tool_path)
                desc = TOOL_DESCRIPTIONS.get(topic, "Interactive utility built to optimize frontend workflows and layouts.")
                post_process_tool(BASE_DIR / tool_path, topic)
                tools.append({
                    "name": topic,
                    "path": tool_path,
                    "description": desc
                })
            
        # 2. Gather & compile articles
        article_text = entry.get("article")
        if article_text:
            topic_slug = topic.lower().replace(" ", "_")
            if topic_slug.endswith("_tool"):
                topic_slug = topic_slug[:-5]
            article_file_name = f"{topic_slug}.html"
            article_rel_path = f"static/articles/{article_file_name}"
            article_abs_path = ARTICLES_DIR / article_file_name
            
            # Extract H1 title and first paragraph description
            title = topic
            match = re.search(r"^#\s+(.+)$", article_text, re.MULTILINE)
            if match:
                title = match.group(1).strip()
                
            description = "Read our companion educational guide and resources targeting developer productivity."
            paragraphs = [p.strip() for p in article_text.split("\n\n") if p.strip()]
            for p in paragraphs:
                if not p.startswith("#") and not p.startswith("---") and not p.startswith("|") and not p.startswith("*") and not p.startswith("!"):
                    clean_p = re.sub(r"\*\*|__", "", p)
                    clean_p = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean_p)
                    if len(clean_p) > 160:
                        description = clean_p[:157] + "..."
                    else:
                        description = clean_p
                    break
            
            if article_rel_path not in seen_articles:
                seen_articles.add(article_rel_path)
                # Convert and save
                html_content = simple_markdown_to_html(article_text)
                full_html = generate_article_page(topic, html_content, article_rel_path)
                
                with open(article_abs_path, "w", encoding="utf-8") as art_f:
                    art_f.write(full_html)
                    
                articles.append({
                    "title": title,
                    "path": article_rel_path,
                    "description": description
                })

    # 3. Create root landing page
    index_html = generate_index_page(tools, articles)
    with open(BASE_DIR / "index.html", "w", encoding="utf-8") as f:
        f.write(index_html)

    # 3.25 Generate Sitemap
    try:
        generate_sitemap(tools, articles)
    except Exception as se:
        print(f"Failed to generate sitemap: {se}")

    # 3.5 Generate Privacy and Terms pages
    privacy_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Privacy Policy - Aegis Developer Hub</title>
    <link rel="icon" type="image/png" href="/static/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body { background: #0b0f19; color: #f3f4f6; font-family: 'Outfit', sans-serif; padding: 40px 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
        h1, h2 { color: #60a5fa; }
        a { color: #3b82f6; text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: July 15, 2026</p>
    <p>This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information. We are committed to complying with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth) and global privacy rules (GDPR/CCPA).</p>
    <h2>1. Collection of Personal Information</h2>
    <p>We do not collect any personal information when you browse this site or launch our static tools. If you subscribe to our newsletter, we only collect your email address.</p>
    <h2>2. Cookies and Analytics</h2>
    <p>We may use cookies to improve user experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
    <h2>3. Disclosure of Information</h2>
    <p>We never sell, rent, or trade your personal information. We may share email addresses with secure, trusted third-party service providers (like Beehiiv or Mailchimp) solely to deliver our newsletters.</p>
    <h2>4. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, you can contact the site administrator.</p>
    <p><a href="/">&larr; Back to Hub</a></p>
</body>
</html>"""

    terms_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Terms of Service & Disclaimer - Aegis Developer Hub</title>
    <link rel="icon" type="image/png" href="/static/logo.png">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body { background: #0b0f19; color: #f3f4f6; font-family: 'Outfit', sans-serif; padding: 40px 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
        h1, h2 { color: #60a5fa; }
        a { color: #3b82f6; text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Terms of Service & Disclaimer</h1>
    <p>Last updated: July 15, 2026</p>
    <h2>1. Agreement to Terms</h2>
    <p>By accessing or using our website and tools, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
    <h2>2. Disclaimer of Warranties</h2>
    <p>The tools, templates, and guides are provided on an "as-is" and "as-available" basis, without any warranties of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
    <h2>3. Financial and Professional Advice Disclaimer</h2>
    <p>The content and tools provided on this website are for general educational and informational purposes only. They do not constitute financial, investment, legal, tax, or professional advice. You should consult with a licensed professional before making any financial decisions.</p>
    <h2>4. Limitation of Liability</h2>
    <p>In no event shall Aegis, its creators, or its agents be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the website or tools.</p>
    <h2>5. Jurisdiction</h2>
    <p>These terms shall be governed and construed in accordance with the laws of New South Wales, Australia, without regard to its conflict of law provisions.</p>
    <p><a href="/">&larr; Back to Hub</a></p>
</body>
</html>"""

    privacy_html = privacy_html.replace("</head>", f"{get_analytics_tag(indent=4)}\n</head>", 1)
    terms_html = terms_html.replace("</head>", f"{get_analytics_tag(indent=4)}\n</head>", 1)

    with open(STATIC_DIR / "privacy.html", "w", encoding="utf-8") as f:
        f.write(privacy_html)
    with open(STATIC_DIR / "terms.html", "w", encoding="utf-8") as f:
        f.write(terms_html)

    print("Master landing page, articles, and compliance pages compiled successfully.")
    
    # 4. Trigger Git Auto-Commit and Push if remote exists
    try:
        remotes = subprocess.check_output(["git", "remote"], stderr=subprocess.DEVNULL).decode().strip()
        if "origin" in remotes:
            print("Git remote origin detected. Initiating commit and push...")
            subprocess.run(["git", "add", "."], check=True)
            # Check if there are changes to commit
            status = subprocess.check_output(["git", "status", "--porcelain"]).decode().strip()
            if status:
                subprocess.run(["git", "commit", "-m", "deploy: compile landing page, sitemaps, and optimized tool iterations"], check=True)
                # Get current branch name
                branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip()
                subprocess.run(["git", "push", "origin", branch], check=True)
                print(f"Successfully pushed updates to origin {branch}.")
            else:
                print("No new changes to commit.")
        else:
            print("No git remote origin configured. Pushing skipped.")
    except Exception as e:
        print(f"Git operations skipped or failed: {e}")

if __name__ == "__main__":
    publish_all()
