// Paystack Payment Gateway Client & Helper Library
// Live Integration for DataAbeg

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    domain: string;
    status: string; // 'success' | 'failed' | 'abandoned'
    reference: string;
    amount: number; // in kobo (e.g. 100000 = ₦1,000)
    message?: string;
    gateway_response?: string;
    paid_at?: string;
    channel?: string; // 'card' | 'bank' | 'ussd' | 'qr' | etc.
    currency?: string;
    ip_address?: string;
    metadata?: Record<string, any>;
    customer?: {
      id: number;
      email: string;
      customer_code: string;
      phone?: string;
    };
  };
}

export function getPaystackSecretKey(customKey?: string): string {
  return (
    customKey ||
    process.env.PAYSTACK_SECRET_KEY ||
    ''
  );
}

export function getPaystackPublicKey(): string {
  return (
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    'pk_live_49c5d3adb3f90c37a62d3c297eb291a5242abb36'
  );
}

export class PaystackClient {
  private secretKey: string;

  constructor(customSecretKey?: string) {
    this.secretKey = getPaystackSecretKey(customSecretKey);
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.secretKey.trim()}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Initialize a transaction with Paystack
   * @param params.amount Amount in Naira (will be converted to kobo)
   * @param params.email Customer email
   * @param params.reference Unique transaction reference
   * @param params.callback_url Optional redirect URL
   * @param params.metadata Custom metadata (userId, serviceType, plan details, etc.)
   */
  async initializeTransaction(params: {
    amount: number;
    email: string;
    reference: string;
    callback_url?: string;
    metadata?: Record<string, any>;
  }): Promise<PaystackInitResponse> {
    const amountInKobo = Math.round(params.amount * 100);

    try {
      const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: amountInKobo,
          email: params.email,
          reference: params.reference,
          callback_url: params.callback_url,
          metadata: params.metadata || {}
        }),
        cache: 'no-store'
      });

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
      return {
        status: false,
        message: `Paystack initialization failed: ${errorMsg}`
      };
    }
  }

  /**
   * Verify transaction status with Paystack
   * @param reference Transaction reference
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: this.getHeaders(),
        cache: 'no-store'
      });

      const json = await res.json();
      return json;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
      return {
        status: false,
        message: `Paystack verification failed: ${errorMsg}`
      };
    }
  }
}

