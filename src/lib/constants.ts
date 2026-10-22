import {
  NetworkInfo,
  DataPlan,
  ElectricityDisco,
  CableProvider,
  CablePlan
} from './types';

export const NETWORKS: NetworkInfo[] = [
  {
    id: 1,
    name: 'MTN',
    displayName: 'MTN Nigeria',
    color: '#FACC15', // Vibrant MTN Yellow
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-400',
    badgeBg: 'bg-amber-400 text-slate-950 font-bold',
    textColor: 'text-amber-400',
    prefixes: [
      '0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', 
      '0903', '0906', '0913', '0916', '07025', '07026', '0704'
    ],
    ussdCheckCode: '*323*4# or *461*4#',
    smsCheckCode: 'Send "STATUS" to 312',
    description: 'Ultra-cheap 30-day SME & CG data bundles with fastest nationwide 4G/5G coverage.'
  },
  {
    id: 3,
    name: 'AIRTEL',
    displayName: 'Airtel Nigeria',
    color: '#EF4444', // Airtel Red
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
    badgeBg: 'bg-red-600 text-white font-bold',
    textColor: 'text-red-400',
    prefixes: [
      '0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901', '0912', '0911'
    ],
    ussdCheckCode: '*323# or *140#',
    smsCheckCode: 'Send "STATUS" to 140',
    description: 'Fast streaming Corporate Gifting & SME bundles nationwide.'
  },
  {
    id: 2,
    name: 'GLO',
    displayName: 'Glo Nigeria',
    color: '#22C55E', // Glo Green
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-600 text-white font-bold',
    textColor: 'text-emerald-400',
    prefixes: [
      '0805', '0807', '0705', '0815', '0811', '0905', '0915'
    ],
    ussdCheckCode: '*323# or *127*0#',
    smsCheckCode: 'Send "INFO" to 127',
    description: 'Massive heavy data bundles with the grandmasters of data.'
  },
  {
    id: 6,
    name: '9MOBILE',
    displayName: '9mobile',
    color: '#84CC16', // 9mobile Lime Green
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500',
    badgeBg: 'bg-lime-600 text-white font-bold',
    textColor: 'text-lime-400',
    prefixes: [
      '0809', '0817', '0818', '0909', '0908'
    ],
    ussdCheckCode: '*323# or *228#',
    smsCheckCode: 'Send "BAL" to 228',
    description: 'Crisp, ultra-reliable gaming and browsing bundles.'
  }
];

export const CURATED_DATA_PLANS: DataPlan[] = [
  // ==========================================
  // --- MTN DATA PLANS (Glad Tidings Gateway) ---
  // ==========================================
  {
    id: 'mtn-sme-500mb',
    planId: 646,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 500MB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Direct',
    size: '500MB',
    sizeInMB: 500,
    validity: '7 Days',
    costPrice: 250,
    sellingPrice: 290,
    retailPrice: 500,
    savingsPercentage: 42
  },
  {
    id: 'mtn-awoof-1gb',
    planId: 808,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 1.0GB Awoof',
    category: 'SPECIAL',
    categoryLabel: '⚡ Awoof Special',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 370,
    sellingPrice: 420,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 58
  },
  {
    id: 'mtn-sme-1gb',
    planId: 824,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 1.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Best Seller',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 440,
    sellingPrice: 490,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 51
  },
  {
    id: 'mtn-sme-2gb',
    planId: 506,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 2.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Best Seller',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 850,
    sellingPrice: 950,
    retailPrice: 2000,
    savingsPercentage: 52
  },
  {
    id: 'mtn-sme-3gb',
    planId: 355,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 3.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Heavy Value',
    size: '3.0GB',
    sizeInMB: 3072,
    validity: '30 Days',
    costPrice: 1120,
    sellingPrice: 1250,
    retailPrice: 3000,
    savingsPercentage: 58
  },
  {
    id: 'mtn-sme-5gb',
    planId: 356,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 5.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Best Value (₦290/GB)',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1450,
    sellingPrice: 1600,
    retailPrice: 4500,
    isPopular: true,
    savingsPercentage: 64
  },
  {
    id: 'mtn-sme-10gb',
    planId: 860,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 10.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Wholesale (₦280/GB)',
    size: '10.0GB',
    sizeInMB: 10240,
    validity: '30 Days',
    costPrice: 2800,
    sellingPrice: 3100,
    retailPrice: 9000,
    isPopular: true,
    savingsPercentage: 65
  },
  {
    id: 'mtn-gifting-16gb',
    planId: 461,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 16.5GB Gifting',
    category: 'GIFTING',
    categoryLabel: '🎁 Telecom Gifting',
    size: '16.5GB',
    sizeInMB: 16896,
    validity: '30 Days',
    costPrice: 6305,
    sellingPrice: 6800,
    retailPrice: 12000,
    savingsPercentage: 43
  },
  {
    id: 'mtn-sme2-20gb',
    planId: 852,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 20.0GB SME Pro',
    category: 'SME2',
    categoryLabel: '🚀 Power User SME',
    size: '20.0GB',
    sizeInMB: 20480,
    validity: '30 Days',
    costPrice: 7270,
    sellingPrice: 7900,
    retailPrice: 15000,
    savingsPercentage: 47
  },

  // ==========================================
  // --- AIRTEL DATA PLANS (Glad Tidings Gateway) ---
  // ==========================================
  {
    id: 'airtel-sme-600mb',
    planId: 478,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 600MB Mini',
    category: 'SME',
    categoryLabel: '🔥 SME Quick Bite',
    size: '600MB',
    sizeInMB: 600,
    validity: '2 Days',
    costPrice: 207,
    sellingPrice: 260,
    retailPrice: 500,
    savingsPercentage: 48
  },
  {
    id: 'airtel-cg-1_5gb',
    planId: 870,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 1.5GB CG Flash',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ CG Flash',
    size: '1.5GB',
    sizeInMB: 1536,
    validity: '1 Day',
    costPrice: 395,
    sellingPrice: 470,
    retailPrice: 1000,
    savingsPercentage: 53
  },
  {
    id: 'airtel-gifting-2gb',
    planId: 564,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 2.0GB 30-Day',
    category: 'GIFTING',
    categoryLabel: '🎁 Monthly Gifting',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 1452,
    sellingPrice: 1600,
    retailPrice: 2500,
    savingsPercentage: 36
  },
  {
    id: 'airtel-gifting-4gb',
    planId: 148,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 4.0GB 30-Day',
    category: 'GIFTING',
    categoryLabel: '🎁 Monthly Gifting',
    size: '4.0GB',
    sizeInMB: 4096,
    validity: '30 Days',
    costPrice: 2375,
    sellingPrice: 2600,
    retailPrice: 4000,
    isPopular: true,
    savingsPercentage: 35
  },
  {
    id: 'airtel-sme-10gb',
    planId: 483,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 10.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Mega Saver',
    size: '10.0GB',
    sizeInMB: 10240,
    validity: '30 Days',
    costPrice: 3007,
    sellingPrice: 3350,
    retailPrice: 8000,
    isPopular: true,
    savingsPercentage: 58
  },
  {
    id: 'airtel-sme-13gb',
    planId: 534,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 13.0GB SME 30-Day',
    category: 'SME',
    categoryLabel: '🔥 SME Ultra',
    size: '13.0GB',
    sizeInMB: 13312,
    validity: '30 Days',
    costPrice: 4875,
    sellingPrice: 5300,
    retailPrice: 10000,
    savingsPercentage: 47
  },
  {
    id: 'airtel-sme-35gb',
    planId: 614,
    networkId: 3,
    networkName: 'AIRTEL',
    name: 'Airtel 35.0GB SME Pro',
    category: 'SME',
    categoryLabel: '🚀 Power SME (30 Days)',
    size: '35.0GB',
    sizeInMB: 35840,
    validity: '30 Days',
    costPrice: 9890,
    sellingPrice: 10700,
    retailPrice: 20000,
    savingsPercentage: 46
  },

  // ==========================================
  // --- GLO DATA PLANS (Glad Tidings Gateway) ---
  // ==========================================
  {
    id: 'glo-sme-500mb',
    planId: 810,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 500MB SME',
    category: 'SME',
    categoryLabel: '🔥 Ultra Cheap Glo',
    size: '500MB',
    sizeInMB: 500,
    validity: '1 Day',
    costPrice: 96,
    sellingPrice: 150,
    retailPrice: 300,
    savingsPercentage: 50
  },
  {
    id: 'glo-sme-1gb',
    planId: 811,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 1.0GB SME 1-Day',
    category: 'SME',
    categoryLabel: '⚡ Flash Deal ₦195',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '1 Day',
    costPrice: 195,
    sellingPrice: 250,
    retailPrice: 600,
    isPopular: true,
    savingsPercentage: 58
  },
  {
    id: 'glo-cg-1gb-3days',
    planId: 632,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 1.0GB CG (3 Days)',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '💼 Corporate Gifting',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '3 Days',
    costPrice: 335,
    sellingPrice: 400,
    retailPrice: 800,
    savingsPercentage: 50
  },
  {
    id: 'glo-cg-1gb-30days',
    planId: 334,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 1.0GB CG Monthly',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '💼 30-Day Monthly',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 397,
    sellingPrice: 470,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 53
  },
  {
    id: 'glo-sme-3gb-1day',
    planId: 812,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 3.0GB SME Flash',
    category: 'SME',
    categoryLabel: '🔥 Flash Deal ₦485',
    size: '3.0GB',
    sizeInMB: 3072,
    validity: '1 Day',
    costPrice: 485,
    sellingPrice: 580,
    retailPrice: 1500,
    savingsPercentage: 61
  },
  {
    id: 'glo-cg-3gb-30days',
    planId: 336,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 3.0GB CG Monthly',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '💼 30-Day Monthly',
    size: '3.0GB',
    sizeInMB: 3072,
    validity: '30 Days',
    costPrice: 1191,
    sellingPrice: 1350,
    retailPrice: 2500,
    savingsPercentage: 46
  },
  {
    id: 'glo-cg-5gb-30days',
    planId: 329,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 5.0GB CG Monthly',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '💼 30-Day Monthly',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1985,
    sellingPrice: 2200,
    retailPrice: 4000,
    isPopular: true,
    savingsPercentage: 45
  },
  {
    id: 'glo-cg-10gb-30days',
    planId: 335,
    networkId: 2,
    networkName: 'GLO',
    name: 'Glo 10.0GB CG Monthly',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '💼 Wholesale (₦397/GB)',
    size: '10.0GB',
    sizeInMB: 10240,
    validity: '30 Days',
    costPrice: 3970,
    sellingPrice: 4400,
    retailPrice: 7500,
    isPopular: true,
    savingsPercentage: 41
  },

  // ==========================================
  // --- 9MOBILE DATA PLANS (Glad Tidings Gateway) ---
  // ==========================================
  {
    id: '9mobile-spec-650mb',
    planId: 754,
    networkId: 6,
    networkName: '9MOBILE',
    name: '9mobile 650MB Special',
    category: 'SPECIAL',
    categoryLabel: '⚡ Special Flash',
    size: '650MB',
    sizeInMB: 650,
    validity: '3 Days',
    costPrice: 485,
    sellingPrice: 580,
    retailPrice: 1000,
    savingsPercentage: 42
  },
  {
    id: '9mobile-spec-2gb',
    planId: 755,
    networkId: 6,
    networkName: '9MOBILE',
    name: '9mobile 2.0GB Special',
    category: 'SPECIAL',
    categoryLabel: '🔥 30-Day Monthly',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 970,
    sellingPrice: 1100,
    retailPrice: 2000,
    isPopular: true,
    savingsPercentage: 45
  },
  {
    id: '9mobile-spec-4_5gb',
    planId: 757,
    networkId: 6,
    networkName: '9MOBILE',
    name: '9mobile 4.5GB Special',
    category: 'SPECIAL',
    categoryLabel: '🔥 30-Day Monthly',
    size: '4.5GB',
    sizeInMB: 4608,
    validity: '30 Days',
    costPrice: 1940,
    sellingPrice: 2200,
    retailPrice: 3500,
    isPopular: true,
    savingsPercentage: 37
  },
  {
    id: '9mobile-spec-8_4gb',
    planId: 756,
    networkId: 6,
    networkName: '9MOBILE',
    name: '9mobile 8.4GB Special',
    category: 'SPECIAL',
    categoryLabel: '🔥 30-Day Monthly',
    size: '8.4GB',
    sizeInMB: 8601,
    validity: '30 Days',
    costPrice: 3880,
    sellingPrice: 4300,
    retailPrice: 6500,
    savingsPercentage: 34
  },
  {
    id: '9mobile-spec-11_4gb',
    planId: 758,
    networkId: 6,
    networkName: '9MOBILE',
    name: '9mobile 11.4GB Special',
    category: 'SPECIAL',
    categoryLabel: '🔥 30-Day Heavy Duty',
    size: '11.4GB',
    sizeInMB: 11673,
    validity: '30 Days',
    costPrice: 4850,
    sellingPrice: 5350,
    retailPrice: 8000,
    savingsPercentage: 33
  }
];

// ==========================================
// --- ELECTRICITY DISCOS (Glad Tidings Gateway) ---
// ==========================================
export const DISCOS: ElectricityDisco[] = [
  { id: 18, name: 'Ikeja Electric', code: 'IKEDC', state: 'Lagos State (Ikeja, Mainland)' },
  { id: 20, name: 'Eko Electric', code: 'EKEDC', state: 'Lagos State (Island, Lekki, Epe)' },
  { id: 25, name: 'Abuja Electric', code: 'AEDC', state: 'FCT Abuja, Kogi, Nasarawa, Niger' },
  { id: 19, name: 'Ibadan Electric', code: 'IBEDC', state: 'Oyo, Ogun, Osun, Kwara' },
  { id: 21, name: 'Port Harcourt Electric', code: 'PHED', state: 'Rivers, Bayelsa, Cross River, Akwa Ibom' },
  { id: 26, name: 'Enugu Electric', code: 'EEDC', state: 'Enugu, Abia, Anambra, Ebonyi, Imo' },
  { id: 29, name: 'Benin Electric', code: 'BEDC', state: 'Edo, Delta, Ondo, Ekiti' },
  { id: 23, name: 'Kano Electric', code: 'KEDCO', state: 'Kano, Katsina, Jigawa' },
  { id: 22, name: 'Kaduna Electric', code: 'KAEDCO', state: 'Kaduna, Kebbi, Sokoto, Zamfara' },
  { id: 24, name: 'Jos Electric', code: 'JED', state: 'Plateau, Bauchi, Benue, Gombe' },
  { id: 28, name: 'Yola Electric', code: 'YEDC', state: 'Adamawa, Borno, Taraba, Yobe' },
  { id: 30, name: 'Aba Electric', code: 'APLE', state: 'Aba Metro, Abia State' }
];

// ==========================================
// --- CABLE TV PROVIDERS & PLANS (Glad Tidings) ---
// ==========================================
export const CABLE_PROVIDERS: CableProvider[] = [
  { id: 1, name: 'GOtv' },
  { id: 2, name: 'DStv' },
  { id: 3, name: 'StarTimes' }
];

export const CABLE_PLANS: CablePlan[] = [
  // GOtv
  { id: 17, cableId: 1, name: 'GOtv Smallie (Monthly)', amount: 1900, retailPrice: 1900 },
  { id: 16, cableId: 1, name: 'GOtv Jinja', amount: 3900, retailPrice: 3900 },
  { id: 47, cableId: 1, name: 'GOtv Jolli', amount: 5800, retailPrice: 5800 },
  { id: 2, cableId: 1, name: 'GOtv Max', amount: 8500, retailPrice: 8500 },
  { id: 52, cableId: 1, name: 'GOtv Supa', amount: 11400, retailPrice: 11400 },
  { id: 55, cableId: 1, name: 'GOtv Supa Plus', amount: 16800, retailPrice: 16800 },

  // DStv
  { id: 33, cableId: 2, name: 'DStv Padi', amount: 4400, retailPrice: 4400 },
  { id: 6, cableId: 2, name: 'DStv Yanga', amount: 6000, retailPrice: 6000 },
  { id: 22, cableId: 2, name: 'DStv Confam', amount: 11000, retailPrice: 11000 },
  { id: 7, cableId: 2, name: 'DStv Compact', amount: 19000, retailPrice: 19000 },
  { id: 8, cableId: 2, name: 'DStv Compact Plus', amount: 30000, retailPrice: 30000 },
  { id: 9, cableId: 2, name: 'DStv Premium', amount: 44500, retailPrice: 44500 },

  // StarTimes
  { id: 54, cableId: 3, name: 'StarTimes Nova (Antenna - 1 Month)', amount: 2100, retailPrice: 2100 },
  { id: 49, cableId: 3, name: 'StarTimes Basic (Antenna - 1 Month)', amount: 4000, retailPrice: 4000 },
  { id: 77, cableId: 3, name: 'StarTimes Classic (Antenna - Monthly)', amount: 6000, retailPrice: 6000 },
  { id: 48, cableId: 3, name: 'StarTimes Super (Antenna - 1 Month)', amount: 9500, retailPrice: 9500 }
];

export interface ComparisonRow {
  plan: string;
  banksAndFintech: string;
  dataAbegPrice: string;
  savings: string;
  savingsPercentage: string;
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  {
    plan: '1.0GB Monthly (MTN/Airtel/Glo)',
    banksAndFintech: '₦1,000.00',
    dataAbegPrice: '₦420.00',
    savings: '₦580.00',
    savingsPercentage: '58%'
  },
  {
    plan: '2.0GB Monthly (All Networks)',
    banksAndFintech: '₦2,000.00',
    dataAbegPrice: '₦950.00',
    savings: '₦1,050.00',
    savingsPercentage: '52%'
  },
  {
    plan: '5.0GB Monthly SME (Best Value)',
    banksAndFintech: '₦4,500.00',
    dataAbegPrice: '₦1,600.00',
    savings: '₦2,900.00',
    savingsPercentage: '64%'
  },
  {
    plan: '10.0GB SME Power User',
    banksAndFintech: '₦9,000.00',
    dataAbegPrice: '₦3,100.00',
    savings: '₦5,900.00',
    savingsPercentage: '65%'
  }
];
