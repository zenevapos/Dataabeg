import { NetworkInfo, DataPlan, NetworkType } from './types';

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
    description: 'Cheapest SME & CG data bundles in Nigeria with fastest nationwide 4G/5G.'
  },
  {
    id: 2,
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
    id: 3,
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
  },
  {
    id: 4,
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
  }
];

export const CURATED_DATA_PLANS: DataPlan[] = [
  // --- MTN PLANS ---
  {
    id: 'mtn-sme-500mb',
    planId: 7,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 500MB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '500MB',
    sizeInMB: 500,
    validity: '30 Days',
    costPrice: 125,
    sellingPrice: 150,
    retailPrice: 500,
    savingsPercentage: 70
  },
  {
    id: 'mtn-sme-1gb',
    planId: 8,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 1.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 245,
    sellingPrice: 290,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 71
  },
  {
    id: 'mtn-sme-2gb',
    planId: 9,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 2.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 490,
    sellingPrice: 580,
    retailPrice: 2000,
    isPopular: true,
    savingsPercentage: 71
  },
  {
    id: 'mtn-sme-3gb',
    planId: 10,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 3.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '3.0GB',
    sizeInMB: 3072,
    validity: '30 Days',
    costPrice: 735,
    sellingPrice: 870,
    retailPrice: 3000,
    savingsPercentage: 71
  },
  {
    id: 'mtn-sme-5gb',
    planId: 11,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 5.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1225,
    sellingPrice: 1450,
    retailPrice: 4500,
    isPopular: true,
    savingsPercentage: 68
  },
  {
    id: 'mtn-sme-10gb',
    planId: 12,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 10.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '10.0GB',
    sizeInMB: 10240,
    validity: '30 Days',
    costPrice: 2450,
    sellingPrice: 2900,
    retailPrice: 7500,
    savingsPercentage: 61
  },
  {
    id: 'mtn-cg-1gb',
    planId: 510,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 1.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 255,
    sellingPrice: 300,
    retailPrice: 1000,
    savingsPercentage: 70
  },
  {
    id: 'mtn-cg-2gb',
    planId: 511,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 2.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 510,
    sellingPrice: 600,
    retailPrice: 2000,
    savingsPercentage: 70
  },
  {
    id: 'mtn-cg-5gb',
    planId: 512,
    networkId: 1,
    networkName: 'MTN',
    name: 'MTN 5.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1275,
    sellingPrice: 1500,
    retailPrice: 4500,
    savingsPercentage: 67
  },

  // --- AIRTEL PLANS ---
  {
    id: 'airtel-cg-500mb',
    planId: 201,
    networkId: 2,
    networkName: 'AIRTEL',
    name: 'Airtel 500MB CG',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '500MB',
    sizeInMB: 500,
    validity: '30 Days',
    costPrice: 130,
    sellingPrice: 160,
    retailPrice: 500,
    savingsPercentage: 68
  },
  {
    id: 'airtel-cg-1gb',
    planId: 202,
    networkId: 2,
    networkName: 'AIRTEL',
    name: 'Airtel 1.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 250,
    sellingPrice: 295,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 70
  },
  {
    id: 'airtel-cg-2gb',
    planId: 203,
    networkId: 2,
    networkName: 'AIRTEL',
    name: 'Airtel 2.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 500,
    sellingPrice: 590,
    retailPrice: 2000,
    isPopular: true,
    savingsPercentage: 70
  },
  {
    id: 'airtel-cg-5gb',
    planId: 204,
    networkId: 2,
    networkName: 'AIRTEL',
    name: 'Airtel 5.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1250,
    sellingPrice: 1470,
    retailPrice: 4500,
    savingsPercentage: 67
  },
  {
    id: 'airtel-cg-10gb',
    planId: 205,
    networkId: 2,
    networkName: 'AIRTEL',
    name: 'Airtel 10.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '10.0GB',
    sizeInMB: 10240,
    validity: '30 Days',
    costPrice: 2500,
    sellingPrice: 2950,
    retailPrice: 7500,
    savingsPercentage: 61
  },

  // --- 9MOBILE PLANS ---
  {
    id: '9mobile-sme-1gb',
    planId: 401,
    networkId: 3,
    networkName: '9MOBILE',
    name: '9mobile 1.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 210,
    sellingPrice: 260,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 74
  },
  {
    id: '9mobile-sme-2gb',
    planId: 402,
    networkId: 3,
    networkName: '9MOBILE',
    name: '9mobile 2.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 420,
    sellingPrice: 520,
    retailPrice: 2000,
    savingsPercentage: 74
  },
  {
    id: '9mobile-sme-5gb',
    planId: 403,
    networkId: 3,
    networkName: '9MOBILE',
    name: '9mobile 5.0GB SME',
    category: 'SME',
    categoryLabel: '🔥 SME Super Cheap',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1050,
    sellingPrice: 1300,
    retailPrice: 4500,
    savingsPercentage: 71
  },

  // --- GLO PLANS ---
  {
    id: 'glo-cg-500mb',
    planId: 301,
    networkId: 4,
    networkName: 'GLO',
    name: 'Glo 500MB CG',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '500MB',
    sizeInMB: 500,
    validity: '30 Days',
    costPrice: 130,
    sellingPrice: 160,
    retailPrice: 500,
    savingsPercentage: 68
  },
  {
    id: 'glo-cg-1gb',
    planId: 302,
    networkId: 4,
    networkName: 'GLO',
    name: 'Glo 1.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '1.0GB',
    sizeInMB: 1024,
    validity: '30 Days',
    costPrice: 245,
    sellingPrice: 285,
    retailPrice: 1000,
    isPopular: true,
    savingsPercentage: 71
  },
  {
    id: 'glo-cg-2gb',
    planId: 303,
    networkId: 4,
    networkName: 'GLO',
    name: 'Glo 2.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '2.0GB',
    sizeInMB: 2048,
    validity: '30 Days',
    costPrice: 490,
    sellingPrice: 570,
    retailPrice: 2000,
    isPopular: true,
    savingsPercentage: 71
  },
  {
    id: 'glo-cg-3gb',
    planId: 304,
    networkId: 4,
    networkName: 'GLO',
    name: 'Glo 3.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '3.0GB',
    sizeInMB: 3072,
    validity: '30 Days',
    costPrice: 735,
    sellingPrice: 855,
    retailPrice: 3000,
    savingsPercentage: 71
  },
  {
    id: 'glo-cg-5gb',
    planId: 305,
    networkId: 4,
    networkName: 'GLO',
    name: 'Glo 5.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '5.0GB',
    sizeInMB: 5120,
    validity: '30 Days',
    costPrice: 1225,
    sellingPrice: 1425,
    retailPrice: 4500,
    savingsPercentage: 68
  },
  {
    id: 'glo-cg-10gb',
    planId: 306,
    networkId: 4,
    networkName: 'GLO',
    name: 'Glo 10.0GB Corporate Gifting',
    category: 'CORPORATE_GIFTING',
    categoryLabel: '⚡ Corporate Gifting',
    size: '10.0GB',
    sizeInMB: 10240,
    validity: '30 Days',
    costPrice: 2450,
    sellingPrice: 2850,
    retailPrice: 7500,
    savingsPercentage: 62
  }
];

export const FAQS = [
  {
    question: 'How fast is data delivery after payment?',
    answer: 'Data delivery is 100% automated and arrives in under 5 to 15 seconds directly on the recipient SIM line.'
  },
  {
    question: 'Why are DataAbeg data prices so much cheaper than my bank or PalmPay?',
    answer: 'Banks and fintech apps sell official retail packages with short 1-day or 2-day validity and high markups. DataAbeg leverages wholesale Telecom SME and Corporate Gifting pools, delivering full 30-day validity at rock-bottom bulk rates.'
  },
  {
    question: 'How do I check my data balance after buying?',
    answer: 'For MTN SME dial *323*4# or *461*4#. For Airtel dial *323# or *140#. For Glo dial *323# or *127*0#. For 9mobile dial *323# or *228#. You will also receive an instant confirmation SMS directly from your telecom operator.'
  },
  {
    question: 'What happens if my number was on DND (Do-Not-Disturb)?',
    answer: 'Our smart delivery gateway bypasses DND restrictions. Your data bundle will be credited directly to the phone number without issue.'
  },
  {
    question: 'Can I resell data to my own friends and customers using DataAbeg?',
    answer: 'Yes! Anyone can resell data by buying at our ultra-cheap wholesale rates and charging their own customers whatever price they choose.'
  }
];

export const COMPARISON_TABLE = [
  {
    plan: '1.0GB (30 Days)',
    banksAndFintech: '₦1,000 - ₦1,200',
    dataAbegPrice: '₦290',
    savings: 'Save ~₦710 (71%)'
  },
  {
    plan: '2.0GB (30 Days)',
    banksAndFintech: '₦2,000 - ₦2,200',
    dataAbegPrice: '₦580',
    savings: 'Save ~₦1,420 (71%)'
  },
  {
    plan: '5.0GB (30 Days)',
    banksAndFintech: '₦4,500 - ₦5,000',
    dataAbegPrice: '₦1,450',
    savings: 'Save ~₦3,050 (68%)'
  },
  {
    plan: '10.0GB (30 Days)',
    banksAndFintech: '₦7,500 - ₦9,000',
    dataAbegPrice: '₦2,900',
    savings: 'Save ~₦4,600 (61%)'
  }
];
