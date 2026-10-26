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

# Common mobile frame style: 1080 x 1920 px
def get_screen_html(title, subtitle, body_content):
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #090d16;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 60px 50px;
  }}
  .header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 40px;
    border-bottom: 2px solid rgba(255,255,255,0.08);
  }}
  .brand {{
    display: flex;
    align-items: center;
    gap: 20px;
  }}
  .logo-box {{
    width: 70px;
    height: 70px;
    border-radius: 20px;
    background: linear-gradient(135deg, #2563EB, #0284C7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
  }}
  .brand-text {{
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }}
  .brand-text span {{ color: #38BDF8; }}
  .badge {{
    background: rgba(37,99,235,0.25);
    border: 2px solid #38BDF8;
    color: #38BDF8;
    padding: 10px 24px;
    border-radius: 999px;
    font-size: 22px;
    font-weight: 700;
  }}
  .hero-tag {{
    margin-top: 50px;
    margin-bottom: 30px;
    text-align: center;
  }}
  .hero-tag h1 {{
    font-size: 62px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 15px;
    background: linear-gradient(90deg, #FFFFFF, #93C5FD);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .hero-tag p {{
    font-size: 28px;
    color: #94A3B8;
  }}
  .card {{
    background: #111827;
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 36px;
    padding: 40px;
    margin-top: 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }}
  .card-title {{
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
  }}
  .grid-item {{
    background: rgba(255,255,255,0.05);
    border: 2px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }}
  .item-name {{ font-size: 26px; font-weight: 700; color: #E2E8F0; }}
  .item-price {{ font-size: 34px; font-weight: 800; color: #38BDF8; }}
  .item-sub {{ font-size: 20px; color: #94A3B8; }}
  .balance-card {{
    background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #0284C7 100%);
    border-radius: 36px;
    padding: 45px;
    margin-top: 30px;
  }}
  .bal-label {{ font-size: 24px; opacity: 0.85; margin-bottom: 10px; }}
  .bal-amt {{ font-size: 64px; font-weight: 800; letter-spacing: -1px; }}
  .bal-row {{ display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; }}
  .bal-btn {{
    background: #FFFFFF;
    color: #1E3A8A;
    font-size: 24px;
    font-weight: 800;
    padding: 16px 36px;
    border-radius: 20px;
  }}
</style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo-box">⚡</div>
      <div class="brand-text">Data<span>Abeg</span></div>
    </div>
    <div class="badge">🇳🇬 Nigeria #1 VTU</div>
  </div>
  <div class="hero-tag">
    <h1>{title}</h1>
    <p>{subtitle}</p>
  </div>
  {body_content}
</body>
</html>
"""

def generate_screenshots():
    brave_exe = r"C:\Users\Bello Imam\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe"
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=brave_exe, headless=True)
        
        # Screen 1: Dashboard & Wallet
        s1_html = get_screen_html(
            "Instant Automated Top-Up",
            "Wholesale SME mobile data delivered within 5 seconds",
            """
            <div class="balance-card">
              <div class="bal-label">Available Wallet Balance</div>
              <div class="bal-amt">₦48,500.00</div>
              <div class="bal-row">
                <div style="font-size:22px;opacity:0.9;">Virtual Account: Moniepoint MFB</div>
                <div class="bal-btn">+ Fund Wallet</div>
              </div>
            </div>
            <div class="card">
              <div class="card-title"><span>⚡ Quick Services</span></div>
              <div class="grid">
                <div class="grid-item"><div class="item-name">📶 Buy SME Data</div><div class="item-sub">MTN, Airtel, Glo, 9mobile</div></div>
                <div class="grid-item"><div class="item-name">📞 Airtime VTU</div><div class="item-sub">Instant 3% Cashback</div></div>
                <div class="grid-item"><div class="item-name">💡 Electricity</div><div class="item-sub">Instant Token Pin</div></div>
                <div class="grid-item"><div class="item-name">📺 Cable TV</div><div class="item-sub">DStv, GOtv, StarTimes</div></div>
              </div>
            </div>
            """
        )
        p1 = browser.new_page(viewport={"width": 1080, "height": 1920})
        p1.set_content(s1_html)
        p1.screenshot(path=os.path.join(output_dir, "playstore-screenshot-1.png"))
        print("✅ Screenshot 1 generated!")

        # Screen 2: Data Bundles
        s2_html = get_screen_html(
            "Cheapest Data Rates",
            "Up to 71% cheaper than banking apps & USSD codes",
            """
            <div class="card">
              <div class="card-title">
                <span>🔥 MTN SME & Corporate Gifting</span>
                <span style="font-size:22px;color:#38BDF8;">30 Days Validity</span>
              </div>
              <div class="grid">
                <div class="grid-item">
                  <div class="item-name">MTN SME 1.0 GB</div>
                  <div class="item-price">₦290</div>
                  <div class="item-sub">Instant 5-sec Delivery</div>
                </div>
                <div class="grid-item">
                  <div class="item-name">MTN SME 2.0 GB</div>
                  <div class="item-price">₦580</div>
                  <div class="item-sub">Instant 5-sec Delivery</div>
                </div>
                <div class="grid-item">
                  <div class="item-name">MTN SME 5.0 GB</div>
                  <div class="item-price">₦1,450</div>
                  <div class="item-sub">Instant 5-sec Delivery</div>
                </div>
                <div class="grid-item">
                  <div class="item-name">MTN SME 10.0 GB</div>
                  <div class="item-price">₦2,900</div>
                  <div class="item-sub">Instant 5-sec Delivery</div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-title"><span>🌐 Airtel & Glo Corporate</span></div>
              <div class="grid">
                <div class="grid-item">
                  <div class="item-name">Airtel CG 1.0 GB</div>
                  <div class="item-price">₦295</div>
                  <div class="item-sub">Instant Top-up</div>
                </div>
                <div class="grid-item">
                  <div class="item-name">Glo CG 1.0 GB</div>
                  <div class="item-price">₦275</div>
                  <div class="item-sub">Instant Top-up</div>
                </div>
              </div>
            </div>
            """
        )
        p2 = browser.new_page(viewport={"width": 1080, "height": 1920})
        p2.set_content(s2_html)
        p2.screenshot(path=os.path.join(output_dir, "playstore-screenshot-2.png"))
        print("✅ Screenshot 2 generated!")

        # Screen 3: Electricity & Cable TV
        s3_html = get_screen_html(
            "Utility Bills & Electricity",
            "Zero convenience fee on prepaid token recharges",
            """
            <div class="card">
              <div class="card-title"><span>💡 Supported Electricity DisCos</span></div>
              <div class="grid">
                <div class="grid-item"><div class="item-name">IKEDC</div><div class="item-sub">Ikeja Electric (Pre/Post)</div></div>
                <div class="grid-item"><div class="item-name">EKEDC</div><div class="item-sub">Eko Electric</div></div>
                <div class="grid-item"><div class="item-name">AEDC</div><div class="item-sub">Abuja Electric</div></div>
                <div class="grid-item"><div class="item-name">IBEDC</div><div class="item-sub">Ibadan Electric</div></div>
              </div>
            </div>
            <div class="card">
              <div class="card-title"><span>📺 Cable TV Decoders</span></div>
              <div class="grid">
                <div class="grid-item"><div class="item-name">DStv</div><div class="item-sub">All packages with auto-activate</div></div>
                <div class="grid-item"><div class="item-name">GOtv</div><div class="item-sub">Jolli, Max, Supa & Plus</div></div>
                <div class="grid-item"><div class="item-name">StarTimes</div><div class="item-sub">Nova, Basic, Classic, Super</div></div>
                <div class="grid-item"><div class="item-name">Showmax</div><div class="item-sub">Mobile & Pro Vouchers</div></div>
              </div>
            </div>
            """
        )
        p3 = browser.new_page(viewport={"width": 1080, "height": 1920})
        p3.set_content(s3_html)
        p3.screenshot(path=os.path.join(output_dir, "playstore-screenshot-3.png"))
        print("✅ Screenshot 3 generated!")

        browser.close()

if __name__ == "__main__":
    generate_screenshots()
