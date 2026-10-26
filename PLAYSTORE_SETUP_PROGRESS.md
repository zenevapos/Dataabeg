# 🚀 DataAbeg - Google Play Console Setup & Progress Tracker

> **App ID:** `4972711226603665900`  
> **Developer Account:** `7521602128207298151` (Bimex Group)  
> **Current Dashboard Status:** **9 / 11 Complete** *(App Category successfully set to Finance!)*  
> **Target:** 11 / 11 Complete $\rightarrow$ Production / Testing Release  
> **Master Handover Guide:** [`GOOGLE_PLAY_HANDOVER.md`](file:///c:/Users/Bello%20Imam/Documents/DataAbeg/GOOGLE_PLAY_HANDOVER.md)  
> **Last Updated:** October 25, 2026

---

## 📊 1. Progress Checklist

### ✅ Completed Tasks (9 of 11)
- [x] **Set privacy policy:** Linked to `https://dataabeg.vercel.app/privacy`
- [x] **Sign-in details (App access):** All functionality declared available without restriction
- [x] **Ads declaration:** Declared as containing no ads
- [x] **Content rating (IARC):** Utility questionnaire completed and certified
- [x] **Target audience:** Configured for 18 and over, no appeal to children
- [x] **Data safety:** Declarations verified and approved
- [x] **Government apps:** Declared as not a government entity
- [x] **Financial features:** Successfully declared & submitted
- [x] **Health declaration:** Declared not providing health services

---

### ⏳ Remaining Tasks for Tomorrow (2 of 11)

#### 1. Select an App Category & Provide Contact Details
- **Direct Console URL:** [Store Settings](https://play.google.com/console/u/1/developers/7521602128207298151/app/4972711226603665900/store-settings)
- **Status:**
  - ✅ **App Category:** Successfully set to **App $\rightarrow$ Finance** and saved to Google's cloud servers!
  - ⏳ **Contact Details:** Click the **Edit** button under *Store listing contact details* and fill:
    - **Email address:** `kokoroowoabdulsalam@gmail.com`
    - **Phone number:** `+2348154276838`
    - **Website:** `https://dataabeg.vercel.app`
    - Click **Save**.

#### 2. Set Up Your Store Listing
- **Direct Console URL:** [Main Store Listing / Key Assets](https://play.google.com/console/u/1/developers/7521602128207298151/app/4972711226603665900/key-assets)
- **Status:** Ready to fill and upload assets.
  - **App Name (30 chars max):** `DataAbeg - Cheap Data & Bills`
  - **Short Description (80 chars max):** `Buy ultra-cheap MTN, Airtel, Glo & 9mobile data, airtime, and electricity bills.`
  - **Full Description:**
    ```text
    ⚡ DataAbeg – Ultra-Cheap Mobile Data & Utility Bill Payments in Nigeria

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

    Save money every time you buy data or pay bills. Download DataAbeg today!
    ```
  - **Required Graphic Assets Ready in Codebase:**
    1. **App icon (512 x 512 px):** [`public/playstore-icon-512.png`](file:///c:/Users/Bello%20Imam/Documents/DataAbeg/public/playstore-icon-512.png) ✅
    2. **Feature graphic (1024 x 500 px):** [`public/playstore-feature-graphic-1024x500.png`](file:///c:/Users/Bello%20Imam/Documents/DataAbeg/public/playstore-feature-graphic-1024x500.png) ✅
    3. **Phone screenshots (1080 x 1920 px):**
       - Screen 1: [`public/playstore-screenshot-1.png`](file:///c:/Users/Bello%20Imam/Documents/DataAbeg/public/playstore-screenshot-1.png) ✅
       - Screen 2: [`public/playstore-screenshot-2.png`](file:///c:/Users/Bello%20Imam/Documents/DataAbeg/public/playstore-screenshot-2.png) ✅
       - Screen 3: [`public/playstore-screenshot-3.png`](file:///c:/Users/Bello%20Imam/Documents/DataAbeg/public/playstore-screenshot-3.png) ✅

---

## 🛠️ 2. Automated Scripts Available in Codebase

All automation scripts are maintained and ready in the [`scripts/`](file:///C:/Users/Bello%20Imam/Documents/DataAbeg/scripts) directory:

1. **[`scripts/playstore_bot.py`](file:///C:/Users/Bello%20Imam/Documents/DataAbeg/scripts/playstore_bot.py):**
   - Connects over CDP to your running Brave/Chrome session (`port 9222`) using Python Playwright.
   - Automatically handles navigation and saving for both remaining sections.
2. **[`scripts/playstore_bot.js`](file:///C:/Users/Bello%20Imam/Documents/DataAbeg/scripts/playstore_bot.js):**
   - Node.js equivalent of the automation bot.
3. **[`scripts/run_full_automation.py`](file:///C:/Users/Bello%20Imam/Documents/DataAbeg/scripts/run_full_automation.py):**
   - Automatically handles graceful browser launch with `--remote-debugging-port=9222 --restore-last-session` and executes the automated form filler.

---

## 🚀 3. Quick Resume Instructions for Tomorrow

When you are ready to continue tomorrow:

### Option A: Via Browser Developer Console (Fastest - 10 Seconds)
1. Open the [Store Settings Page](https://play.google.com/console/u/1/developers/7521602128207298151/app/4972711226603665900/store-settings).
2. Click **Edit** on *Store listing contact details*.
3. Fill your email (`kokoroowoabdulsalam@gmail.com`), phone (`+2348154276838`), and website (`https://dataabeg.vercel.app`), then click **Save**.
4. Open the [Store Listing Page](https://play.google.com/console/u/1/developers/7521602128207298151/app/4972711226603665900/key-assets) to paste the descriptions and upload the icon & feature graphic!

### Option B: Via Python CDP Automation
1. If Brave is closed, start it with debugging enabled:
   ```powershell
   & "C:\Users\Bello Imam\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe" --remote-debugging-port=9222 --restore-last-session
   ```
2. Run:
   ```bash
   python scripts/playstore_bot.py
   ```
3. The script will connect and finish the steps!
