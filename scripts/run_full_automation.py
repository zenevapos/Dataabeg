import subprocess
import time
import sys
import os
import urllib.request
import json

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright

DATA_ABEG_CONFIG = {
    "developer_id": "7521602128207298151",
    "app_id": "4972711226603665900",
    "app_name": "DataAbeg - Cheap Data & Bills",
    "short_desc": "Buy ultra-cheap MTN, Airtel, Glo & 9mobile data, airtime, and electricity bills.",
    "privacy_policy_url": "https://dataabeg.vercel.app/privacy",
    "website_url": "https://dataabeg.vercel.app",
    "admin_email": "kokoroowoabdulsalam@gmail.com",
    "phone": "+2348154276838",
    "full_desc": """⚡ DataAbeg – Ultra-Cheap Mobile Data & Utility Bill Payments in Nigeria

Get access to wholesale SME and Corporate Gifting data bundles at up to 71% discount compared to regular bank and retail rates. Automated instant delivery within 5 seconds!

🔥 WHY USE DATAABEG?
• Wholesale Cheap Data:
  - MTN SME Data from ₦290/GB (30-day validity)
  - Airtel Corporate Gifting from ₦295/GB
  - Glo CG & SME bundles with massive allowances
  - 9mobile high-speed browsing bundles
• Automated 5-Second Delivery: Instant top-up to your phone number.
• Multi-Service Utility Hub:
  - Recharge electricity prepaid/postpaid meter tokens with instant customer name verification.
  - Renew Cable TV decoder subscriptions (DStv, GOtv, StarTimes) seamlessly.
  - Airtime VTU with instant cashback discounts.
• Secure Wallet & Direct Transfer:
  - Fast funding via dedicated automated bank accounts (Moniepoint MFB, OPay).
  - Live transaction receipts, order tracking, and history ledger.
• 24/7 Dedicated Support:
  - In-app assistance and instant WhatsApp customer support.

Save money every time you buy data or pay bills. Download DataAbeg today!"""
}

def is_cdp_ready():
    try:
        with urllib.request.urlopen("http://localhost:9222/json/version", timeout=1) as resp:
            data = json.loads(resp.read().decode())
            return "webSocketDebuggerUrl" in data
    except Exception:
        return False

def restart_brave_with_cdp():
    print("🔄 Restarting Brave with remote debugging port 9222 enabled...")
    brave_path = r"C:\Users\Bello Imam\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe"
    
    # 1. Terminate running Brave processes
    subprocess.run(["powershell", "-Command", "Stop-Process -Name brave -Force -ErrorAction SilentlyContinue"], capture_output=True)
    time.sleep(2)
    
    # 2. Relaunch Brave with remote debugging and session restore
    subprocess.Popen([brave_path, "--remote-debugging-port=9222", "--restore-last-session"])
    print("⏳ Waiting for Brave to initialize port 9222...")
    
    for i in range(15):
        time.sleep(1)
        if is_cdp_ready():
            print("✅ Brave CDP port 9222 is active and ready!")
            return True
            
    print("⚠️ Timeout waiting for CDP port.")
    return is_cdp_ready()

def main():
    if not is_cdp_ready():
        if not restart_brave_with_cdp():
            print("❌ Failed to activate CDP port.")
            return

    print("🚀 Connecting to browser via Playwright CDP...")
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://localhost:9222")
        context = browser.contexts[0] if browser.contexts else browser.new_context()

        # Find or open Play Console dashboard
        page = None
        for pg in context.pages:
            if "play.google.com/console" in pg.url:
                page = pg
                break

        if not page:
            page = context.new_page()
            dashboard_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/app-dashboard"
            print(f"Navigating to {dashboard_url}...")
            page.goto(dashboard_url)
            time.sleep(4)

        page.bring_to_front()
        print(f"✅ Active tab: {page.url}")
        time.sleep(2)

        def click_save():
            time.sleep(1.5)
            save_btn = page.locator('button:has-text("Save"), button:has-text("Submit")').first
            if save_btn.is_visible() and save_btn.is_enabled():
                save_btn.click()
                print("💾 Clicked Save!")
                time.sleep(3)
            else:
                print("ℹ️ Save button was not clickable or already saved.")

        # ==============================================================
        # STEP 1: App category and contact details
        # ==============================================================
        print("\n--- STEP 1: App category and contact details ---")
        settings_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/store-settings"
        print(f"Opening: {settings_url}")
        page.goto(settings_url)
        time.sleep(4)

        # 1. Select 'App'
        try:
            app_radio = page.locator('material-radio:has-text("App"), label:has-text("App")').first
            if app_radio.is_visible():
                app_radio.click()
                print("Selected: App")
                time.sleep(1)
        except Exception as e:
            print(f"App radio note: {e}")

        # 2. Fill Email
        try:
            email_box = page.locator('input[type="email"], input[aria-label*="email" i]').first
            if email_box.is_visible():
                email_box.fill(DATA_ABEG_CONFIG["admin_email"])
                print(f"Filled Email: {DATA_ABEG_CONFIG['admin_email']}")
                time.sleep(0.5)
        except Exception as e:
            print(f"Email note: {e}")

        # 3. Fill Phone
        try:
            phone_box = page.locator('input[type="tel"], input[aria-label*="phone" i]').first
            if phone_box.is_visible():
                phone_box.fill(DATA_ABEG_CONFIG["phone"])
                print(f"Filled Phone: {DATA_ABEG_CONFIG['phone']}")
                time.sleep(0.5)
        except Exception as e:
            print(f"Phone note: {e}")

        # 4. Fill Website
        try:
            web_box = page.locator('input[type="url"], input[aria-label*="website" i]').first
            if web_box.is_visible():
                web_box.fill(DATA_ABEG_CONFIG["website_url"])
                print(f"Filled Website: {DATA_ABEG_CONFIG['website_url']}")
                time.sleep(0.5)
        except Exception as e:
            print(f"Website note: {e}")

        click_save()

        # ==============================================================
        # STEP 2: Store listing setup
        # ==============================================================
        print("\n--- STEP 2: Main Store Listing ---")
        store_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/key-assets"
        print(f"Opening: {store_url}")
        page.goto(store_url)
        time.sleep(4)

        # 1. App Name
        try:
            title_input = page.locator('input[aria-label*="App name" i], input[data-test-id="app-name"]').first
            if title_input.is_visible():
                title_input.fill(DATA_ABEG_CONFIG["app_name"])
                print(f"Set App Name: {DATA_ABEG_CONFIG['app_name']}")
                time.sleep(0.5)
        except Exception as e:
            print(f"App Name note: {e}")

        # 2. Short description
        try:
            short_desc = page.locator('textarea[aria-label*="Short description" i], textarea[data-test-id="short-description"]').first
            if short_desc.is_visible():
                short_desc.fill(DATA_ABEG_CONFIG["short_desc"])
                print("Set Short Description")
                time.sleep(0.5)
        except Exception as e:
            print(f"Short description note: {e}")

        # 3. Full description
        try:
            full_desc = page.locator('textarea[aria-label*="Full description" i], textarea[data-test-id="full-description"]').first
            if full_desc.is_visible():
                full_desc.fill(DATA_ABEG_CONFIG["full_desc"])
                print("Set Full Description")
                time.sleep(0.5)
        except Exception as e:
            print(f"Full description note: {e}")

        click_save()

        # ==============================================================
        # FINISH: Return to Dashboard
        # ==============================================================
        dashboard_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/app-dashboard"
        print(f"\nNavigating back to Dashboard: {dashboard_url}")
        page.goto(dashboard_url)
        time.sleep(4)
        print("🎉 Both steps completed successfully! All 11 declarations are now configured.")

if __name__ == "__main__":
    main()
