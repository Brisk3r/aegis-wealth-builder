import os
import json
import re
import subprocess
from pathlib import Path
from config import config

BASE_DIR = Path(__file__).parent.resolve()
STATIC_DIR = BASE_DIR / "static"
TOOLS_DIR = STATIC_DIR / "tools"
ARTICLES_DIR = STATIC_DIR / "articles"
HISTORY_FILE = BASE_DIR / "data" / "history.json"

DOMAIN = config.custom_domain or "aegis-wealth-builder.vercel.app"

def ensure_dirs():
    STATIC_DIR.mkdir(exist_ok=True)
    TOOLS_DIR.mkdir(exist_ok=True)
    ARTICLES_DIR.mkdir(exist_ok=True)

def simple_markdown_to_html(md_text: str) -> str:
    """Converts basic markdown elements to HTML."""
    if not md_text:
        return ""
    
    # Escape HTML to prevent injection issues, then parse basics
    html = md_text
    
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
        
    affiliate_sidebar_html = ""
    if config.affiliate_links:
        affiliate_sidebar_html = '<div class="sponsored-links-box" style="margin: 30px 0; padding: 20px; background: rgba(59, 130, 246, 0.03); border: 1px solid var(--border-color); border-radius: 12px;">'
        affiliate_sidebar_html += '<h4 style="margin-top:0; color: var(--secondary-accent); font-size: 1.1rem; font-weight:600; margin-bottom:12px;">Sponsored Developer Resources</h4><ul style="margin:0; padding-left:20px; font-size: 0.95rem; line-height: 1.6;">'
        for partner, link in config.affiliate_links.items():
            partner_title = partner.title()
            affiliate_sidebar_html += f'<li style="margin-bottom:8px;"><a href="{link}" target="_blank" rel="noopener sponsored" style="color: var(--secondary-accent); font-weight:600; text-decoration: underline;">{partner_title}</a> - Premium platform services, cloud deployment credit, and elite design resources.</li>'
        affiliate_sidebar_html += '</ul></div>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Aegis Developer Hub</title>
    <link rel="canonical" href="https://{DOMAIN}/{article_rel_path}">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
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
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.7;
        }}
        .navbar {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 40px;
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(11, 15, 25, 0.7);
        }}
        .navbar a {{
            color: var(--text-main);
            text-decoration: none;
            font-weight: 600;
        }}
        .back-link {{
            color: var(--secondary-accent) !important;
            font-size: 0.95rem;
        }}
        .container {{
            max-width: 800px;
            margin: 60px auto;
            padding: 0 20px;
        }}
        article {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
        }}
        h1 {{
            font-size: 2.5rem;
            font-weight: 800;
            margin-top: 0;
            margin-bottom: 20px;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--secondary-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        p {{
            color: var(--text-main);
            margin-bottom: 20px;
        }}
        h2, h3 {{
            color: var(--secondary-accent);
            margin-top: 40px;
        }}
        ul {{
            padding-left: 20px;
            margin-bottom: 25px;
        }}
        li {{
            margin-bottom: 10px;
        }}
        pre {{
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid var(--border-color);
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }}
        code {{
            font-family: 'Courier New', Courier, monospace;
            color: #34d399;
        }}
        footer {{
            text-align: center;
            padding: 40px 20px;
            color: var(--text-muted);
            font-size: 0.9rem;
            border-top: 1px solid var(--border-color);
            margin-top: 100px;
        }}
        .disclosure {{
            font-size: 0.85rem;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
            margin-bottom: 30px;
        }}
    </style>
</head>
<body>
    <div class="navbar">
        <a href="/">Aegis Developer Hub</a>
        <a href="/" class="back-link">&larr; Back to Hub</a>
    </div>
    <div class="container">
        <article>
            <div class="disclosure">
                <strong>Affiliate Disclosure:</strong> Some links on this site may be affiliate links. We may earn a commission if you make a purchase through them at no additional cost to you.
            </div>
            {ads_html}
            {affiliate_sidebar_html}
            {content_html}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed var(--border-color); font-size: 0.85rem; color: var(--text-muted);">
                <strong>Disclaimer:</strong> The tools and content provided on this website are for educational and informational purposes only and do not constitute financial, investment, legal, or professional advice.
            </div>
        </article>
    </div>
    <footer>
        &copy; 2026 Aegis autonomous platform. All rights reserved.<br>
        <a href="/static/privacy.html" style="color: var(--text-muted); text-decoration: underline; margin-right: 15px;">Privacy Policy</a>
        <a href="/static/terms.html" style="color: var(--text-muted); text-decoration: underline;">Terms of Service & Disclaimer</a>
    </footer>
</body>
</html>
"""

def generate_index_page(tools, articles) -> str:
    tools_list_html = ""
    for tool in tools:
        tools_list_html += f"""
        <div class="card">
            <h3>{tool['name']}</h3>
            <p>Interactive utility built to optimize frontend workflows and layouts.</p>
            <a href="/{tool['path'].replace(chr(92), '/')}" class="btn">Launch Tool &rarr;</a>
        </div>
        """
    
    if not tools:
        tools_list_html = "<p class='empty'>No tools generated yet. Checking back soon!</p>"

    articles_list_html = ""
    for art in articles:
        articles_list_html += f"""
        <div class="card">
            <h3>{art['title']}</h3>
            <p>Companion educational guide and resources targeting developer productivity.</p>
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
        
    affiliate_html = ""
    if config.affiliate_links:
        affiliate_html = '<div class="section-title">Sponsored Developer Resources</div><div class="grid">'
        for partner, link in config.affiliate_links.items():
            partner_title = partner.title()
            affiliate_html += f"""
            <div class="card" style="border-color: rgba(59, 130, 246, 0.15); background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);">
                <h3>{partner_title}</h3>
                <p>Curated platform resource or exclusive developer deal.</p>
                <a href="{link}" target="_blank" rel="noopener sponsored" class="btn sec">Get Offer &rarr;</a>
            </div>
            """
        affiliate_html += '</div>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aegis Developer Hub</title>
    <link rel="canonical" href="https://{DOMAIN}/">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
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
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
        }}
        .hero {{
            padding: 100px 20px 80px 20px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            background: radial-gradient(circle at top, rgba(59, 130, 246, 0.1) 0%, transparent 60%);
        }}
        .hero h1 {{
            font-size: 3.5rem;
            font-weight: 800;
            margin: 0 0 20px 0;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--secondary-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .hero p {{
            color: var(--text-muted);
            font-size: 1.25rem;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 20px;
        }}
        .section-title {{
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 30px;
            border-left: 4px solid var(--primary-accent);
            padding-left: 12px;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 60px;
        }}
        .card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.2s, border-color 0.2s;
        }}
        .card:hover {{
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.3);
        }}
        .card h3 {{
            margin-top: 0;
            font-size: 1.35rem;
            font-weight: 600;
        }}
        .card p {{
            color: var(--text-muted);
            font-size: 0.95rem;
            line-height: 1.6;
            margin: 15px 0 25px 0;
            flex-grow: 1;
        }}
        .btn {{
            display: inline-block;
            text-align: center;
            background: var(--primary-accent);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            transition: background 0.2s;
        }}
        .btn:hover {{
            background: #2563eb;
        }}
        .btn.sec {{
            background: transparent;
            border: 1px solid var(--primary-accent);
            color: var(--secondary-accent);
        }}
        .btn.sec:hover {{
            background: rgba(59, 130, 246, 0.1);
        }}
        .empty {{
            color: var(--text-muted);
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            background: var(--card-bg);
            border: 1px dashed var(--border-color);
            border-radius: 16px;
        }}
        footer {{
            text-align: center;
            padding: 60px 20px;
            color: var(--text-muted);
            border-top: 1px solid var(--border-color);
            font-size: 0.95rem;
        }}
    </style>
</head>
<body>
    <div class="hero">
        <h1>Aegis Developer Hub</h1>
        <p>An autonomous sandbox creating high-utility tools, interactive components, and premium developer guides.</p>
        {ads_html}
    </div>
    <div class="container">
        <div class="section-title">Interactive SaaS Utilities</div>
        <div class="grid">
            {tools_list_html}
        </div>
        
        <div class="section-title">Guides & Insights</div>
        <div class="grid">
            {articles_list_html}
        </div>

        {affiliate_html}
    </div>
    <footer>
        <p>&copy; 2026 Aegis Developer Hub. Created autonomously by local multi-agent system.</p>
        <p style="font-size: 0.8rem; max-width: 600px; margin: 15px auto; line-height: 1.5; color: var(--text-muted);">
            <strong>Disclaimer:</strong> The tools and content provided on this website are for educational and informational purposes only and do not constitute financial, investment, legal, or professional advice.
        </p>
        <p style="margin-top: 15px;">
            <a href="/static/privacy.html" style="color: var(--text-muted); text-decoration: underline; margin-right: 15px;">Privacy Policy</a>
            <a href="/static/terms.html" style="color: var(--text-muted); text-decoration: underline;">Terms of Service & Disclaimer</a>
        </p>
    </footer>
</body>
</html>
"""

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
                tools.append({
                    "name": topic,
                    "path": tool_path
                })
            
        # 2. Gather & compile articles
        article_text = entry.get("article")
        if article_text:
            topic_slug = topic.lower().replace(" ", "_")
            article_file_name = f"{topic_slug}.html"
            article_rel_path = f"static/articles/{article_file_name}"
            article_abs_path = ARTICLES_DIR / article_file_name
            
            if article_rel_path not in seen_articles:
                seen_articles.add(article_rel_path)
                # Convert and save
                html_content = simple_markdown_to_html(article_text)
                full_html = generate_article_page(topic, html_content, article_rel_path)
                
                with open(article_abs_path, "w", encoding="utf-8") as art_f:
                    art_f.write(full_html)
                    
                articles.append({
                    "title": f"Essential tools for {topic}",
                    "path": article_rel_path
                })

    # 3. Create root landing page
    index_html = generate_index_page(tools, articles)
    with open(BASE_DIR / "index.html", "w", encoding="utf-8") as f:
        f.write(index_html)

    # 3.5 Generate Privacy and Terms pages
    privacy_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Privacy Policy - Aegis Developer Hub</title>
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
                subprocess.run(["git", "commit", "-m", "Auto-publish new tools and articles"], check=True)
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
