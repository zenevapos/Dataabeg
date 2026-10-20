# ⚡ DataAbeg - Ultra-Cheap Nigerian Mobile Data Vending Platform

DataAbeg is a modern, high-converting Next.js web application designed to sell MTN, Airtel, Glo, and 9mobile SME & Corporate Gifting mobile data bundles in Nigeria at true wholesale prices, powered by the **[SMEPlug.ng](https://smeplug.ng)** VTU API.

---

## 🌟 Key Features

- **🔥 Wholesale Cheap Data Pricing:**
  - MTN 1.0GB SME: **₦290** (Save 71% vs Bank retail ₦1,000)
  - Airtel 1.0GB CG: **₦295**
  - Glo 1.0GB CG: **₦285**
  - 9mobile 1.0GB SME: **₦260**
  - Full **30-Day validity** on all plans (no 1-day or 2-day expiry traps).

- **⚡ Automated 5-Second Delivery:**
  - Connects directly to the SMEPlug API (`https://smeplug.ng/api/v1/data/purchase`).
  - Automated SIM queue and instant credit to recipient numbers.

- **🎯 Smart Auto-Network Detection:**
  - As the user types their 11-digit phone number (e.g. `0803...` or `0812...`), the system automatically identifies the telecom operator and selects the corresponding network tab.

- **💼 Integrated Reseller / Admin Settings Drawer:**
  - Set your SMEPlug API Secret Key via the web UI or `.env.local`.
  - View live SMEPlug Wallet Balance.
  - One-click copy for your Webhook Callback URL.
  - Recent transaction history tracker.

- **📱 USSD Balance Check Codes:**
  - Built-in interactive guide with click-to-copy check codes for MTN (`*323*4#` / `*461*4#`), Airtel (`*323#`), Glo (`*323#`), and 9mobile (`*323#`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/zenevapos/Dataabeg.git
cd Dataabeg
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Add your SMEPlug Secret Key in `.env.local`:
```env
# Get your Secret Key from https://smeplug.ng/dashboard/settings/api
SMEPLUG_SECRET_KEY=sk_live_your_actual_key_here

NEXT_PUBLIC_APP_NAME=DataAbeg
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_PHONE=08154276838
```

> **Note:** If no key is set yet, DataAbeg runs in **Sandbox / Demo Mode**, allowing you to test the full purchase flow, UI, and receipt generation with simulated responses!

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔗 SMEPlug API Endpoints Integrated

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/smeplug/balance` | `GET` | Checks your current SMEPlug wallet balance |
| `/api/smeplug/plans` | `GET` | Retrieves active network data bundles & plan IDs |
| `/api/smeplug/purchase` | `POST` | Dispatches automated data purchase request |
| `/api/smeplug/webhook` | `POST` | Receives async transaction status callbacks from SMEPlug |
| `/api/smeplug/config` | `GET` | Returns connection status |

### Webhook Setup in SMEPlug Dashboard:
1. Go to [https://smeplug.ng/dashboard/settings/api](https://smeplug.ng/dashboard/settings/api)
2. In the **Webhook URL** field, paste:
   ```
   https://yourdomain.com/api/smeplug/webhook
   ```
3. Click **Save Webhook**.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Obsidian / Emerald FinTech aesthetic)
- **Icons:** Lucide React
- **Animations & Delight:** Canvas-confetti, Glassmorphism, Micro-animations
- **API Provider:** SMEPlug NG VTU Engine

---

## 📄 License
MIT License. Built for [DataAbeg](https://dataabeg.com).
