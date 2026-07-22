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
    "UUID NanoID and Snowflake Generator": "Generate UUID v4, NanoID, and Snowflake IDs with configurable lengths, bulk generation, and one-click copy to clipboard.",
    "HEIC Photo Converter": "Convert HEIC, HEIF, PNG, WebP, BMP, and TIFF photos to JPG or PNG instantly in-browser. Set quality, target file size, and bulk-download a ZIP — 100% private, no uploads.",
    "Task Tracker": "Client-side Task Tracker with local browser history session sync, customizable task lanes, and privacy-first local storage persistence.",
    "SEO Card Optimizer": "Build and preview OpenGraph cards, Twitter preview cards, and Google SERP snippets with 1200x630 PNG canvas downloads.",
    "SVG File Compressor and Optimizer": "Minify SVG vectors, strip Inkscape bloat and comments, round path float values, and export clean markup.",
    "HTTP Header Inspector": "Probe HTTP response headers, audit security policies (CSP, HSTS, X-Frame-Options), and copy cURL commands.",
    "Lorem Ipsum Generator": "Generate industry-tailored placeholder text (SaaS, Fintech, E-commerce, Medical, Legal) for UI wireframes.",
    "Git Command Cheat Sheet": "Interactive scenario wizard to resolve botched git merges, submodule syncs, uncommitted undos, and rebase conflicts.",
    "Responsive Breakpoint Tester": "Test web application layouts against common device viewports (Mobile, Tablet, Desktop) and copy CSS @media queries.",
    "Timestamp and Epoch Converter": "Convert Unix epoch seconds and milliseconds to ISO 8601 timestamps with live epoch ticker and dev code snippets.",
    "Password Strength Checker": "Calculate password entropy bits, estimate brute-force cracking resistance, and generate cryptographically secure passwords.",
    "UTM Campaign Parameter Builder": "Build clean, standardized campaign tracking URLs with automatic lowercase slugification and UTM parameter sanitation.",
    "Markdown Table Generator": "Convert raw CSV spreadsheets or tab-delimited text into clean, formatted Markdown tables.",
    "QR Code Generator": "Generate high-resolution QR codes for website URLs, contact cards, or text payloads with PNG image downloads.",
    "ROAS Break-Even Calculator": "Calculate break-even Return on Ad Spend (ROAS), unit gross margin percentages, and max Customer Acquisition Cost (CAC).",
    "Daily Marketing Consistency Timer": "Sprint focus timer for daily marketing outreach, social posting consistency, and developer log tracking."
}

AFFILIATE_DESCRIPTIONS = {
    "digitalocean": "Deploy your next web application or backend cloud. Get a $200 free trial credit.",
    "vercel": "Instantly deploy static frontends and serverless API endpoints. The default home of React & Next.js.",
    "hosting": "Get high-performance web hosting, free custom domains, and automated sitemaps for your portfolio or blogs.",
}

def get_affiliate_html() -> str:
    links = config.affiliate_links
    if not links:
        return ""
    
    # Filter out placeholders
    active_links = {}
    for key, url in links.items():
        if url and "your-tag" not in url and "your-real-tag" not in url and "example.com" not in url:
            active_links[key] = url
            
    if not active_links:
        return ""
    
    html = '<div class="affiliate-section" style="margin: 40px auto; max-width: 1200px; padding: 0 20px; box-sizing: border-box; font-family: \'Outfit\', sans-serif;">'
    html += '<h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted, #94a3b8); margin-bottom: 20px; font-weight: 700;">Sponsored Developer Resources</h3>'
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">'
    
    for key, url in active_links.items():
        name = key.capitalize()
        if key == "digitalocean":
            name = "DigitalOcean"
        elif key == "vercel":
            name = "Vercel"
        elif key == "hosting":
            name = "Hostinger"
        
        desc = AFFILIATE_DESCRIPTIONS.get(key, "High-performance developer services and infrastructure.")
        
        html += f"""
        <div style="background: var(--card-bg, rgba(17, 24, 39, 0.55)); border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05)); border-radius: 16px; padding: 20px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s;">
            <div>
                <h4 style="color: var(--secondary-accent, #60a5fa); font-size: 1.1rem; margin: 0 0 10px 0; font-weight: 600;">{name}</h4>
                <p style="color: var(--text-muted, #94a3b8); font-size: 0.875rem; margin: 0 0 15px 0; line-height: 1.5; font-weight: 300;">{desc}</p>
            </div>
            <a href="{url}" target="_blank" rel="noopener sponsored" style="color: #ffffff; background: linear-gradient(135deg, var(--primary-accent, #3b82f6), #4f46e5); text-decoration: none; padding: 10px 16px; border-radius: 8px; font-size: 0.875rem; text-align: center; font-weight: 500; transition: opacity 0.2s;">Get Started &rarr;</a>
        </div>
        """
    
    html += '</div></div>'
    return html

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
    if config.google_adsense_client and config.google_adsense_slot:
        ads_html = f"""
        <div class="adsense-wrapper" style="margin: 20px auto 30px auto; max-width: 728px; min-height: 90px; text-align: center; overflow: hidden; display: flex; justify-content: center; align-items: center;">
            <ins class="adsbygoogle"
                 style="display:inline-block;width:728px;height:90px"
                 data-ad-client="{config.google_adsense_client}"
                 data-ad-slot="{config.google_adsense_slot}"
                 data-ad-format="horizontal"
                 data-full-width-responsive="false"></ins>
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
        {get_affiliate_html()}
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
    if any(x in topic_lower for x in ["flex", "color", "wheel", "card", "svg", "breakpoint", "screenshot", "snippet", "shadow", "gradient", "css", "favicon"]):
        return "ui"
    elif any(x in topic_lower for x in ["cron", "dns", "ssl", "webhook", "openapi", "http", "header", "url", "parameter", "utm", "query", "task", "tracker"]):
        return "devops"
    elif any(x in topic_lower for x in ["json", "yaml", "sql", "typescript", "csv", "diff", "markdown", "table", "formatter", "parser", "entity"]):
        return "data"
    return "security"

def get_category_for_article(title: str) -> str:
    title_lower = title.lower()
    if any(x in title_lower for x in ["flexbox", "color", "wheel", "card", "svg", "breakpoint", "screenshot", "snippet", "shadow", "gradient", "css", "favicon"]):
        return "ui"
    elif any(x in title_lower for x in ["cron", "dns", "ssl", "webhook", "openapi", "http", "header", "url", "parameter", "utm", "query", "task", "tracker"]):
        return "devops"
    elif any(x in title_lower for x in ["json", "yaml", "sql", "typescript", "csv", "diff", "markdown", "table", "formatter", "parser", "entity"]):
        return "data"
    return "security"

def generate_index_page(tools, articles) -> str:
    featured_tool_names = [
        "Task Tracker",
        "SaaS UI Boilerplate Exporter", 
        "LegalRedact.io", 
        "Visual Color Wheel & Palette Generator", 
        "Interactive SVG Path Editor", 
        "DevWorkspace", 
        "JSON Studio", 
        "StyleLab", 
        "BrandKit", 
        "OmniCode", 
        "Universal HEIC & Photo Converter & Compressor"
    ]
    
    # 1. Build Featured Spotlight
    featured_html = ""
    for tool in tools:
        if tool['name'] in featured_tool_names:
            cat = get_category_for_tool(tool['name'])
            featured_html += f"""
            <div class="card featured-card" data-category="{cat}" style="border-color: rgba(59, 130, 246, 0.2); background: rgba(17, 24, 39, 0.7); box-shadow: 0 10px 30px rgba(59, 130, 246, 0.08);">
                <div class="card-header">
                    <span class="badge" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15)); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);">Featured Spotlight</span>
                </div>
                <h3>{tool['name']}</h3>
                <p>{tool['description']}</p>
                <a href="/{tool['path'].replace(chr(92), '/')}" class="btn" style="background: linear-gradient(135deg, #3b82f6, #6366f1); border: none;">Launch Utility &rarr;</a>
            </div>
            """
            
    if not featured_html:
        featured_html = "<p class='empty'>No featured utilities spotlighted yet.</p>"

    # 2. Build Regular Tools list
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

    # 3. Build Articles list
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
    if config.google_adsense_client and config.google_adsense_slot:
        ads_html = f"""
        <div class="adsense-wrapper" style="margin: 30px auto 20px auto; max-width: 728px; min-height: 90px; text-align: center; overflow: hidden; display: flex; justify-content: center; align-items: center;">
            <ins class="adsbygoogle"
                 style="display:inline-block;width:728px;height:90px"
                 data-ad-client="{config.google_adsense_client}"
                 data-ad-slot="{config.google_adsense_slot}"
                 data-ad-format="horizontal"
                 data-full-width-responsive="false"></ins>
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
    <title>Aegis Developer Hub | Privacy-First In-Browser Studio & Developer Utilities</title>
    <meta name="description" content="Access 34+ free, privacy-first developer utilities, SaaS UI builders, vector editors, and security inspectors. 100% in-browser memory execution — zero telemetry.">
    <meta property="og:title" content="Aegis Developer Hub | Privacy-First Developer Studio">
    <meta property="og:description" content="34+ free in-browser developer utilities, UI design sandboxes, vector minifiers, and security inspectors. 100% local memory processing.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://{DOMAIN}/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Aegis Developer Hub">
    <meta name="twitter:description" content="Free, privacy-first in-browser developer tools & UI sandboxes with zero remote data collection.">
    <link rel="icon" type="image/png" href="/static/logo.png">
    <link rel="canonical" href="https://{DOMAIN}/">{adsense_tag}
    <script defer src="/_vercel/insights/script.js"></script>
    <script src="/static/js/aegis-pro.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Structured JSON-LD Metadata -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@graph": [
        {{
          "@type": "WebSite",
          "@id": "https://{DOMAIN}/#website",
          "url": "https://{DOMAIN}/",
          "name": "Aegis Developer Hub",
          "description": "Privacy-first in-browser developer utilities and UI builders."
        }},
        {{
          "@type": "SoftwareApplication",
          "name": "Aegis Developer Hub Suite",
          "operatingSystem": "All modern web browsers",
          "applicationCategory": "DeveloperApplication",
          "offers": {{
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          }}
        }},
        {{
          "@type": "FAQPage",
          "mainEntity": [
            {{
              "@type": "Question",
              "name": "Are my documents, files, or sensitive payloads uploaded to remote servers?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "No. 100% of calculation, PDF rendering, image compression, and RegEx processing occurs locally inside your browser session. Zero bytes are uploaded to remote servers."
              }}
            }},
            {{
              "@type": "Question",
              "name": "Can I use generated Tailwind UI cards, SVG vectors, and code snippets in commercial applications?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "Yes! All code generators, Tailwind UI card exports, and vector files produced by Aegis Developer Hub are 100% royalty-free under MIT License."
              }}
            }},
            {{
              "@type": "Question",
              "name": "How does local browser history work for the Aegis Task Tracker?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "The Task Tracker leverages HTML5 LocalStorage and IndexedDB within your browser session, with optional JSON import/export backup features."
              }}
            }},
            {{
              "@type": "Question",
              "name": "What monetization or membership features are included in the Pro tier?",
              "acceptedAnswer": {{
                "@type": "Answer",
                "text": "Aegis Hub offers a Free Core Tier forever for individuals, plus optional Pro Membership for cloud sync & API proxies, and Enterprise licenses for self-hosted Docker deployments."
              }}
            }}
          ]
        }}
      ]
    }}
    </script>

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
        
        /* Sticky Top Bar */
        .top-nav {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 40px;
            border-bottom: 1px solid var(--border-color);
            background: rgba(8, 11, 17, 0.85);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
        }}
        .top-nav-logo {{
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: #ffffff;
            font-weight: 700;
            font-size: 1.1rem;
        }}
        .nav-links {{
            display: flex;
            align-items: center;
            gap: 25px;
        }}
        .nav-links a {{
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
        }}
        .nav-links a:hover {{
            color: #ffffff;
        }}
        .top-cta {{
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: #ffffff !important;
            padding: 8px 18px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.85rem;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }}

        .hero {{
            padding: 80px 20px 50px 20px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            background: linear-gradient(rgba(8, 11, 17, 0.88), rgba(8, 11, 17, 0.98)), url('/static/hero_banner.png') no-repeat center center;
            background-size: cover;
            position: relative;
        }}
        .hero-pill {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 99px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .hero h1 {{
            font-size: 3.4rem;
            font-weight: 800;
            margin: 0 0 16px 0;
            background: linear-gradient(135deg, #ffffff 30%, #60a5fa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1.2px;
            line-height: 1.15;
        }}
        .hero p {{
            color: var(--text-muted);
            font-size: 1.15rem;
            max-width: 720px;
            margin: 0 auto 30px auto;
            line-height: 1.6;
            font-weight: 300;
        }}
        .hero-actions {{
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 40px;
        }}
        .hero-stats-bar {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: rgba(17, 24, 39, 0.45);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            backdrop-filter: blur(12px);
        }}
        .stat-item {{
            text-align: center;
        }}
        .stat-number {{
            font-size: 1.5rem;
            font-weight: 800;
            color: #60a5fa;
        }}
        .stat-label {{
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
            margin-top: 4px;
        }}

        .controls-panel {{
            display: flex;
            flex-direction: column;
            gap: 15px;
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
        
        .dashboard-layout {{
            display: flex;
            flex-direction: column;
            gap: 20px;
        }}
        .sidebar-nav {{
            display: none;
        }}
        .mobile-filter-tabs {{
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 8px;
            scrollbar-width: none;
            width: 100%;
        }}
        .mobile-filter-tabs::-webkit-scrollbar {{
            display: none;
        }}
        
        @media (min-width: 1024px) {{
            .dashboard-layout {{
                flex-direction: row;
                gap: 40px;
            }}
            .sidebar-nav {{
                display: flex !important;
                width: 280px;
                flex-shrink: 0;
                position: sticky;
                top: 100px;
                height: fit-content;
                flex-direction: column;
                gap: 8px;
            }}
            .mobile-filter-tabs {{
                display: none !important;
            }}
        }}
        
        .sidebar-nav .filter-btn {{
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-muted);
            padding: 12px 18px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: 'Outfit', sans-serif;
            font-weight: 500;
        }}
        .sidebar-nav .filter-btn:hover {{
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.05);
        }}
        .sidebar-nav .filter-btn.active {{
            color: #ffffff;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            font-weight: 600;
        }}
        .count-badge {{
            font-size: 0.75rem;
            background: rgba(255, 255, 255, 0.08);
            color: var(--text-muted);
            padding: 2px 8px;
            border-radius: 99px;
            font-weight: 500;
        }}
        .sidebar-nav .filter-btn.active .count-badge {{
            background: var(--primary-accent);
            color: #ffffff;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }}
        
        .mobile-filter-tabs .filter-btn {{
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            padding: 8px 16px;
            border-radius: 10px;
            font-family: 'Outfit', sans-serif;
            font-weight: 500;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.25s;
            white-space: nowrap;
            backdrop-filter: blur(8px);
        }}
        .mobile-filter-tabs .filter-btn:hover {{
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.05);
        }}
        .mobile-filter-tabs .filter-btn.active {{
            color: #ffffff;
            background: linear-gradient(135deg, var(--primary-accent), #4f46e5);
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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
            font-size: 1.5rem;
            font-weight: 800;
            margin-top: 0;
            margin-bottom: 20px;
            border-left: 4px solid var(--primary-accent);
            padding-left: 12px;
            letter-spacing: -0.5px;
            transition: opacity 0.3s;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
            gap: 24px;
            margin-bottom: 50px;
            transition: opacity 0.3s;
        }}
        .card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 24px;
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
            transform: translateY(-4px) scale(1.005);
            border-color: rgba(59, 130, 246, 0.25);
            box-shadow: 0 12px 30px rgba(59, 130, 246, 0.12);
        }}
        .card:hover::before {{
            opacity: 1;
        }}
        .card-header {{
            margin-bottom: 12px;
        }}
        .badge {{
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            padding: 3px 8px;
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
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.3;
        }}
        .card p {{
            color: var(--text-muted);
            font-size: 0.92rem;
            line-height: 1.5;
            margin: 10px 0 20px 0;
            flex-grow: 1;
        }}
        .btn {{
            display: inline-block;
            text-align: center;
            background: var(--primary-accent);
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.2s;
            border: 1px solid transparent;
        }}
        .btn:hover {{
            background: #2563eb;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }}
        .btn.sec {{
            background: transparent;
            border: 1px solid rgba(59, 130, 246, 0.4);
            color: var(--secondary-accent);
        }}
        .btn.sec:hover {{
            background: rgba(59, 130, 246, 0.08);
            border-color: var(--primary-accent);
        }}

        /* Monetization & Pricing Section */
        .pricing-section {{
            margin: 70px auto 40px auto;
            max-width: 1200px;
            padding: 0 20px;
            box-sizing: border-box;
        }}
        .pricing-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 28px;
            margin-top: 30px;
        }}
        .pricing-card {{
            background: rgba(17, 24, 39, 0.65);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 32px;
            backdrop-filter: blur(16px);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            transition: all 0.3s;
        }}
        .pricing-card.popular {{
            border-color: rgba(59, 130, 246, 0.4);
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
            background: linear-gradient(180deg, rgba(30, 58, 138, 0.25) 0%, rgba(17, 24, 39, 0.65) 100%);
        }}
        .pricing-card:hover {{
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.3);
        }}
        .price-val {{
            font-size: 2.5rem;
            font-weight: 800;
            color: #ffffff;
            margin: 15px 0 5px 0;
        }}
        .pricing-features {{
            list-style: none;
            padding: 0;
            margin: 20px 0 30px 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }}
        .pricing-features li {{
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        /* FAQ Section */
        .faq-section {{
            margin: 60px auto;
            max-width: 900px;
            padding: 0 20px;
        }}
        details {{
            background: rgba(17, 24, 39, 0.5);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            margin-bottom: 12px;
            padding: 16px 20px;
            backdrop-filter: blur(8px);
        }}
        summary {{
            font-weight: 600;
            cursor: pointer;
            color: #ffffff;
            outline: none;
        }}
        details p {{
            color: var(--text-muted);
            font-size: 0.92rem;
            line-height: 1.6;
            margin-top: 12px;
            margin-bottom: 0;
        }}

        .empty {{
            color: var(--text-muted);
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            background: var(--card-bg);
            border: 1px dashed var(--border-color);
            border-radius: 16px;
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

    <!-- Sticky Navigation Bar -->
    <header class="top-nav">
        <a href="/" class="top-nav-logo">
            <img src="/static/logo.png" alt="Aegis Hub Logo" style="height: 30px;">
            <span>Aegis Developer Hub</span>
            <span style="font-size: 0.7rem; background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 2px 8px; border-radius: 99px; border: 1px solid rgba(59, 130, 246, 0.3);">34 Online</span>
        </a>

        <nav class="nav-links">
            <a href="#utilities">All Tools</a>
            <a href="#pricing">Membership</a>
            <a href="#faq">FAQ</a>
            <a href="#utilities" class="top-cta">Launch Studio &rarr;</a>
        </nav>
    </header>

    <!-- Hero Section -->
    <div class="hero">
        <div class="hero-pill">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399;" class="animate-pulse"></span>
            100% In-Browser Memory Execution | Zero Remote Telemetry
        </div>
        <h1>The Privacy-First Developer Hub & Studio</h1>
        <p>Access 34+ high-fidelity web utilities, SaaS UI builders, vector editors, and security inspectors. 100% client-side memory execution — no tracking, no registration, zero server data collection.</p>
        
        <div class="hero-actions">
            <a href="#utilities" class="btn" style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 12px 28px; font-size: 1rem; border-radius: 12px;">Explore All Tools (34) &rarr;</a>
            <a href="#pricing" class="btn sec" style="padding: 12px 24px; font-size: 1rem; border-radius: 12px;">View Pro & Enterprise Tiers</a>
        </div>

        <div class="hero-stats-bar">
            <div class="stat-item">
                <div class="stat-number">34+</div>
                <div class="stat-label">In-Browser Tools</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">100%</div>
                <div class="stat-label">Local Storage Sync</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0 KB</div>
                <div class="stat-label">Data Sent to Server</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0 ms</div>
                <div class="stat-label">Network Latency</div>
            </div>
        </div>
    </div>
    
    {ads_html}
    
    <div class="controls-panel" id="utilities">
        <div class="search-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" id="search-input" placeholder="Search 34+ sandbox utilities, guides, and tools..." autocomplete="off">
        </div>
        <div class="mobile-filter-tabs">
            <button class="filter-btn active" data-filter="all">All Utilities</button>
            <button class="filter-btn" data-filter="ui">Design & UI</button>
            <button class="filter-btn" data-filter="devops">DevOps/API</button>
            <button class="filter-btn" data-filter="data">Data/Code</button>
            <button class="filter-btn" data-filter="security">Security/Utils</button>
            <button class="filter-btn" data-filter="articles">Guides</button>
        </div>
    </div>
    
    <div class="container">
        <div class="dashboard-layout">
            <aside class="sidebar-nav">
                <div class="sidebar-title" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 8px;">Toolboxes</div>
                <button class="filter-btn active" data-filter="all">
                    <span>All Utilities</span>
                    <span class="count-badge" id="count-all">0</span>
                </button>
                <button class="filter-btn" data-filter="ui">
                    <span>Design & UI Lab</span>
                    <span class="count-badge" id="count-ui">0</span>
                </button>
                <button class="filter-btn" data-filter="devops">
                    <span>DevOps & API Studio</span>
                    <span class="count-badge" id="count-devops">0</span>
                </button>
                <button class="filter-btn" data-filter="data">
                    <span>Code & Data Workspace</span>
                    <span class="count-badge" id="count-data">0</span>
                </button>
                <button class="filter-btn" data-filter="security">
                    <span>Security & Utilities</span>
                    <span class="count-badge" id="count-security">0</span>
                </button>
                
                <div class="sidebar-title" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 8px;">Guides</div>
                <button class="filter-btn" data-filter="articles">
                    <span>Companion Guides</span>
                    <span class="count-badge" id="count-articles">0</span>
                </button>
            </aside>
            
            <div class="main-content">
                <!-- Featured Section Spotlight -->
                <div class="featured-section" id="featured-section" style="margin-bottom: 45px;">
                    <div class="section-title" style="font-size: 1.4rem; display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                        <span style="display: inline-block; width: 6px; height: 22px; background: linear-gradient(to bottom, #3b82f6, #6366f1); border-radius: 3px;"></span>
                        Featured Spotlight
                    </div>
                    <div class="grid" id="featured-grid" style="margin-bottom: 0;">
                        {featured_html}
                    </div>
                </div>
                
                <!-- Main Tools Section -->
                <div id="tools-section">
                    <div class="section-title" id="tools-title" style="font-size: 1.4rem; display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 6px; height: 22px; background: linear-gradient(to bottom, #3b82f6, #10b981); border-radius: 3px;"></span>
                        SaaS Utilities & Toolboxes
                    </div>
                    <div class="grid" id="tools-grid">
                        {tools_list_html}
                    </div>
                </div>
                
                <!-- Articles Section -->
                <div id="articles-section">
                    <div class="section-title" id="articles-title" style="font-size: 1.4rem; display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-block; width: 6px; height: 22px; background: linear-gradient(to bottom, #8b5cf6, #ec4899); border-radius: 3px;"></span>
                        Companion Guides & Insights
                    </div>
                    <div class="grid" id="articles-grid">
                        {articles_list_html}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Monetization & Membership Tiers Section -->
    <section class="pricing-section" id="pricing">
        <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; padding: 4px 14px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 99px; font-size: 0.75rem; font-weight: 700; color: #60a5fa; text-transform: uppercase; margin-bottom: 10px;">Membership & Commercial Licensing</div>
            <h2 style="font-size: 2.2rem; font-weight: 800; margin: 0 0 10px 0; background: linear-gradient(135deg, #ffffff, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Monetization & Developer Tiers</h2>
            <p style="color: var(--text-muted); font-size: 1rem; max-width: 600px; margin: 0 auto;">Free forever core browser utilities for individual developers, with optional Pro Membership and Enterprise self-hosted deployments.</p>
        </div>

        <div class="pricing-grid">
            <!-- Free Plan -->
            <div class="pricing-card">
                <div>
                    <span style="font-size: 0.75rem; font-weight: 700; color: #60a5fa; text-transform: uppercase;">Community Tier</span>
                    <h3 style="font-size: 1.4rem; margin: 8px 0 0 0;">Free Forever</h3>
                    <div class="price-val">$0</div>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0 0 20px 0;">100% free open-core access to all browser utilities.</p>

                    <ul class="pricing-features">
                        <li><span style="color: #34d399;">✓</span> Access to all 34 browser utilities</li>
                        <li><span style="color: #34d399;">✓</span> 100% client-side memory execution</li>
                        <li><span style="color: #34d399;">✓</span> Local Storage session sync</li>
                        <li><span style="color: #34d399;">✓</span> Unlimited `.png`, `.svg`, `.json` exports</li>
                    </ul>
                </div>
                <a href="#utilities" class="btn sec" style="width: 100%; box-sizing: border-box;">Start Using Free &rarr;</a>
            </div>

            <!-- Pro Plan -->
            <div class="pricing-card popular">
                <div style="position: absolute; top: -12px; right: 24px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 99px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">MOST POPULAR</div>
                <div>
                    <span style="font-size: 0.75rem; font-weight: 700; color: #60a5fa; text-transform: uppercase;">Pro Membership</span>
                    <h3 style="font-size: 1.4rem; margin: 8px 0 0 0;">Power Developer</h3>
                    <div class="price-val">$9 <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 400;">/ month</span></div>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0 0 20px 0;">Cross-device cloud sync and advanced developer proxies.</p>

                    <ul class="pricing-features">
                        <li><span style="color: #34d399;">✓</span> Everything in Free Tier</li>
                        <li><span style="color: #34d399;">✓</span> Cloud sync for Task Tracker & presets</li>
                        <li><span style="color: #34d399;">✓</span> Remove Aegis branding on exported cards</li>
                        <li><span style="color: #34d399;">✓</span> High-priority DNS-over-HTTPS queries</li>
                        <li><span style="color: #34d399;">✓</span> Bulk PDF OCR & batch webhook relays</li>
                    </ul>
                </div>
                <button onclick="AegisPro.openModal()" class="btn" style="width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #3b82f6, #6366f1); border: none; cursor: pointer;">Upgrade to Pro Membership &rarr;</button>
            </div>

            <!-- Enterprise Plan -->
            <div class="pricing-card">
                <div>
                    <span style="font-size: 0.75rem; font-weight: 700; color: #a78bfa; text-transform: uppercase;">Enterprise Tier</span>
                    <h3 style="font-size: 1.4rem; margin: 8px 0 0 0;">Self-Hosted Team</h3>
                    <div class="price-val">$29 <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 400;">/ user / mo</span></div>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0 0 20px 0;">Dedicated Docker container deployment behind corporate firewall.</p>

                    <ul class="pricing-features">
                        <li><span style="color: #34d399;">✓</span> Everything in Pro Tier</li>
                        <li><span style="color: #34d399;">✓</span> Private Docker image for self-hosting</li>
                        <li><span style="color: #34d399;">✓</span> Single Sign-On (SSO / SAML / Okta)</li>
                        <li><span style="color: #34d399;">✓</span> Audit logging & team workspace sharing</li>
                    </ul>
                </div>
                <a href="/README_DOCKER.md" target="_blank" class="btn sec" style="width: 100%; box-sizing: border-box;">View Enterprise Docker Guide &rarr;</a>
            </div>
        </div>
    </section>

    <!-- SEO FAQ Section -->
    <section class="faq-section" id="faq">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">Frequently Asked Questions</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Empirical answers regarding privacy, data execution, and commercial usage.</p>
        </div>

        <details>
            <summary>Are my documents, files, or sensitive payloads uploaded to remote servers?</summary>
            <p>No. 100% of calculation, PDF rendering, image compression, and RegEx processing occurs locally inside your browser session. Zero bytes leave your machine.</p>
        </details>

        <details>
            <summary>Can I use generated Tailwind UI cards, SVG vectors, and code snippets in commercial applications?</summary>
            <p>Yes! All code generators, Tailwind UI card exports, and vector files produced by Aegis Developer Hub are 100% royalty-free under the MIT License.</p>
        </details>

        <details>
            <summary>How does local browser session history work for the Aegis Task Tracker?</summary>
            <p>The Task Tracker leverages HTML5 LocalStorage and IndexedDB within your browser session, with optional JSON import/export backup features.</p>
        </details>

        <details>
            <summary>What monetization or membership features are included in the Pro tier?</summary>
            <p>Aegis Hub offers a Free Core Tier forever for individuals, plus optional Pro Membership for cloud sync & API proxies, and Enterprise licenses for self-hosted Docker deployments.</p>
        </details>
    </section>
    
    {get_affiliate_html()}
    
    <footer>
        <p>&copy; 2026 Aegis Developer Hub. All rights reserved.</p>
        <p style="font-size: 0.85rem; max-width: 600px; margin: 15px auto; line-height: 1.5; color: var(--text-muted);">
            <strong>Disclaimer:</strong> The tools and content provided on this website are for educational and informational purposes only and do not constitute financial, investment, legal, or professional advice. Conforms to Australian Privacy Principles (APPs) and GDPR rules.
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
            
            const toolsSection = document.getElementById('tools-section');
            const articlesSection = document.getElementById('articles-section');
            const featuredSection = document.getElementById('featured-section');
            
            // Client-side Spotlight Shuffling
            const featuredGrid = document.getElementById('featured-grid');
            if (featuredGrid) {{
                const fCards = Array.from(featuredGrid.querySelectorAll('.featured-card'));
                for (let i = fCards.length - 1; i > 0; i--) {{
                    const j = Math.floor(Math.random() * (i + 1));
                    [fCards[i], fCards[j]] = [fCards[j], fCards[i]];
                }}
                featuredGrid.innerHTML = '';
                fCards.slice(0, 3).forEach(c => featuredGrid.appendChild(c));
            }}
            
            const toolsGrid = document.getElementById('tools-grid');
            const articlesGrid = document.getElementById('articles-grid');
            
            // Create empty state messages dynamically if they do not exist
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
            
            // Calculate counts dynamically on load
            const counts = {{
                all: 0,
                ui: 0,
                devops: 0,
                data: 0,
                security: 0,
                articles: 0
            }};
            
            cards.forEach(card => {{
                if (card.classList.contains('featured-card')) {{
                    return; // skip counting featured duplicate cards
                }}
                const cat = card.getAttribute('data-category');
                const isTool = card.querySelector('.badge-tool') !== null;
                
                if (isTool) {{
                    counts[cat] = (counts[cat] || 0) + 1;
                    counts.all++;
                }} else {{
                    counts.articles++;
                }}
            }});
            
            // Set count numbers in Sidebar
            const countAllEl = document.getElementById('count-all');
            const countUiEl = document.getElementById('count-ui');
            const countDevopsEl = document.getElementById('count-devops');
            const countDataEl = document.getElementById('count-data');
            const countSecurityEl = document.getElementById('count-security');
            const countArticlesEl = document.getElementById('count-articles');
            
            if (countAllEl) countAllEl.textContent = counts.all;
            if (countUiEl) countUiEl.textContent = counts.ui;
            if (countDevopsEl) countDevopsEl.textContent = counts.devops;
            if (countDataEl) countDataEl.textContent = counts.data;
            if (countSecurityEl) countSecurityEl.textContent = counts.security;
            if (countArticlesEl) countArticlesEl.textContent = counts.articles;
            
            let activeFilter = 'all';
            let searchQuery = '';
            
            function filterItems() {{
                let visibleTools = 0;
                let visibleArticles = 0;
                
                // Hide or show featured spotlight
                if (activeFilter === 'all' && searchQuery === '') {{
                    featuredSection.style.display = 'block';
                }} else {{
                    featuredSection.style.display = 'none';
                }}
                
                cards.forEach(card => {{
                    if (card.classList.contains('featured-card')) {{
                        // Spotlight cards are handled by outer display
                        return;
                    }}
                    
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    const desc = card.querySelector('p').textContent.toLowerCase();
                    const cat = card.getAttribute('data-category');
                    const isTool = card.querySelector('.badge-tool') !== null;
                    
                    const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);
                    
                    let matchesCategory = false;
                    if (isTool) {{
                        matchesCategory = (activeFilter === 'all' || cat === activeFilter);
                    }} else {{
                        matchesCategory = (activeFilter === 'articles');
                    }}
                    
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
                
                // Toggle entire sections visibility
                if (activeFilter === 'articles') {{
                    toolsSection.style.display = 'none';
                    articlesSection.style.display = 'block';
                }} else if (activeFilter !== 'all' && activeFilter !== 'articles') {{
                    toolsSection.style.display = 'block';
                    articlesSection.style.display = 'none';
                }} else {{
                    toolsSection.style.display = 'block';
                    articlesSection.style.display = 'block';
                }}
                
                emptyTools.style.display = (visibleTools === 0 && toolsSection.style.display !== 'none') ? 'block' : 'none';
                emptyArticles.style.display = (visibleArticles === 0 && articlesSection.style.display !== 'none') ? 'block' : 'none';
            }}
            
            searchInput.addEventListener('input', (e) => {{
                searchQuery = e.target.value.toLowerCase().trim();
                filterItems();
            }});
            
            filterBtns.forEach(btn => {{
                btn.addEventListener('click', () => {{
                    const filterVal = btn.getAttribute('data-filter');
                    
                    // Update active button classes on both mobile and sidebar lists
                    filterBtns.forEach(b => {{
                        if (b.getAttribute('data-filter') === filterVal) {{
                            b.classList.add('active');
                        }} else {{
                            b.classList.remove('active');
                        }}
                    }});
                    
                    activeFilter = filterVal;
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

    # 0.5 Inject accessibility styles for dark theme inputs
    accessibility_style = """
    <style>
        /* Global accessibility & dark theme input fixes */
        input[type="text"], input[type="url"], input[type="number"], input[type="email"], input[type="password"], input[type="date"], select, textarea {
            color: #f8fafc !important;
        }
        input::placeholder, textarea::placeholder {
            color: #64748b !important;
            opacity: 0.8 !important;
        }
    </style>
    """
    if "/* Global accessibility & dark theme input fixes */" not in html and "</head>" in html:
        html = html.replace("</head>", f"{accessibility_style}\n</head>", 1)
        modified = True

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

    # 2. Inject standard Navbar right after <body> if not present
    if 'class="navbar"' not in html and 'Aegis Hub Logo' not in html:
        navbar_html = """
    <div class="navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(11, 15, 25, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; font-family: 'Outfit', sans-serif;">
        <a href="/" style="display: flex; align-items: center; gap: 10px; color: #f3f4f6; text-decoration: none; font-weight: 600;">
            <img src="/static/logo.png" alt="Aegis Hub Logo" style="height: 30px;">
            <span>Aegis Developer Hub</span>
        </a>
        <a href="/" style="color: #60a5fa; text-decoration: none; font-size: 0.95rem; font-weight: 500;">&larr; Back to Hub</a>
    </div>
    """
        if "<body>" in html:
            html = html.replace("<body>", f"<body>\n{navbar_html}", 1)
            modified = True
        elif "<body" in html:
            match = re.search(r"<body[^>]*>", html)
            if match:
                body_tag = match.group(0)
                html = html.replace(body_tag, f"{body_tag}\n{navbar_html}", 1)
                modified = True

    # Inject standard Footer right before </body> IF not already present
    if "<footer" not in html and "Aegis Developer Hub. All rights reserved" not in html:
        aff_html = get_affiliate_html()
        aff_wrapper = ""
        if aff_html and "tool-affiliate-wrapper" not in html:
            aff_wrapper = f"""
    <div class="tool-affiliate-wrapper" style="max-width: 1200px; margin: 40px auto; padding: 0 20px; box-sizing: border-box;">
        {aff_html}
    </div>"""

        footer_html = f"""{aff_wrapper}
    <footer style="text-align: center; padding: 60px 20px; color: #9ca3af; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem; background: rgba(8, 11, 17, 0.4); font-family: 'Outfit', sans-serif; margin-top: 60px;">
        <p>&copy; 2026 Aegis Developer Hub. All rights reserved.</p>
        <p style="font-size: 0.85rem; max-width: 800px; margin: 15px auto; line-height: 1.5; color: #9ca3af;">
            <strong>Disclaimer:</strong> The tools and content provided on this website are for educational and informational purposes only and do not constitute financial, investment, legal, or professional advice. Conforms to Australian Privacy Principles (APPs) under the Privacy Act 1988, GDPR rules on data protection, and ASIC regulatory guidelines.
        </p>
        <p style="margin-top: 20px;">
            <a href="/static/privacy.html" style="color: #9ca3af; text-decoration: underline; margin-right: 15px;">Privacy Policy</a>
            <a href="/static/terms.html" style="color: #9ca3af; text-decoration: underline;">Terms of Service & Disclaimer</a>
        </p>
    </footer>
    """
        
        if "</body>" in html:
            html = html.replace("</body>", f"{footer_html}\n</body>", 1)
            modified = True

    # 3. Inject default Outfit Font & basic styles only if the tool has no built-in styling system
    if "fonts.googleapis.com/css2?family=Outfit" not in html and "</head>" in html:
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
    
    tools = []
    articles = []
    seen_tools = set()
    seen_articles = set()
    
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
                
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
        except Exception as he:
            print(f"Error loading or parsing history: {he}")

    # 3. Scan directories for any missing tools and articles
    if TOOLS_DIR.exists():
        for f in TOOLS_DIR.glob("*.html"):
            if f.name == "_tool.html":
                continue
            tool_rel_path = f"static/tools/{f.name}"
            norm_rel_path = tool_rel_path.replace("\\", "/")
            seen_normalized = {p.replace("\\", "/") for p in seen_tools}
            if norm_rel_path not in seen_normalized:
                seen_tools.add(tool_rel_path)
                try:
                    with open(f, "r", encoding="utf-8") as tf:
                        tf_content = tf.read()
                    
                    title = f.name.replace("_tool.html", "").replace("_", " ").title()
                    # Try to match in TOOL_DESCRIPTIONS case-insensitively
                    matched_topic = None
                    for key in TOOL_DESCRIPTIONS:
                        if key.lower().replace(" ", "").replace("_", "") == title.lower().replace(" ", "").replace("_", ""):
                            matched_topic = key
                            break
                    
                    if matched_topic:
                        topic = matched_topic
                        desc = TOOL_DESCRIPTIONS[matched_topic]
                    else:
                        title_match = re.search(r"<title>(.*?)</title>", tf_content, re.IGNORECASE)
                        if title_match:
                            raw_title = title_match.group(1).strip()
                            topic = re.split(r"\s+[\-|–|—]\s+", raw_title)[0].strip()
                        else:
                            topic = title
                        
                        desc_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', tf_content, re.IGNORECASE)
                        if desc_match:
                            desc = desc_match.group(1).strip()
                        else:
                            desc = "Interactive utility built to optimize frontend workflows and layouts."
                    
                    post_process_tool(f, topic)
                    tools.append({
                        "name": topic,
                        "path": tool_rel_path,
                        "description": desc
                    })
                except Exception as e:
                    print(f"Error auto-discovering tool {f.name}: {e}")
                    
    # Scan articles
    if ARTICLES_DIR.exists():
        for f in ARTICLES_DIR.glob("*.html"):
            if f.name.startswith("."):
                continue
            art_rel_path = f"static/articles/{f.name}"
            norm_rel_path = art_rel_path.replace("\\", "/")
            seen_normalized = {p.replace("\\", "/") for p in seen_articles}
            if norm_rel_path not in seen_normalized:
                seen_articles.add(art_rel_path)
                try:
                    with open(f, "r", encoding="utf-8") as af:
                        af_content = af.read()
                    
                    title_match = re.search(r"<h1>(.*?)</h1>", af_content, re.IGNORECASE)
                    if not title_match:
                        title_match = re.search(r"<title>(.*?)</title>", af_content, re.IGNORECASE)
                    
                    if title_match:
                        title = re.sub(r"<[^>]*>", "", title_match.group(1)).strip()
                        title = re.split(r"\s+[\-|–|—]\s+", title)[0].strip()
                    else:
                        title = f.name.replace(".html", "").replace("_", " ").title()
                        
                    desc_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', af_content, re.IGNORECASE)
                    if desc_match:
                        description = desc_match.group(1).strip()
                    else:
                        description = "Read our companion educational guide and resources targeting developer productivity."
                        
                    articles.append({
                        "title": title,
                        "path": art_rel_path,
                        "description": description
                    })
                except Exception as e:
                    print(f"Error auto-discovering article {f.name}: {e}")

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
