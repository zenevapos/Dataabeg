export type NetworkId = 1 | 2 | 3 | 4 | 6 | number;

export type NetworkType = 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';

export interface NetworkInfo {
  id: NetworkId;
  name: NetworkType;
  displayName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
  prefixes: string[];
  ussdCheckCode: string;
  smsCheckCode?: string;
  description: string;
}

export type PlanCategory = 'SME' | 'SME2' | 'CORPORATE_GIFTING' | 'GIFTING' | 'SPECIAL' | 'DATA_SHARE' | 'DIRECT';

export interface DataPlan {
  id: string | number;
  planId: number | string;
  networkId: NetworkId;
  networkName: NetworkType;
  name: string;
  category: PlanCategory;
  categoryLabel: string;
  size: string;
  sizeInMB: number;
  validity: string;
  costPrice: number; // Wholesale API cost
  sellingPrice: number; // What customer pays on DataAbeg
  retailPrice: number; // Benchmark retail price
  isPopular?: boolean;
  savingsPercentage: number;
}

export type TransactionStatus = 'successful' | 'processing' | 'failed' | 'SUCCESS' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string;
  reference: string;
  userId?: string;
  userEmail?: string;
  smeplugReference?: string;
  network: NetworkType | string;
  networkName?: string;
  phone: string;
  phoneNumber?: string;
  planId?: string | number;
  planName: string;
  planSize: string;
  amount: number;
  amountPaid?: number;
  status: TransactionStatus | string;
  statusMessage?: string;
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  timestamp?: string;
  updatedAt?: any;
  notes?: string;
  serviceType?: 'data' | 'airtime' | 'electricity' | 'cable';
  // Electricity fields
  discoId?: number;
  discoName?: string;
  meterNumber?: string;
  meterType?: 'Prepaid' | 'Postpaid';
  meterToken?: string;
  customerName?: string;
  customerAddress?: string;
  // Cable fields
  cableId?: number;
  cableName?: string;
  cablePlanId?: number;
  cablePlanName?: string;
  smartCardNumber?: string;
}

// Glad Tidings & Provider Interfaces
export interface GladTidingsBalanceResponse {
  status: boolean;
  msg?: string;
  data?: {
    balance: string | number;
    user?: {
      id?: number;
      username?: string;
      email?: string;
      phone?: string;
      user_type?: string;
    };
  };
}

export interface ElectricityDisco {
  id: number;
  name: string;
  code: string;
  state: string;
}

export interface MeterValidationResponse {
  invalid: boolean;
  name?: string;
  address?: string;
  error?: string;
}

export interface ElectricityPaymentResponse {
  status: boolean;
  msg: string;
  token?: string;
  data?: {
    id?: number;
    ident?: string;
    token?: string;
    amount?: number | string;
    meter_number?: string;
    paid_amount?: number;
    Status?: string;
  };
}

export interface CableProvider {
  id: number;
  name: string;
}

export interface CablePlan {
  id: number;
  cableId: number;
  name: string;
  amount: number;
  retailPrice: number;
}

export interface CableValidationResponse {
  invalid: boolean;
  name?: string;
  error?: string;
}

export interface CableSubscriptionResponse {
  status: boolean;
  msg: string;
  data?: {
    id?: number;
    ident?: string;
    package?: string;
    smart_card_number?: string;
    Status?: string;
  };
}

export interface SMEPlugBalanceResponse {
  status: boolean;
  msg?: string;
  data?: {
    balance: string | number;
    user?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface SMEPlugPurchasePayload {
  network_id: number;
  plan_id: number | string;
  phone: string;
  customer_reference: string;
}

export interface SMEPlugPurchaseResponse {
  status: boolean;
  msg?: string;
  data?: {
    reference: string;
    msg: string;
    current_status?: string;
  };
}

export interface UserWallet {
  balance: number;
  virtualAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}
