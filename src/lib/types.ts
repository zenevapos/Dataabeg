export type NetworkId = 1 | 2 | 3 | 4;

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

export type PlanCategory = 'SME' | 'CORPORATE_GIFTING' | 'DIRECT';

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
  costPrice: number; // What SMEPlug charges
  sellingPrice: number; // What customer pays on DataAbeg
  retailPrice: number; // What Banks/Telcos charge (~₦1,000 per GB)
  isPopular?: boolean;
  savingsPercentage: number;
}

export type TransactionStatus = 'successful' | 'processing' | 'failed' | 'SUCCESS' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string;
  reference: string;
  smeplugReference?: string;
  network: NetworkType | string;
  networkName?: string;
  phone: string;
  phoneNumber?: string;
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
  notes?: string;
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
