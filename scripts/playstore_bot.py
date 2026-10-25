import time
from playwright.sync_api import sync_playwright

DATA_ABEG_CONFIG = {
    "developer_id": "7521602128207298151",
    "app_name": "DataAbeg - Cheap Data & Bills",
    "short_desc": "Buy ultra-cheap MTN, Airtel, Glo & 9mobile data, airtime, and electricity bills.",
    "privacy_policy_url": "https://dataabeg.vercel.app/privacy",
    "website_url": "https://dataabeg.vercel.app",
    "admin_email": "kokoroowoabdulsalam@gmail.com",
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
    print("🚀 Connecting to running Chrome browser on port 9222...")
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
        except Exception as e:
            print("❌ Could not connect to Chrome on port 9222.")
            print(f"Details: {e}")
            print("\n👉 To fix this, close all Chrome background processes and restart Chrome with:")
            print('& "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222')
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
            page.goto(f"https://play.google.com/console/u/1/developers/{DATA_ABEG_CONFIG['developer_id']}/home")

        print(f"✅ Found Play Console tab: {page.url}")
        page.bring_to_front()
        sleep(2)

        # 1. Click DataAbeg in app list if on home page
        print("📱 Looking for DataAbeg in the app list...")
        try:
            app_link = page.locator("text=DataAbeg").first
            if app_link.is_visible():
                app_link.click()
                sleep(3)
        except Exception:
            pass

        print(f"📍 Current URL: {page.url}")

        def click_save():
            print("💾 Saving step...")
            sleep(1.5)
            save_btn = page.locator('button:has-text("Save"), button:has-text("Submit")').first
            if save_btn.is_visible():
                save_btn.click()
                sleep(2.5)

        # 2. Privacy Policy
        print("🔒 Checking Privacy Policy...")
        try:
            privacy_link = page.locator('a:has-text("Privacy policy"), button:has-text("Set privacy policy")').first
            if privacy_link.is_visible():
                privacy_link.click()
                sleep(2)
                url_input = page.locator('input[type="url"], input[aria-label*="Privacy"]').first
                if url_input.is_visible():
                    url_input.fill(DATA_ABEG_CONFIG["privacy_policy_url"])
                    click_save()
                page.go_back()
                sleep(2)
        except Exception as e:
            print(f"Privacy policy step skipped: {e}")

        # 3. App Access
        print("🔑 Checking App Access...")
        try:
            access_link = page.locator('a:has-text("App access"), button:has-text("App access")').first
            if access_link.is_visible():
                access_link.click()
                sleep(2)
                radio_all = page.locator('material-radio:has-text("All functionality"), input[type="radio"]').first
                if radio_all.is_visible():
                    radio_all.click()
                    click_save()
                page.go_back()
                sleep(2)
        except Exception as e:
            print(f"App access step skipped: {e}")

        # 4. Ads
        print("📢 Checking Ads Declaration...")
        try:
            ads_link = page.locator('a:has-text("Ads"), button:has-text("Set ads")').first
            if ads_link.is_visible():
                ads_link.click()
                sleep(2)
                radio_no_ads = page.locator('material-radio:has-text("No"), label:has-text("No")').first
                if radio_no_ads.is_visible():
                    radio_no_ads.click()
                    click_save()
                page.go_back()
                sleep(2)
        except Exception as e:
            print(f"Ads step skipped: {e}")

        # 5. Content Rating
        print("🎯 Checking Content Rating questionnaire...")
        try:
            rating_link = page.locator('a:has-text("Content rating"), button:has-text("Start questionnaire")').first
            if rating_link.is_visible():
                rating_link.click()
                sleep(2.5)
                email_box = page.locator('input[type="email"], input[aria-label*="Email"]').first
                if email_box.is_visible():
                    email_box.fill(DATA_ABEG_CONFIG["admin_email"])
                    cat_radio = page.locator('material-radio:has-text("Utility"), label:has-text("Utility")').first
                    if cat_radio.is_visible():
                        cat_radio.click()
                    next_btn = page.locator('button:has-text("Next")').first
                    if next_btn.is_visible():
                        next_btn.click()
                    sleep(2)

                    no_radios = page.locator('material-radio:has-text("No"), label:has-text("No")')
                    for i in range(no_radios.count()):
                        no_radios.nth(i).click()
                        sleep(0.15)
                    click_save()
        except Exception as e:
            print(f"Content rating step skipped: {e}")

        # 6. Target Audience
        print("👥 Checking Target Audience...")
        try:
            target_link = page.locator('a:has-text("Target audience")').first
            if target_link.is_visible():
                target_link.click()
                sleep(2)
                age_18 = page.locator('material-checkbox:has-text("18 and over"), label:has-text("18 and over")').first
                if age_18.is_visible():
                    age_18.click()
                next_btn = page.locator('button:has-text("Next")').first
                if next_btn.is_visible():
                    next_btn.click()
                sleep(1.5)
                appeal_no = page.locator('material-radio:has-text("No"), label:has-text("No")').first
                if appeal_no.is_visible():
                    appeal_no.click()
                click_save()
                page.go_back()
                sleep(2)
        except Exception as e:
            print(f"Target audience step skipped: {e}")

        # 7. News Apps
        print("📰 Checking News App declaration...")
        try:
            news_link = page.locator('a:has-text("News apps")').first
            if news_link.is_visible():
                news_link.click()
                sleep(2)
                no_news = page.locator('material-radio:has-text("No"), label:has-text("No")').first
                if no_news.is_visible():
                    no_news.click()
                click_save()
                page.go_back()
                sleep(2)
        except Exception as e:
            print(f"News app step skipped: {e}")

        # 8. Main Store Listing
        print("📝 Checking Main Store Listing...")
        try:
            store_link = page.locator('a:has-text("Main store listing")').first
            if store_link.is_visible():
                store_link.click()
                sleep(2.5)

                title_input = page.locator('input[aria-label*="App name"]').first
                if title_input.is_visible():
                    title_input.fill(DATA_ABEG_CONFIG["app_name"])

                short_desc = page.locator('textarea[aria-label*="Short description"]').first
                if short_desc.is_visible():
                    short_desc.fill(DATA_ABEG_CONFIG["short_desc"])

                full_desc = page.locator('textarea[aria-label*="Full description"]').first
                if full_desc.is_visible():
                    full_desc.fill(DATA_ABEG_CONFIG["full_desc"])

                click_save()
        except Exception as e:
            print(f"Store listing step skipped: {e}")

        print("🎉 Finished executing automation bot!")

if __name__ == "__main__":
    run_bot()
