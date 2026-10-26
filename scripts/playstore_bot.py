import sys
import time

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
    "category": "Finance",  # or "Tools"
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

def sleep(seconds):
    time.sleep(seconds)

def run_bot():
    print("🚀 Connecting to running Brave/Chrome browser on port 9222...")
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
        except Exception as e:
            print("❌ Could not connect to browser on port 9222.")
            print(f"Details: {e}")
            print("\n👉 To fix this, close your current Brave window and restart Brave from PowerShell with:")
            print('Stop-Process -Name brave -Force -ErrorAction SilentlyContinue')
            print('& "C:\\Users\\Bello Imam\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --remote-debugging-port=9222')
            return

        context = browser.contexts[0] if browser.contexts else browser.new_context()
        pages = context.pages

        # Find Play Console tab or open one
        page = None
        for pg in pages:
            if "play.google.com/console" in pg.url:
                page = pg
                break

        if not page:
            page = context.new_page()
            dashboard_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/app-dashboard"
            print(f"Opening dashboard: {dashboard_url}")
            page.goto(dashboard_url)

        print(f"✅ Found Play Console tab: {page.url}")
        page.bring_to_front()
        sleep(2)

        def click_save():
            print("💾 Saving step...")
            sleep(1.5)
            save_btn = page.locator('button:has-text("Save"), button:has-text("Submit")').first
            if save_btn.is_visible():
                save_btn.click()
                sleep(2.5)
                print("✅ Saved successfully!")
            else:
                print("ℹ️ Save button not active or not visible.")

        # -------------------------------------------------------------
        # STEP 1: App Category and Contact Details
        # -------------------------------------------------------------
        print("\n📂 Checking 'Select an app category and provide contact details'...")
        try:
            category_link = page.locator('text="Select an app category and provide contact details"').first
            if category_link.is_visible():
                print("Clicking 'Select an app category and provide contact details'...")
                category_link.click()
                sleep(3)
            elif "store-settings" not in page.url:
                settings_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/store-settings"
                print(f"Navigating directly to store settings: {settings_url}")
                page.goto(settings_url)
                sleep(3)

            # In Store Settings, contact details are behind the 'Store listing contact details' Edit button modal
            contact_section = page.locator('text="Store listing contact details"').first
            if contact_section.is_visible():
                print("Found 'Store listing contact details' section...")
            
            # Find and click the Edit button for contact details
            edit_btns = page.locator('button:has-text("Edit")').all()
            if len(edit_btns) >= 2:
                print("Clicking Contact Details 'Edit' button...")
                edit_btns[1].click()
                sleep(2)
            elif len(edit_btns) == 1:
                print("Clicking Edit button...")
                edit_btns[0].click()
                sleep(2)

            # Fill inputs inside the modal
            print(f"Filling contact email: {DATA_ABEG_CONFIG['admin_email']}")
            page.evaluate(f'''() => {{
                const inputs = Array.from(document.querySelectorAll('input'));
                const emailInp = inputs.find(i => i.type === 'email' || (i.getAttribute('aria-label') || '').toLowerCase().includes('email'));
                if (emailInp) {{
                    emailInp.value = "{DATA_ABEG_CONFIG['admin_email']}";
                    emailInp.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    emailInp.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
                const phoneInp = inputs.find(i => i.type === 'tel' || (i.getAttribute('aria-label') || '').toLowerCase().includes('phone'));
                if (phoneInp) {{
                    phoneInp.value = "{DATA_ABEG_CONFIG['phone']}";
                    phoneInp.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    phoneInp.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
                const webInp = inputs.find(i => i.type === 'url' || (i.getAttribute('aria-label') || '').toLowerCase().includes('website'));
                if (webInp) {{
                    webInp.value = "{DATA_ABEG_CONFIG['website_url']}";
                    webInp.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    webInp.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            }}''')
            sleep(1)

            # Click Save inside the modal
            modal_save = page.locator('.modal button:has-text("Save"), material-dialog button:has-text("Save"), button:has-text("Save")').last
            if modal_save.is_visible():
                print("Clicking modal Save button...")
                modal_save.click()
                sleep(3)
                print("✅ Contact details saved!")

            # Go back to dashboard
            dashboard_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/app-dashboard"
            page.goto(dashboard_url)
            sleep(3)
        except Exception as e:
            print(f"Error in Category & Contact Details: {e}")

        # -------------------------------------------------------------
        # STEP 2: Main Store Listing Setup
        # -------------------------------------------------------------
        print("\n📝 Checking 'Set up your store listing'...")
        try:
            store_link = page.locator('text="Set up your store listing", a:has-text("Main store listing")').first
            if store_link.is_visible():
                print("Clicking 'Set up your store listing'...")
                store_link.click()
                sleep(3)
            elif "main-store-listing" not in page.url and "key-assets" not in page.url:
                store_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/key-assets"
                print(f"Navigating directly to store listing: {store_url}")
                page.goto(store_url)
                sleep(3)

            # App Name
            title_input = page.locator('input[aria-label*="App name" i], input[data-test-id="app-name"]').first
            if title_input.is_visible():
                print(f"Setting App Name: {DATA_ABEG_CONFIG['app_name']}")
                title_input.fill(DATA_ABEG_CONFIG["app_name"])
                sleep(0.5)

            # Short Description
            short_desc = page.locator('textarea[aria-label*="Short description" i], textarea[data-test-id="short-description"]').first
            if short_desc.is_visible():
                print("Setting Short Description...")
                short_desc.fill(DATA_ABEG_CONFIG["short_desc"])
                sleep(0.5)

            # Full Description
            full_desc = page.locator('textarea[aria-label*="Full description" i], textarea[data-test-id="full-description"]').first
            if full_desc.is_visible():
                print("Setting Full Description...")
                full_desc.fill(DATA_ABEG_CONFIG["full_desc"])
                sleep(0.5)

            click_save()
            sleep(2)

            # Return to dashboard to see updated progress
            dashboard_url = f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/app/{DATA_ABEG_CONFIG['app_id']}/app-dashboard"
            page.goto(dashboard_url)
            sleep(3)
            print("🎉 Automation routine completed! You can now check your dashboard for 11 of 11 complete!")
        except Exception as e:
            print(f"Error in Store Listing: {e}")

if __name__ == "__main__":
    run_bot()
