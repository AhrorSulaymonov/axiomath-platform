import os
import logging
from jinja2 import Template
from playwright.sync_api import sync_playwright

from src.config import DEFAULT_RESOLUTION, OUTPUT_DIR

logger = logging.getLogger(__name__)

# Premium HTML base template with Outfit font and KaTeX loaded
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Education AI Slide</title>
  <!-- KaTeX for beautiful math formulas -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  
  <!-- Premium Font -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  
  <style>
    /* Responsive design variables */
    :root {
      --title-font-size: 60px;
      --title-text-font-size: 54px;
      --text-font-size: 42px;
      --formula-font-size: 52px;
      --card-padding: 60px 40px;
      --svg-scale: 1.0;
      --footer-font-size: 32px;
      --divider-height: 6px;
      --divider-width: 180px;
    }

    /* Target portrait mode (vertical 9:16) */
    @media (max-width: 800px) or (aspect-ratio: 9/16) {
      :root {
        --title-font-size: 42px;
        --title-text-font-size: 36px;
        --text-font-size: 28px;
        --formula-font-size: 34px;
        --card-padding: 35px 20px;
        --svg-scale: 0.75;
        --footer-font-size: 24px;
        --divider-height: 4px;
        --divider-width: 120px;
      }
      .shape-box svg {
        transform: scale(var(--svg-scale));
        transform-origin: center;
        max-width: 100% !important;
        height: auto !important;
      }
    }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--page-bg);
      background-image: var(--bg-pattern);
      background-size: 50px 50px;
      background-position: 0 0, 25px 25px;
      color: var(--text-color);
      font-family: 'Outfit', sans-serif;
      width: {{ width }}px;
      height: {{ height }}px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    
    /* Theme Variables */
    body.dark {
      --page-bg: #030712;
      --text-color: #f8fafc;
      --card-bg: rgba(255, 255, 255, 0.025);
      --card-border: rgba(255, 255, 255, 0.06);
      --card-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      --formula-bg: rgba(15, 23, 42, 0.55);
      --formula-border: rgba(129, 140, 248, 0.25);
      --bg-pattern: radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0), radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0);
      --text-shadow-val: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    body.light {
      --page-bg: #f8fafc;
      --text-color: #0f172a;
      --card-bg: rgba(255, 255, 255, 0.9);
      --card-border: rgba(0, 0, 0, 0.05);
      --card-shadow: 0 30px 60px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5);
      --formula-bg: rgba(241, 245, 249, 0.8);
      --formula-border: rgba(129, 140, 248, 0.3);
      --bg-pattern: radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0), radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0);
      --text-shadow-val: none;
    }
    
    /* Glowing background orbs */
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.22;
      z-index: 1;
      pointer-events: none;
    }
    
    .orb-1 {
      width: 500px;
      height: 500px;
      background: #6366f1; /* Indigo */
      top: -100px;
      left: -100px;
    }
    
    .orb-2 {
      width: 500px;
      height: 500px;
      background: #db2777; /* Pink */
      bottom: -100px;
      right: -100px;
    }
    
    .orb-3 {
      width: 350px;
      height: 350px;
      background: #06b6d4; /* Cyan */
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.12;
    }
    
    /* Premium glassmorphic container card */
    .main-card {
      width: calc(100% - 40px);
      height: calc(100% - 40px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      z-index: 2;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 40px;
      padding: var(--card-padding);
      backdrop-filter: blur(25px);
      box-shadow: var(--card-shadow);
      position: relative;
    }
    
    .header {
      width: 100%;
      text-align: center;
    }
    
    .title {
      font-size: var(--title-font-size);
      font-weight: 800;
      line-height: 1.25;
      background: linear-gradient(135deg, #38bdf8, #818cf8, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      padding-bottom: 12px;
      letter-spacing: -1px;
    }
    
    .divider {
      height: var(--divider-height);
      width: var(--divider-width);
      background: linear-gradient(to right, #38bdf8, #818cf8, #f472b6);
      margin: 15px auto 0 auto;
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }
    
    .content-area {
      flex-grow: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    
    .text-box {
      font-size: var(--text-font-size);
      font-weight: 600;
      line-height: 1.5;
      color: var(--text-color);
      max-width: 95%;
      margin: 15px 0;
      text-align: center;
      text-shadow: var(--text-shadow-val);
      word-wrap: break-word;
    }
    
    .formula-box {
      font-size: var(--formula-font-size);
      padding: 15px 25px;
      background: var(--formula-bg);
      border-radius: 24px;
      border: 1px solid var(--formula-border);
      box-shadow: 0 10px 40px rgba(99, 102, 241, 0.15), inset 0 0 15px rgba(99, 102, 241, 0.05);
      margin: 15px 0;
      backdrop-filter: blur(5px);
      width: 95%;
      box-sizing: border-box;
      text-align: center;
    }
    
    .shape-box {
      margin: 15px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      filter: drop-shadow(0 15px 30px rgba(99, 102, 241, 0.2));
      width: 100%;
    }
    
    .footer {
      font-size: var(--footer-font-size);
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
  </style>
  <script>
    // Dynamically scale down title font size if it is too long to prevent vertical overflow
    document.addEventListener("DOMContentLoaded", function() {
      const titleEl = document.querySelector(".title");
      if (titleEl) {
        const textLength = titleEl.textContent.trim().length;
        if (textLength > 40) {
          titleEl.style.fontSize = "calc(var(--title-font-size) * 0.70)";
        } else if (textLength > 25) {
          titleEl.style.fontSize = "calc(var(--title-font-size) * 0.85)";
        }
      }
    });
  </script>
</head>
<body class="{{ theme_style }}">
  <!-- Ambient background glow orbs -->
  <div class="glow-orb orb-1"></div>
  <div class="glow-orb orb-2"></div>
  <div class="glow-orb orb-3"></div>
  
  <div class="main-card">
    <div class="header">
      <h1 class="title">{{ title }}</h1>
      <div class="divider"></div>
    </div>
    
    <div class="content-area">
      {% if visual_type == 'title' %}
        {% if text_content %}
          <div class="text-box" style="font-size: var(--title-text-font-size); font-weight: 800; color: var(--text-color); line-height: 1.4; padding: 20px;">
            {% for line in text_content %}
              <p style="margin: 15px 0;">{{ line }}</p>
            {% endfor %}
          </div>
        {% endif %}
        {% if latex_formulas %}
          {% for formula in latex_formulas %}
            <div class="formula-box">
              $${{ formula }}$$
            </div>
          {% endfor %}
        {% endif %}
      {% elif visual_type == 'formula' %}
        {% if latex_formulas %}
          {% for formula in latex_formulas %}
            <div class="formula-box">
              $${{ formula }}$$
            </div>
          {% endfor %}
        {% endif %}
        {% if text_content %}
          <div class="text-box">
            {% for line in text_content %}
              <p style="margin: 10px 0;">{{ line }}</p>
            {% endfor %}
          </div>
        {% endif %}
      {% elif visual_type == 'shape' %}
        <div class="shape-box">
          {{ shape_svg }}
        </div>
        {% if latex_formulas %}
          {% for formula in latex_formulas %}
            <div class="formula-box">
              $${{ formula }}$$
            </div>
          {% endfor %}
        {% endif %}
        {% if text_content %}
          <div class="text-box">
            {% for line in text_content %}
              <p style="margin: 10px 0;">{{ line }}</p>
            {% endfor %}
          </div>
        {% endif %}
      {% else %}
        {% if text_content %}
          <div class="text-box">
            {% for line in text_content %}
              <p style="margin: 10px 0;">{{ line }}</p>
            {% endfor %}
          </div>
        {% endif %}
        {% if latex_formulas %}
          {% for formula in latex_formulas %}
            <div class="formula-box">
              $${{ formula }}$$
            </div>
          {% endfor %}
        {% endif %}
      {% endif %}
    </div>
    
    {% if watermark_enabled %}
    <div class="footer">
      🎓 AiEducation
    </div>
    {% endif %}
  </div>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ]
      });
    });
  </script>
</body>
</html>
"""

class SceneRenderer:
    def __init__(self, resolution=DEFAULT_RESOLUTION, user_config=None):
        self.width, self.height = resolution
        self.user_config = user_config or {}
        self.template = Template(HTML_TEMPLATE)

    def _generate_shape_svg(self, shape_type: str, labels: dict) -> str:
        """ Shakl turiga qarab chiroyli SVG chizadi. """
        if not shape_type:
            return ""
            
        shape_type = shape_type.lower()
        
        if shape_type == "triangle":
            # O'quvchilarga tushunarli uchburchak va tomon qiymatlari
            side_a = labels.get("side_a", labels.get("a", "a"))
            side_b = labels.get("side_b", labels.get("b", "b"))
            side_c = labels.get("side_c", labels.get("c", "c"))
            
            return f"""
            <svg width="450" height="400" viewBox="0 0 450 400" style="margin: 0 auto;">
              <polygon points="225,60 80,340 370,340" fill="rgba(129, 140, 248, 0.05)" stroke="#818cf8" stroke-width="8" stroke-linejoin="round" />
              <!-- Tomonlar qiymatlari -->
              <text x="130" y="200" fill="var(--text-color)" font-size="34" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="600">{side_a}</text>
              <text x="320" y="200" fill="var(--text-color)" font-size="34" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="600">{side_b}</text>
              <text x="225" y="380" fill="var(--text-color)" font-size="34" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="600">{side_c}</text>
              <!-- Uchburchak uchlari -->
              <text x="225" y="30" fill="#38bdf8" font-size="36" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="bold">A</text>
              <text x="50" y="360" fill="#38bdf8" font-size="36" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="bold">B</text>
              <text x="400" y="360" fill="#38bdf8" font-size="36" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="bold">C</text>
            </svg>
            """
            
        elif shape_type == "circle":
            radius = labels.get("radius", labels.get("r", "R"))
            return f"""
            <svg width="400" height="400" viewBox="0 0 400 400" style="margin: 0 auto;">
              <circle cx="200" cy="200" r="140" fill="rgba(129, 140, 248, 0.05)" stroke="#818cf8" stroke-width="8" />
              <!-- Radiusi chizig'i -->
              <line x1="200" y1="200" x2="320" y2="120" stroke="#f43f5e" stroke-width="6" stroke-linecap="round" stroke-dasharray="8 6" />
              <!-- Markaziy nuqta -->
              <circle cx="200" cy="200" r="8" fill="#38bdf8" />
              <text x="180" y="210" fill="#38bdf8" font-size="32" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="bold">O</text>
              <!-- R qiymati -->
              <text x="270" y="140" fill="var(--text-color)" font-size="32" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="600">R = {radius}</text>
            </svg>
            """
            
        elif shape_type in ["rectangle", "square"]:
            side_a = labels.get("side_a", labels.get("a", "a"))
            side_b = labels.get("side_b", labels.get("b", "b"))
            
            return f"""
            <svg width="450" height="350" viewBox="0 0 450 350" style="margin: 0 auto;">
              <rect x="60" y="60" width="330" height="230" rx="20" fill="rgba(129, 140, 248, 0.05)" stroke="#818cf8" stroke-width="8" />
              <!-- Tomonlar qiymatlari -->
              <text x="225" y="40" fill="var(--text-color)" font-size="34" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="600">{side_a}</text>
              <text x="420" y="185" fill="var(--text-color)" font-size="34" font-family="'Outfit', sans-serif" text-anchor="middle" font-weight="600">{side_b}</text>
            </svg>
            """
            
        return ""

    def render_scene(self, scene_data: dict, title: str, output_path: str):
        """
        Sahna JSON ma'lumotlarini HTMLga o'tkazib, Playwright orqali PNG rasm sifatida saqlaydi.
        """
        logger.info(f"Sahna render qilinmoqda -> {output_path}...")
        
        visual_details = scene_data.get("visual_details") or {}
        visual_type = visual_details.get("visual_type", "text")
        
        raw_formulas = visual_details.get("latex_formulas") or []
        raw_text_content = visual_details.get("text_content") or []
        
        latex_formulas = list(raw_formulas)
        text_content = []
        
        # Auto-detect and move LaTeX math leaked into plain text content
        import re
        for item in raw_text_content:
            if item:
                # If it has more than 2 words, it is a text description, not a pure math formula!
                has_multiple_words = len(re.findall(r'[a-zA-Z\'o\'g‘а-яА-ЯёЁ\’\‘]+', item)) > 2 and " " in item
                
                # Check for LaTeX symbols only if it is a short expression (not a full sentence description)
                if ("\\" in item or "^" in item or "π" in item or "•" in item or "*" in item or "=" in item) and not has_multiple_words:
                    latex_formulas.append(item)
                else:
                    text_content.append(item)
        
        shape_svg = visual_details.get("custom_svg")
        if not shape_svg:
            shape_type = visual_details.get("shape_type")
            shape_labels = visual_details.get("shape_labels") or {}
            shape_svg = self._generate_shape_svg(shape_type, shape_labels) if shape_type else ""
        
        # HTML yaratish
        html_content = self.template.render(
            width=self.width,
            height=self.height,
            title=title,
            visual_type=visual_type,
            latex_formulas=latex_formulas,
            text_content=text_content,
            shape_svg=shape_svg,
            theme_style=self.user_config.get("theme_style", "light"),
            watermark_enabled=self.user_config.get("watermark_enabled", True)
        )
        
        # Playwright yordamida screenshot olish
        with sync_playwright() as p:
            # Chromium brauzerini ochamiz
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Viewport hajmini o'rnatamiz
            page.set_viewport_size({"width": self.width, "height": self.height})
            
            # HTML contentni yuklaymiz va CDN resurslari (KaTeX, Shriftlar) to'liq yuklanishini kutamiz
            page.set_content(html_content, wait_until="networkidle")
            
            # Shriftlar to'liq yuklanib tayyor bo'lishini kutamiz
            try:
                page.evaluate("document.fonts.ready")
            except Exception:
                pass
            
            # Qo'shimcha render barqarorligi uchun ozgina kutamiz
            page.wait_for_timeout(200)
            
            # Screenshot olamiz
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            page.screenshot(path=output_path, type="png")
            
            browser.close()
            
        logger.info(f"Sahna muvaffaqiyatli saqlandi: {output_path}")

if __name__ == "__main__":
    # Test render qilish
    logging.basicConfig(level=logging.INFO)
    renderer = SceneRenderer()
    
    test_scene = {
        "scene_number": 1,
        "visual_details": {
            "visual_type": "shape",
            "shape_type": "triangle",
            "shape_labels": {"a": "5", "b": "7", "c": "8"},
            "text_content": ["Uchburchakning berilgan tomonlari: a=5, b=7, c=8"]
        }
    }
    
    try:
        renderer.render_scene(test_scene, "Uchburchak Perometri", "output/test_scene.png")
        print("Test rendering tugadi. Rasm: output/test_scene.png")
    except Exception as e:
        print(f"Xatolik: {e}. Playwright o'rnatilishi va 'playwright install' bajarilishi kutilmoqda.")
