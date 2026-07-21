import re
from bs4 import BeautifulSoup

def validate_html(code: str, original_title: str = None) -> list:
    """
    Validates HTML and checks against workspace constraints.
    Returns a list of error/warning strings.
    """
    errors = []
    try:
        soup = BeautifulSoup(code, 'html.parser')
    except Exception as e:
        return [f"HTML parsing failed: {e}"]
        
    # Check for basic tags
    if not soup.find('html'):
        errors.append("Missing <html> tag.")
    if not soup.find('head'):
        errors.append("Missing <head> tag.")
    if not soup.find('body'):
        errors.append("Missing <body> tag.")
    
    # Check Body Flex Squeeze Guard (Rule 2 & 4 in tool_improver_guide.md)
    body = soup.find('body')
    if body:
        style = body.get('style', '')
        cls = body.get('class', [])
        if isinstance(cls, list):
            cls = ' '.join(cls)
        else:
            cls = str(cls)
        
        # Check for flex layout centering on body
        has_flex = 'display: flex' in style or 'flex' in cls
        has_center = ('align-items: center' in style or 'items-center' in cls) and ('justify-content: center' in style or 'justify-center' in cls)
        has_full_height = 'height: 100vh' in style or 'h-screen' in cls or 'min-h-screen' in cls
        
        # Squeeze guard fails if all three are on the body
        if has_flex and has_center and has_full_height:
            errors.append(
                "Violation: Centering flex layout applied directly to the <body> tag (Body Flex Squeeze Guard). "
                "This will break the sticky navigation bar layout. Use a wrapper container (e.g. <main> or <div>) inside the body instead."
            )
            
    # Check Title preservation
    title_tag = soup.find('title')
    if not title_tag:
        errors.append("Missing <title> tag.")
    elif original_title and title_tag.text.strip().lower() != original_title.strip().lower():
        errors.append(f"Violation: Title was changed from '{original_title}' to '{title_tag.text.strip()}'. Keep the original title.")
        
    # Check Navbar preservation
    navbar = soup.find(class_='navbar') or soup.find(style=lambda s: s and 'position: sticky' in s and 'z-index: 100' in s)
    if not navbar or 'Aegis Developer Hub' not in navbar.text:
        errors.append("Violation: Injected navbar with 'Aegis Developer Hub' branding was removed or modified. Keep the original navbar intact.")
        
    # Check Footer preservation
    footer = soup.find('footer')
    if not footer or 'Australian Privacy Principles' not in footer.text:
        errors.append("Violation: Footer containing Australian Privacy Principles disclaimer or privacy policy links was removed or modified. Keep the original footer intact.")

    # Check for alert() call in JavaScript
    for script in soup.find_all('script'):
        if script.string:
            if 'alert(' in script.string:
                errors.append("Violation: The JavaScript code contains 'alert()' calls. Use visual toast/notifications instead.")
                
    return errors
