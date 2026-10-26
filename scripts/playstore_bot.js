const { chromium } = require('playwright-core');

const DATA_ABEG_CONFIG = {
  developerId: '7521602128207298151',
  appId: '4972711226603665900',
  appName: 'DataAbeg - Cheap Data & Bills',
  shortDesc: 'Buy ultra-cheap MTN, Airtel, Glo & 9mobile data, airtime, and electricity bills.',
  privacyPolicyUrl: 'https://dataabeg.vercel.app/privacy',
  websiteUrl: 'https://dataabeg.vercel.app',
  adminEmail: 'kokoroowoabdulsalam@gmail.com',
  phone: '+2348154276838',
  category: 'Finance',
  fullDesc: `⚡ DataAbeg – Ultra-Cheap Mobile Data & Utility Bill Payments in Nigeria

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

Save money every time you buy data or pay bills. Download DataAbeg today!`
};

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runBot() {
  console.log('🚀 Connecting to running Brave/Chrome browser on port 9222...');
  
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
  } catch (err) {
    console.error('❌ Could not connect to browser on port 9222.');
    console.error('👉 Make sure you close all running Brave windows and start Brave with:');
    console.error('& "C:\\Users\\Bello Imam\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --remote-debugging-port=9222');
    console.error(err.message);
    process.exit(1);
  }

  const contexts = browser.contexts();
  const context = contexts[0] || (await browser.newContext());
  const pages = context.pages();
  
  // Find the Play Console tab or open one
  let page = pages.find((p) => p.url().includes('play.google.com/console'));
  if (!page) {
    page = await context.newPage();
    const dashboardUrl = `https://play.google.com/console/u/1/developers/${DATA_ABEG_CONFIG.developerId}/app/${DATA_ABEG_CONFIG.appId}/app-dashboard`;
    console.log('Navigating to dashboard:', dashboardUrl);
    await page.goto(dashboardUrl);
  }

  console.log('✅ Connected to Play Console tab:', page.url());
  await page.bringToFront();
  await sleep(2000);

  // Helper to click Save button
  async function clickSave() {
    console.log('💾 Saving step...');
    await sleep(1500);
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Submit")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await sleep(2500);
      console.log('✅ Saved successfully!');
    } else {
      console.log('ℹ️ Save button not active or not visible.');
    }
  }

  // -------------------------------------------------------------
  // STEP 1: App Category & Contact Details
  // -------------------------------------------------------------
  console.log('\n📂 Checking "Select an app category and provide contact details"...');
  try {
    const categoryLink = page.locator('text="Select an app category and provide contact details"').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await sleep(3000);
    } else if (!page.url().includes('store-settings')) {
      await page.goto(`https://play.google.com/console/u/1/developers/${DATA_ABEG_CONFIG.developerId}/app/${DATA_ABEG_CONFIG.appId}/store-settings`);
      await sleep(3000);
    }

    // App radio
    const appRadio = page.locator('material-radio:has-text("App"), label:has-text("App")').first();
    if (await appRadio.isVisible()) {
      await appRadio.click();
      await sleep(1000);
    }

    // Category dropdown
    try {
      const catDropdown = page.locator('material-dropdown-select[aria-label*="Category" i], [role="combobox"]').first();
      if (await catDropdown.isVisible()) {
        await catDropdown.click();
        await sleep(1000);
        const financeOpt = page.locator('material-select-dropdown-item:has-text("Finance"), [role="option"]:has-text("Finance")').first();
        if (await financeOpt.isVisible()) {
          await financeOpt.click();
          await sleep(1000);
        }
      }
    } catch (e) {
      console.log('Category dropdown note:', e.message);
    }

    // Contact Email
    const emailInput = page.locator('input[type="email"], input[aria-label*="email" i]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(DATA_ABEG_CONFIG.adminEmail);
      await sleep(500);
    }

    // Phone
    const phoneInput = page.locator('input[type="tel"], input[aria-label*="phone" i]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(DATA_ABEG_CONFIG.phone);
      await sleep(500);
    }

    // Website
    const websiteInput = page.locator('input[type="url"], input[aria-label*="website" i]').first();
    if (await websiteInput.isVisible()) {
      await websiteInput.fill(DATA_ABEG_CONFIG.websiteUrl);
      await sleep(500);
    }

    await clickSave();
    await sleep(2000);

    // Return to dashboard
    await page.goto(`https://play.google.com/console/u/1/developers/${DATA_ABEG_CONFIG.developerId}/app/${DATA_ABEG_CONFIG.appId}/app-dashboard`);
    await sleep(3000);
  } catch (err) {
    console.error('Error in category & contact details:', err.message);
  }

  // -------------------------------------------------------------
  // STEP 2: Main Store Listing Setup
  // -------------------------------------------------------------
  console.log('\n📝 Checking "Set up your store listing"...');
  try {
    const storeLink = page.locator('text="Set up your store listing", a:has-text("Main store listing")').first();
    if (await storeLink.isVisible()) {
      await storeLink.click();
      await sleep(3000);
    } else if (!page.url().includes('main-store-listing') && !page.url().includes('key-assets')) {
      await page.goto(`https://play.google.com/console/u/1/developers/${DATA_ABEG_CONFIG.developerId}/app/${DATA_ABEG_CONFIG.appId}/key-assets`);
      await sleep(3000);
    }

    // App name
    const titleInput = page.locator('input[aria-label*="App name" i], input[data-test-id="app-name"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill(DATA_ABEG_CONFIG.appName);
      await sleep(500);
    }

    // Short description
    const shortDescInput = page.locator('textarea[aria-label*="Short description" i], textarea[data-test-id="short-description"]').first();
    if (await shortDescInput.isVisible()) {
      await shortDescInput.fill(DATA_ABEG_CONFIG.shortDesc);
      await sleep(500);
    }

    // Full description
    const fullDescInput = page.locator('textarea[aria-label*="Full description" i], textarea[data-test-id="full-description"]').first();
    if (await fullDescInput.isVisible()) {
      await fullDescInput.fill(DATA_ABEG_CONFIG.fullDesc);
      await sleep(500);
    }

    await clickSave();
    await sleep(2000);

    // Return to dashboard
    await page.goto(`https://play.google.com/console/u/1/developers/${DATA_ABEG_CONFIG.developerId}/app/${DATA_ABEG_CONFIG.appId}/app-dashboard`);
    await sleep(3000);
    console.log('🎉 Automation routine completed! Check dashboard for 11 of 11 complete!');
  } catch (err) {
    console.error('Error in store listing:', err.message);
  }
}

runBot().catch(console.error);
