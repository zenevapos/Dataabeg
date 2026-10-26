import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright

output_dir = os.path.abspath("public")

html_icon = """<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 512px;
    height: 512px;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .icon-container {
    width: 440px;
    height: 440px;
    border-radius: 96px;
    background: linear-gradient(145deg, #1E40AF 0%, #2563EB 50%, #0284C7 100%);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 2px solid rgba(56, 189, 248, 0.4);
  }
  svg {
    width: 320px;
    height: 320px;
    filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.35));
  }
</style>
</head>
<body>
  <div class="icon-container">
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="60%" stop-color="#60A5FA" />
          <stop offset="100%" stop-color="#FFFFFF" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Radiating Data Connectivity Waves -->
      <path d="M72 32 C84 38, 92 50, 92 64 C92 78, 84 90, 72 96" stroke="#93C5FD" stroke-width="5" stroke-linecap="round" opacity="0.6" />
      <path d="M64 42 C72 47, 78 55, 78 64 C78 73, 72 81, 64 86" stroke="#BAE6FD" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />
      <!-- Lightning Bolt -->
      <path d="M62 20 L36 62 L54 62 L48 100 L76 54 L58 54 Z" fill="url(#boltGrad)" filter="url(#glow)" />
      <!-- Pulse dots -->
      <circle cx="82" cy="30" r="3.5" fill="#38BDF8" />
      <circle cx="94" cy="46" r="4" fill="#60A5FA" />
      <circle cx="96" cy="64" r="4.5" fill="#93C5FD" />
    </svg>
  </div>
</body>
</html>
"""

html_banner = """<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
  body {
    width: 1024px;
    height: 500px;
    background: radial-gradient(circle at 80% 20%, #1e3a8a 0%, #0f172a 70%, #020617 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 70px;
    overflow: hidden;
    position: relative;
  }
  .bg-glow {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(37, 99, 235, 0) 70%);
    top: 50px;
    right: 80px;
    filter: blur(40px);
  }
  .content {
    max-width: 580px;
    z-index: 2;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(37, 99, 235, 0.2);
    border: 1px solid rgba(56, 189, 248, 0.4);
    padding: 6px 14px;
    border-radius: 9999px;
    color: #38bdf8;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  h1 {
    font-size: 52px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 14px;
    letter-spacing: -1px;
  }
  h1 span {
    background: linear-gradient(90deg, #38BDF8 0%, #60A5FA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    font-size: 20px;
    color: #94a3b8;
    line-height: 1.4;
    margin-bottom: 28px;
  }
  .features {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pill {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 8px 16px;
    border-radius: 12px;
    color: #f1f5f9;
    font-size: 14px;
    font-weight: 600;
  }
  .visual {
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-card {
    width: 240px;
    height: 240px;
    border-radius: 56px;
    background: linear-gradient(145deg, #1E40AF 0%, #2563EB 50%, #0284C7 100%);
    box-shadow: 0 25px 60px -15px rgba(2, 132, 199, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(56, 189, 248, 0.5);
  }
  .logo-card svg {
    width: 170px;
    height: 170px;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="content">
    <div class="badge">⚡ Instant 5-Sec Automated Top-Up</div>
    <h1>DataAbeg <span>Nigeria</span></h1>
    <p>Wholesale Cheap SME Data, Airtime & Utility Bills at up to 71% off regular rates.</p>
    <div class="features">
      <div class="pill">📶 MTN SME ₦290/GB</div>
      <div class="pill">🌐 Airtel & Glo CG</div>
      <div class="pill">💡 Electricity & TV</div>
      <div class="pill">🔒 Fast Wallet Funding</div>
    </div>
  </div>
  <div class="visual">
    <div class="logo-card">
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="boltGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="60%" stop-color="#60A5FA" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>
          <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path d="M72 32 C84 38, 92 50, 92 64 C92 78, 84 90, 72 96" stroke="#93C5FD" stroke-width="5" stroke-linecap="round" opacity="0.6" />
        <path d="M64 42 C72 47, 78 55, 78 64 C78 73, 72 81, 64 86" stroke="#BAE6FD" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />
        <path d="M62 20 L36 62 L54 62 L48 100 L76 54 L58 54 Z" fill="url(#boltGrad2)" filter="url(#glow2)" />
        <circle cx="82" cy="30" r="3.5" fill="#38BDF8" />
        <circle cx="94" cy="46" r="4" fill="#60A5FA" />
        <circle cx="96" cy="64" r="4.5" fill="#93C5FD" />
      </svg>
    </div>
  </div>
</body>
</html>
"""

def generate():
    icon_path = os.path.join(output_dir, "playstore-icon-512.png")
    banner_path = os.path.join(output_dir, "playstore-feature-graphic-1024x500.png")
    
    with sync_playwright() as p:
        brave_exe = r"C:\Users\Bello Imam\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe"
        browser = p.chromium.launch(executable_path=brave_exe, headless=True)
        
        # 1. Generate 512x512 Icon
        page_icon = browser.new_page(viewport={"width": 512, "height": 512})
        page_icon.set_content(html_icon)
        page_icon.wait_for_load_state("networkidle")
        page_icon.screenshot(path=icon_path)
        print(f"✅ Generated App Icon: {icon_path}")
        
        # 2. Generate 1024x500 Feature Graphic
        page_banner = browser.new_page(viewport={"width": 1024, "height": 500})
        page_banner.set_content(html_banner)
        page_banner.wait_for_load_state("networkidle")
        page_banner.screenshot(path=banner_path)
        print(f"✅ Generated Feature Graphic: {banner_path}")
        
        browser.close()

if __name__ == "__main__":
    generate()
