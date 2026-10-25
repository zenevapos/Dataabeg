const { chromium } = require('playwright-core');

const DATA_ABEG_CONFIG = {
  developerId: '7521602128207298151',
  appName: 'DataAbeg - Cheap Data & Bills',
  shortDesc: 'Buy ultra-cheap MTN, Airtel, Glo & 9mobile data, airtime, and electricity bills.',
  privacyPolicyUrl: 'https://dataabeg.vercel.app/privacy',
  websiteUrl: 'https://dataabeg.vercel.app',
  adminEmail: 'kokoroowoabdulsalam@gmail.com',
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
  console.log('🚀 Connecting to your running Brave browser on port 9222...');
  
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
  } catch (err) {
    console.error('❌ Could not connect to Brave.');
    console.error('👉 Make sure you started Brave with:');
    console.error('& "$env:LOCALAPPDATA\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --remote-debugging-port=9222');
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
    await page.goto(`https://play.google.com/console/u/1/developers/${DATA_ABEG_CONFIG.developerId}/home`);
  }

  console.log('✅ Connected to Play Console tab:', page.url());
  await page.bringToFront();
  await sleep(2000);

  // 1. Locate and click DataAbeg in the app list
  console.log('📱 Looking for DataAbeg in the app list...');
  try {
    const appLink = page.locator('text=DataAbeg').first();
    await appLink.waitFor({ timeout: 8000 });
    await appLink.click();
    await sleep(3000);
  } catch {
    console.log('Already on DataAbeg page or navigating...');
  }

  const currentUrl = page.url();
  console.log('📍 Current Console URL:', currentUrl);

  // Helper to click Save button
  async function clickSave() {
    console.log('💾 Saving step...');
    await sleep(1500);
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Submit")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await sleep(2500);
    }
  }

  // 2. Task: Privacy Policy
  console.log('🔒 Checking Privacy Policy...');
  try {
    const privacyLink = page.locator('a:has-text("Privacy policy"), button:has-text("Set privacy policy")').first();
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await sleep(2000);
      const urlInput = page.locator('input[type="url"], input[aria-label*="Privacy"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill(DATA_ABEG_CONFIG.privacyPolicyUrl);
        await clickSave();
      }
      await page.goBack();
      await sleep(2000);
    }
  } catch (e) {
    console.log('Privacy policy step skipped or already completed');
  }

  // 3. Task: App Access
  console.log('🔑 Checking App Access...');
  try {
    const accessLink = page.locator('a:has-text("App access"), button:has-text("App access")').first();
    if (await accessLink.isVisible()) {
      await accessLink.click();
      await sleep(2000);
      const radioAll = page.locator('material-radio:has-text("All functionality"), input[type="radio"]').first();
      if (await radioAll.isVisible()) {
        await radioAll.click();
        await clickSave();
      }
      await page.goBack();
      await sleep(2000);
    }
  } catch (e) {
    console.log('App access step skipped or already completed');
  }

  // 4. Task: Ads
  console.log('📢 Checking Ads Declaration...');
  try {
    const adsLink = page.locator('a:has-text("Ads"), button:has-text("Set ads")').first();
    if (await adsLink.isVisible()) {
      await adsLink.click();
      await sleep(2000);
      const radioNoAds = page.locator('material-radio:has-text("No"), label:has-text("No")').first();
      if (await radioNoAds.isVisible()) {
        await radioNoAds.click();
        await clickSave();
      }
      await page.goBack();
      await sleep(2000);
    }
  } catch (e) {
    console.log('Ads step skipped or already completed');
  }

  // 5. Task: Content Rating (IARC)
  console.log('🎯 Checking Content Rating questionnaire...');
  try {
    const ratingLink = page.locator('a:has-text("Content rating"), button:has-text("Start questionnaire")').first();
    if (await ratingLink.isVisible()) {
      await ratingLink.click();
      await sleep(2500);

      const emailBox = page.locator('input[type="email"], input[aria-label*="Email"]').first();
      if (await emailBox.isVisible()) {
        await emailBox.fill(DATA_ABEG_CONFIG.adminEmail);
        const catRadio = page.locator('material-radio:has-text("Utility"), label:has-text("Utility")').first();
        if (await catRadio.isVisible()) await catRadio.click();
        
        const nextBtn = page.locator('button:has-text("Next")').first();
        if (await nextBtn.isVisible()) await nextBtn.click();
        await sleep(2000);

        const noRadios = page.locator('material-radio:has-text("No"), label:has-text("No")');
        const count = await noRadios.count();
        for (let i = 0; i < count; i++) {
          await noRadios.nth(i).click();
          await sleep(150);
        }
        await clickSave();
      }
    }
  } catch (e) {
    console.log('Content rating step skipped or already completed');
  }

  // 6. Task: Target Audience
  console.log('👥 Checking Target Audience...');
  try {
    const targetLink = page.locator('a:has-text("Target audience")').first();
    if (await targetLink.isVisible()) {
      await targetLink.click();
      await sleep(2000);
      const age18 = page.locator('material-checkbox:has-text("18 and over"), label:has-text("18 and over")').first();
      if (await age18.isVisible()) await age18.click();
      
      const nextBtn = page.locator('button:has-text("Next")').first();
      if (await nextBtn.isVisible()) await nextBtn.click();
      await sleep(1500);

      const appealNo = page.locator('material-radio:has-text("No"), label:has-text("No")').first();
      if (await appealNo.isVisible()) await appealNo.click();
      await clickSave();
      await page.goBack();
      await sleep(2000);
    }
  } catch (e) {
    console.log('Target audience step skipped or already completed');
  }

  // 7. Task: News App
  console.log('📰 Checking News App...');
  try {
    const newsLink = page.locator('a:has-text("News apps")').first();
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await sleep(2000);
      const noNews = page.locator('material-radio:has-text("No"), label:has-text("No")').first();
      if (await noNews.isVisible()) await noNews.click();
      await clickSave();
      await page.goBack();
      await sleep(2000);
    }
  } catch (e) {
    console.log('News app step skipped or already completed');
  }

  // 8. Task: Main Store Listing Text
  console.log('📝 Checking Main Store Listing...');
  try {
    const storeListingLink = page.locator('a:has-text("Main store listing")').first();
    if (await storeListingLink.isVisible()) {
      await storeListingLink.click();
      await sleep(2500);

      const titleInput = page.locator('input[aria-label*="App name"]').first();
      if (await titleInput.isVisible()) await titleInput.fill(DATA_ABEG_CONFIG.appName);

      const shortDescInput = page.locator('textarea[aria-label*="Short description"]').first();
      if (await shortDescInput.isVisible()) await shortDescInput.fill(DATA_ABEG_CONFIG.shortDesc);

      const fullDescInput = page.locator('textarea[aria-label*="Full description"]').first();
      if (await fullDescInput.isVisible()) await fullDescInput.fill(DATA_ABEG_CONFIG.fullDesc);

      await clickSave();
    }
  } catch (e) {
    console.log('Store listing step skipped or already completed');
  }

  console.log('🎉 Automation routine completed!');
}

runBot().catch(console.error);
