const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'playstore-screenshots');
const TMP_DIR = path.join(ROOT, '.tmp-screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

const CHROME = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const readSvgDataUri = (name) => {
  const raw = fs.readFileSync(path.join(ROOT, 'public', 'networks', name), 'utf8');
  return 'data:image/svg+xml;base64,' + Buffer.from(raw).toString('base64');
};

const NET = {
  mtn: readSvgDataUri('mtn.svg'),
  airtel: readSvgDataUri('airtel.svg'),
  glo: readSvgDataUri('glo.svg'),
  nine: readSvgDataUri('9mobile.svg'),
};

const LOGO_SVG = `
<svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" rx="11" fill="url(#g)"/>
  <path d="M22.5 8L12 22.5H19.5L17.5 32L28 17.5H20.5L22.5 8Z" fill="white"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3B82F6"/>
      <stop offset="1" stop-color="#1E3A8A"/>
    </linearGradient>
  </defs>
</svg>`;

const BASE_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 1080px;
  height: 1920px;
  overflow: hidden;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.canvas {
  position: relative;
  width: 1080px;
  height: 1920px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 86px 78px 0 78px;
}
.brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 42px;
}
.brand-name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
}
h1 {
  font-size: 98px;
  font-weight: 900;
  line-height: 1.03;
  letter-spacing: -3.5px;
  margin-bottom: 28px;
}
.sub {
  font-size: 35px;
  line-height: 1.38;
  font-weight: 500;
  max-width: 880px;
  margin-bottom: 56px;
}
.phone-wrap {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.phone {
  position: relative;
  width: 840px;
  height: 1260px;
  background: #080E1C;
  border-radius: 78px 78px 0 0;
  border: 14px solid #1E293B;
  border-bottom: none;
  box-shadow: 0 -24px 90px rgba(0,0,0,0.42), 0 0 0 2px rgba(255,255,255,0.08);
  padding: 36px 40px 0 40px;
  overflow: hidden;
  color: #F8FAFC;
}
.notch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px 30px 14px;
  font-size: 24px;
  font-weight: 700;
  color: #CBD5E1;
}
.island {
  width: 190px;
  height: 40px;
  background: #020617;
  border-radius: 999px;
}
.pill-notif {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%);
  width: 880px;
  background: rgba(255,255,255,0.97);
  color: #0F172A;
  border-radius: 34px;
  padding: 28px 34px;
  box-shadow: 0 30px 70px rgba(2,6,23,0.28), 0 0 0 1px rgba(15,23,42,0.06);
  display: flex;
  align-items: center;
  gap: 24px;
  z-index: 30;
}
.pill-notif-icon {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563EB, #1E3A8A);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pill-notif-title {
  font-size: 26px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 4px;
}
.pill-notif-body {
  font-size: 23px;
  color: #475569;
  font-weight: 500;
}
`;

const slides = [
  // SLIDE 1: Vibrant Electric Blue Gradient — Cheap data. Every network.
  {
    file: 'screenshot-1-home.png',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      .canvas {
        background: linear-gradient(160deg, #2563EB 0%, #1D4ED8 48%, #0F256E 100%);
        color: #FFFFFF;
      }
      .glow {
        position: absolute; top: -180px; right: -180px; width: 780px; height: 780px;
        background: radial-gradient(circle, rgba(96,165,250,0.45), transparent 68%);
      }
      h1 .hi { color: #93C5FD; }
      .sub { color: rgba(239,246,255,0.88); }
      .wallet-card {
        background: linear-gradient(145deg, #1E3A8A 0%, #172554 100%);
        border: 1.5px solid rgba(96,165,250,0.35);
        border-radius: 38px;
        padding: 40px;
        margin-bottom: 34px;
        box-shadow: 0 24px 50px rgba(0,0,0,0.35);
      }
      .bal-label { font-size: 24px; color: #93C5FD; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
      .bal-val { font-size: 74px; font-weight: 900; letter-spacing: -2px; margin: 12px 0 28px 0; color: #FFFFFF; }
      .btn-row { display: flex; gap: 18px; }
      .btn-primary {
        flex: 1; background: #3B82F6; color: #fff; font-size: 26px; font-weight: 800;
        padding: 22px; border-radius: 22px; text-align: center;
      }
      .btn-ghost {
        flex: 1; background: rgba(255,255,255,0.1); color: #fff; font-size: 26px; font-weight: 700;
        padding: 22px; border-radius: 22px; text-align: center; border: 1px solid rgba(255,255,255,0.16);
      }
      .section-lbl { font-size: 24px; color: #94A3B8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; margin-bottom: 22px; }
      .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin-bottom: 34px; }
      .svc {
        background: #111827; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 28px; padding: 28px; display: flex; align-items: center; gap: 20px;
      }
      .svc-ico {
        width: 68px; height: 68px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800;
      }
      .svc-title { font-size: 27px; font-weight: 800; color: #F8FAFC; }
      .svc-sub { font-size: 21px; color: #94A3B8; margin-top: 4px; }
      .net-dock {
        position: absolute; bottom: 52px; left: 50%; transform: translateX(-50%);
        width: 900px; background: rgba(255,255,255,0.98); border-radius: 38px;
        padding: 26px 36px; display: flex; justify-content: space-between; align-items: center;
        box-shadow: 0 32px 75px rgba(2,6,23,0.45);
        z-index: 25;
      }
      .net-chip { display: flex; align-items: center; gap: 14px; }
      .net-chip img { width: 58px; height: 58px; border-radius: 16px; object-fit: cover; }
      .net-chip span { font-size: 26px; font-weight: 800; color: #0F172A; }
    </style></head><body>
      <div class="canvas">
        <div class="glow"></div>
        <div class="brand-row">${LOGO_SVG}<span class="brand-name">DataAbeg</span></div>
        <h1>Cheap data.<br><span class="hi">Every network.</span></h1>
        <p class="sub">MTN, Airtel, Glo &amp; 9mobile 30-day bundles from ₦290 — delivered in 5 seconds.</p>
        <div class="phone-wrap">
          <div class="phone">
            <div class="notch-row"><span>9:41</span><div class="island"></div><span>5G · 100%</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
              <div>
                <div style="font-size:23px;color:#94A3B8;font-weight:600;">Good morning,</div>
                <div style="font-size:34px;font-weight:800;color:#fff;">Bello Imam</div>
              </div>
              <div style="background:rgba(16,185,129,0.16);color:#34D399;padding:12px 22px;border-radius:999px;font-size:22px;font-weight:800;">● Instant 5s</div>
            </div>
            <div class="wallet-card">
              <div class="bal-label">Available Wallet Balance</div>
              <div class="bal-val">₦24,500.00</div>
              <div class="btn-row">
                <div class="btn-primary">+ Add Money</div>
                <div class="btn-ghost">Buy Data</div>
              </div>
            </div>
            <div class="section-lbl">Quick Services</div>
            <div class="services-grid">
              <div class="svc">
                <div class="svc-ico" style="background:rgba(59,130,246,0.18);color:#60A5FA;">⚡</div>
                <div><div class="svc-title">Cheap Data</div><div class="svc-sub">From ₦290/GB</div></div>
              </div>
              <div class="svc">
                <div class="svc-ico" style="background:rgba(16,185,129,0.18);color:#34D399;">📱</div>
                <div><div class="svc-title">Airtime VTU</div><div class="svc-sub">2% Cashback</div></div>
              </div>
              <div class="svc">
                <div class="svc-ico" style="background:rgba(245,158,11,0.18);color:#FBBF24;">💡</div>
                <div><div class="svc-title">Electricity</div><div class="svc-sub">Instant Token</div></div>
              </div>
              <div class="svc">
                <div class="svc-ico" style="background:rgba(168,85,247,0.18);color:#C084FC;">📺</div>
                <div><div class="svc-title">Cable TV</div><div class="svc-sub">DStv · GOtv</div></div>
              </div>
            </div>
          </div>
          <div class="net-dock">
            <div class="net-chip"><img src="${NET.mtn}"/><span>MTN</span></div>
            <div class="net-chip"><img src="${NET.airtel}"/><span>Airtel</span></div>
            <div class="net-chip"><img src="${NET.glo}"/><span>Glo</span></div>
            <div class="net-chip"><img src="${NET.nine}"/><span>9mobile</span></div>
          </div>
        </div>
      </div>
    </body></html>`
  },

  // SLIDE 2: Deep Midnight Navy — Pick a plan. Done in seconds.
  {
    file: 'screenshot-2-plans.png',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      .canvas {
        background: radial-gradient(circle at 80% 18%, rgba(37,99,235,0.28), transparent 52%), #060B18;
        color: #FFFFFF;
      }
      h1 .hi { color: #3B82F6; }
      .sub { color: #94A3B8; }
      .input-box {
        background: #111827; border: 2px solid #2563EB; border-radius: 26px;
        padding: 26px 30px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;
      }
      .plans-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
      .plan-card {
        background: #111827; border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 30px; padding: 32px;
      }
      .plan-size { font-size: 46px; font-weight: 900; color: #FFFFFF; letter-spacing: -1px; }
      .plan-val { font-size: 22px; color: #94A3B8; margin: 6px 0 22px 0; font-weight: 600; }
      .plan-price { font-size: 36px; font-weight: 900; color: #60A5FA; }
      .pop-card {
        position: absolute; right: 24px; bottom: 250px; width: 470px;
        background: linear-gradient(145deg, #2563EB 0%, #1E40AF 100%);
        border: 3px solid #93C5FD;
        border-radius: 40px; padding: 42px;
        transform: rotate(-3.5deg);
        box-shadow: 0 38px 90px rgba(0,0,0,0.65), 0 0 50px rgba(59,130,246,0.45);
        z-index: 30;
      }
      .pop-badge {
        display: inline-block; background: rgba(255,255,255,0.2); color: #fff;
        font-size: 20px; font-weight: 800; letter-spacing: 1.5px; padding: 10px 20px; border-radius: 999px; margin-bottom: 18px;
      }
    </style></head><body>
      <div class="canvas">
        <div class="brand-row">${LOGO_SVG}<span class="brand-name" style="color:#E2E8F0;">DataAbeg</span></div>
        <h1>Pick a plan.<br><span class="hi">Done in seconds.</span></h1>
        <p class="sub">Enter the number, we auto-detect the network. Two taps to buy.</p>
        <div class="phone-wrap">
          <div class="phone">
            <div class="notch-row"><span>9:41</span><div class="island"></div><span>5G · 100%</span></div>
            <div style="font-size:32px;font-weight:800;margin-bottom:24px;">Buy Mobile Data</div>
            <div class="input-box">
              <div style="display:flex;align-items:center;gap:18px;">
                <img src="${NET.mtn}" style="width:52px;height:52px;border-radius:14px;"/>
                <div>
                  <div style="font-size:20px;color:#93C5FD;font-weight:700;">MTN Nigeria Detected</div>
                  <div style="font-size:34px;font-weight:900;letter-spacing:1px;">0803 123 4567</div>
                </div>
              </div>
              <div style="background:rgba(16,185,129,0.2);color:#34D399;padding:10px 18px;border-radius:14px;font-size:21px;font-weight:800;">✓ Valid</div>
            </div>
            <div style="display:flex;gap:14px;margin-bottom:28px;">
              <div style="background:#2563EB;color:#fff;padding:14px 26px;border-radius:999px;font-size:23px;font-weight:800;">SME 30-Day</div>
              <div style="background:#111827;color:#94A3B8;padding:14px 26px;border-radius:999px;font-size:23px;font-weight:700;">Awoof</div>
              <div style="background:#111827;color:#94A3B8;padding:14px 26px;border-radius:999px;font-size:23px;font-weight:700;">Gifting</div>
            </div>
            <div class="plans-grid">
              <div class="plan-card">
                <div class="plan-size">500MB</div>
                <div class="plan-val">7 Days · SME</div>
                <div class="plan-price">₦290</div>
              </div>
              <div class="plan-card">
                <div class="plan-size">1.0GB</div>
                <div class="plan-val">30 Days · Awoof</div>
                <div class="plan-price">₦420</div>
              </div>
              <div class="plan-card">
                <div class="plan-size">2.0GB</div>
                <div class="plan-val">30 Days · SME</div>
                <div class="plan-price">₦950</div>
              </div>
              <div class="plan-card">
                <div class="plan-size">5.0GB</div>
                <div class="plan-val">30 Days · SME</div>
                <div class="plan-price">₦1,600</div>
              </div>
              <div class="plan-card" style="opacity:0.4;">
                <div class="plan-size">10GB</div>
                <div class="plan-val">30 Days · SME</div>
                <div class="plan-price">₦3,100</div>
              </div>
              <div class="plan-card">
                <div class="plan-size">20GB</div>
                <div class="plan-val">30 Days · SME</div>
                <div class="plan-price">₦7,900</div>
              </div>
            </div>
          </div>
          <div class="pop-card">
            <div class="pop-badge">SELECTED PLAN · SAVE 65%</div>
            <div style="font-size:78px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1;">10GB</div>
            <div style="font-size:28px;color:#DBEAFE;font-weight:600;margin:12px 0 28px 0;">MTN SME · 30 Days Validity</div>
            <div style="display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid rgba(255,255,255,0.25);padding-top:24px;">
              <div style="font-size:50px;font-weight:900;color:#fff;">₦3,100</div>
              <div style="background:#fff;color:#1E3A8A;padding:16px 28px;border-radius:20px;font-size:24px;font-weight:900;">Buy Now →</div>
            </div>
          </div>
        </div>
      </div>
    </body></html>`
  },

  // SLIDE 3: Crisp Off-White — Delivered. Receipt ready.
  {
    file: 'screenshot-3-receipt.png',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      .canvas {
        background: linear-gradient(180deg, #F8FAFC 0%, #EEF4FF 100%);
        color: #0B1533;
      }
      h1 .hi { color: #2563EB; }
      .sub { color: #475569; }
      .check-circle {
        width: 148px; height: 148px; border-radius: 999px;
        background: linear-gradient(135deg, #10B981, #059669);
        display: flex; align-items: center; justify-content: center;
        margin: 120px auto 34px auto;
        box-shadow: 0 20px 55px rgba(16,185,129,0.45);
        font-size: 74px; color: #fff; font-weight: 900;
      }
      .rc-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 26px 0; border-bottom: 1px solid rgba(255,255,255,0.08);
        font-size: 27px;
      }
      .rc-k { color: #94A3B8; font-weight: 600; }
      .rc-v { color: #F8FAFC; font-weight: 800; }
    </style></head><body>
      <div class="canvas">
        <div class="brand-row">${LOGO_SVG}<span class="brand-name" style="color:#0B1533;">DataAbeg</span></div>
        <h1>Delivered.<br><span class="hi">Receipt ready.</span></h1>
        <p class="sub">Instant 5-second delivery with a clean, shareable receipt for every order.</p>
        <div class="phone-wrap">
          <div class="pill-notif">
            <div class="pill-notif-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
            </div>
            <div>
              <div class="pill-notif-title">Purchase successful ✓</div>
              <div class="pill-notif-body">10GB MTN SME has been delivered to 0803 123 4567.</div>
            </div>
          </div>
          <div class="phone">
            <div class="notch-row"><span>9:41</span><div class="island"></div><span>5G · 100%</span></div>
            <div class="check-circle">✓</div>
            <div style="text-align:center;font-size:48px;font-weight:900;color:#fff;margin-bottom:10px;">Data delivered!</div>
            <div style="text-align:center;font-size:26px;color:#94A3B8;margin-bottom:48px;">10GB MTN SME · 30 Days Validity</div>
            <div style="background:#111827;border-radius:32px;padding:12px 36px;border:1px solid rgba(255,255,255,0.08);">
              <div class="rc-row"><span class="rc-k">Amount Paid</span><span class="rc-v" style="color:#34D399;font-size:32px;">₦3,100.00</span></div>
              <div class="rc-row"><span class="rc-k">Recipient</span><span class="rc-v">0803 123 4567</span></div>
              <div class="rc-row"><span class="rc-k">Network</span><span class="rc-v">MTN Nigeria</span></div>
              <div class="rc-row"><span class="rc-k">Delivery Time</span><span class="rc-v">3.8 seconds</span></div>
              <div class="rc-row" style="border:none;"><span class="rc-k">Reference</span><span class="rc-v" style="font-family:monospace;">DABG-9842X</span></div>
            </div>
          </div>
        </div>
      </div>
    </body></html>`
  },

  // SLIDE 4: Deep Midnight Navy — Top up by bank transfer.
  {
    file: 'screenshot-4-wallet.png',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      .canvas {
        background: radial-gradient(circle at 20% 20%, rgba(37,99,235,0.32), transparent 50%), #071022;
        color: #FFFFFF;
      }
      h1 .hi { color: #60A5FA; }
      .sub { color: #94A3B8; }
      .pay-card {
        background: #111827; border: 1.5px solid rgba(96,165,250,0.28);
        border-radius: 34px; padding: 36px; margin-bottom: 24px;
      }
      .channel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-top: 24px; }
      .ch {
        background: #0B1325; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px; padding: 26px; font-size: 25px; font-weight: 800; color: #E2E8F0;
      }
    </style></head><body>
      <div class="canvas">
        <div class="brand-row">${LOGO_SVG}<span class="brand-name" style="color:#E2E8F0;">DataAbeg</span></div>
        <h1>Top up by<br><span class="hi">bank transfer.</span></h1>
        <p class="sub">Fund with Bank Transfer, OPay, USSD or Card — credited automatically in seconds.</p>
        <div class="phone-wrap">
          <div class="pill-notif">
            <div class="pill-notif-icon" style="background:linear-gradient(135deg,#10B981,#059669);">
              <span style="font-size:34px;color:#fff;font-weight:900;">₦</span>
            </div>
            <div>
              <div class="pill-notif-title">Wallet Funded ✓</div>
              <div class="pill-notif-body">₦5,000.00 has been credited to your DataAbeg wallet.</div>
            </div>
          </div>
          <div class="phone">
            <div class="notch-row"><span>9:41</span><div class="island"></div><span>5G · 100%</span></div>
            <div style="margin-top:86px;background:linear-gradient(135deg,#1E3A8A,#2563EB);border-radius:36px;padding:38px;margin-bottom:32px;">
              <div style="font-size:23px;color:#BFDBFE;font-weight:700;text-transform:uppercase;">DataAbeg Wallet Pass</div>
              <div style="font-size:70px;font-weight:900;margin:10px 0 6px 0;">₦24,500.00</div>
              <div style="font-size:23px;color:#DBEAFE;">● Active · 0% Hidden Fees</div>
            </div>
            <div class="pay-card">
              <div style="font-size:28px;font-weight:800;color:#fff;">Instant Automated Top-Up</div>
              <div style="font-size:22px;color:#94A3B8;margin-top:6px;">Powered by Paystack Live Gateway</div>
              <div class="channel-grid">
                <div class="ch">🏦 Bank Transfer</div>
                <div class="ch">⚡ Pay with OPay</div>
                <div class="ch">💳 Debit Card</div>
                <div class="ch">📱 USSD Banking</div>
              </div>
            </div>
            <div style="background:#2563EB;color:#fff;padding:28px;border-radius:26px;text-align:center;font-size:28px;font-weight:900;">Fund ₦5,000 Now →</div>
          </div>
        </div>
      </div>
    </body></html>`
  },

  // SLIDE 5: Vibrant Electric Blue — Failed? Auto-refunded.
  {
    file: 'screenshot-5-refund.png',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${BASE_CSS}
      .canvas {
        background: linear-gradient(155deg, #3B82F6 0%, #1D4ED8 55%, #1E3A8A 100%);
        color: #FFFFFF;
      }
      h1 { color: #071022; }
      h1 .hi { color: #FFFFFF; }
      .sub { color: rgba(239,246,255,0.92); }
      .tx-item {
        background: #111827; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 28px; padding: 28px 30px; margin-bottom: 20px;
        display: flex; justify-content: space-between; align-items: center;
      }
      .tx-t { font-size: 27px; font-weight: 800; color: #F8FAFC; }
      .tx-s { font-size: 21px; color: #94A3B8; margin-top: 6px; }
      .badge-ok { background: rgba(16,185,129,0.16); color: #34D399; padding: 8px 18px; border-radius: 999px; font-size: 20px; font-weight: 800; }
      .badge-rf { background: rgba(59,130,246,0.22); color: #93C5FD; padding: 8px 18px; border-radius: 999px; font-size: 20px; font-weight: 800; }
    </style></head><body>
      <div class="canvas">
        <div class="brand-row">${LOGO_SVG}<span class="brand-name" style="color:#FFFFFF;">DataAbeg</span></div>
        <h1>Failed?<br><span class="hi">Auto-refunded.</span></h1>
        <p class="sub">If a carrier fails to deliver, your money goes straight back to your wallet automatically.</p>
        <div class="phone-wrap">
          <div class="pill-notif">
            <div class="pill-notif-icon">
              <span style="font-size:34px;color:#fff;font-weight:900;">↺</span>
            </div>
            <div>
              <div class="pill-notif-title">Auto-Refunded to Wallet ✓</div>
              <div class="pill-notif-body">₦1,600.00 has been returned straight to your DataAbeg balance.</div>
            </div>
          </div>
          <div class="phone">
            <div class="notch-row"><span>9:41</span><div class="island"></div><span>5G · 100%</span></div>
            <div style="margin-top:86px;font-size:34px;font-weight:900;margin-bottom:26px;">Transaction History</div>
            <div class="tx-item" style="border-color:rgba(59,130,246,0.45);">
              <div>
                <div class="tx-t">Auto-Refund · MTN 5GB</div>
                <div class="tx-s">Carrier timeout · Instant wallet credit</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:28px;font-weight:900;color:#60A5FA;margin-bottom:8px;">+₦1,600</div>
                <span class="badge-rf">Refunded</span>
              </div>
            </div>
            <div class="tx-item">
              <div>
                <div class="tx-t">MTN 10GB SME (30 Days)</div>
                <div class="tx-s">0803 123 4567 · 3.8s delivery</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:28px;font-weight:900;color:#fff;margin-bottom:8px;">₦3,100</div>
                <span class="badge-ok">Delivered</span>
              </div>
            </div>
            <div class="tx-item">
              <div>
                <div class="tx-t">Airtel 10GB SME (30 Days)</div>
                <div class="tx-s">0802 987 6543 · 4.1s delivery</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:28px;font-weight:900;color:#fff;margin-bottom:8px;">₦3,350</div>
                <span class="badge-ok">Delivered</span>
              </div>
            </div>
            <div class="tx-item">
              <div>
                <div class="tx-t">Glo 3GB CG Monthly</div>
                <div class="tx-s">0805 442 1900 · 4.5s delivery</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:28px;font-weight:900;color:#fff;margin-bottom:8px;">₦1,350</div>
                <span class="badge-ok">Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body></html>`
  }
];

for (const slide of slides) {
  const htmlPath = path.join(TMP_DIR, slide.file.replace('.png', '.html'));
  const outPath = path.join(OUT_DIR, slide.file);
  fs.writeFileSync(htmlPath, slide.html, 'utf8');
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1080,1920',
    `--screenshot=${outPath}`,
    `file:///${htmlPath.replace(/\\/g, '/')}`
  ], { stdio: 'inherit' });
  console.log('Generated:', outPath);
}

fs.rmSync(TMP_DIR, { recursive: true, force: true });
console.log('ALL 5 SCREENSHOTS GENERATED SUCCESSFULLY!');
