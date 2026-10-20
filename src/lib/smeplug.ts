import {
  SMEPlugBalanceResponse,
  SMEPlugPurchasePayload,
  SMEPlugPurchaseResponse,
  DataPlan
} from './types';
import { CURATED_DATA_PLANS } from './constants';

const SMEPLUG_BASE_URL = 'https://smeplug.ng/api/v1';

export class SMEPlugClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SMEPLUG_SECRET_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5 && !this.apiKey.includes('your_smeplug'));
  }

  /**
   * Retrieves account profile and wallet balance from SMEPlug
   */
  async getBalance(): Promise<SMEPlugBalanceResponse> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: 'Demo mode active. Add SMEPLUG_SECRET_KEY in settings to connect live.',
        data: {
          balance: '25,400.00',
          user: {
            name: 'DataAbeg Merchant',
            email: 'admin@dataabeg.com'
          }
        }
      };
    }

    try {
      const res = await fetch(`${SMEPLUG_BASE_URL}/account/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      const data = await res.json();
      return data;
    } catch (error: unknown) {
      console.error('SMEPlug getBalance error:', error);
      return {
        status: false,
        msg: error instanceof Error ? error.message : 'Failed to reach SMEPlug API'
      };
    }
  }

  /**
   * Fetches data plan catalogue from SMEPlug
   */
  async getDataPlans(networkId?: number): Promise<{ status: boolean; data: DataPlan[]; error?: string }> {
    if (!this.isConfigured()) {
      let filtered = CURATED_DATA_PLANS;
      if (networkId) {
        filtered = filtered.filter((p) => p.networkId === networkId);
      }
      return { status: true, data: filtered };
    }

    try {
      const res = await fetch(`${SMEPLUG_BASE_URL}/data/plans`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      });

      if (!res.ok) {
        // Fallback to curated high-margin plans if endpoint is slow
        let fallback = CURATED_DATA_PLANS;
        if (networkId) fallback = fallback.filter((p) => p.networkId === networkId);
        return { status: true, data: fallback };
      }

      const json = await res.json();
      if (json && json.status && Array.isArray(json.data)) {
        // Parse and enrich with selling price and retail savings
        const parsedPlans: DataPlan[] = json.data.map((item: {
          plan_id?: number | string;
          id?: number | string;
          network_id?: number;
          network?: string;
          plan_name?: string;
          name?: string;
          price?: number | string;
          validity?: string;
          type?: string;
        }) => {
          const planId = item.plan_id || item.id || 0;
          const cost = Number(item.price) || 250;
          const sellingPrice = Math.round(cost * 1.15); // +15% margin
          const retailPrice = 1000;
          const netId = (Number(item.network_id) || 1) as 1 | 2 | 3 | 4;
          const netName = (item.network?.toUpperCase() || 'MTN') as 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
          const name = item.plan_name || item.name || 'Data Plan';

          return {
            id: `smeplug-${planId}`,
            planId,
            networkId: netId,
            networkName: netName,
            name,
            category: (item.type?.toUpperCase().includes('CG') ? 'CORPORATE_GIFTING' : 'SME') as 'SME' | 'CORPORATE_GIFTING' | 'DIRECT',
            categoryLabel: item.type?.toUpperCase().includes('CG') ? '⚡ Corporate Gifting' : '🔥 SME Super Cheap',
            size: name.match(/\d+(\.\d+)?\s*(GB|MB)/i)?.[0] || '1GB',
            sizeInMB: 1024,
            validity: item.validity || '30 Days',
            costPrice: cost,
            sellingPrice,
            retailPrice,
            savingsPercentage: Math.max(10, Math.round(((retailPrice - sellingPrice) / retailPrice) * 100))
          };
        });

        let finalPlans = parsedPlans;
        if (networkId) {
          finalPlans = finalPlans.filter((p) => p.networkId === networkId);
        }
        return { status: true, data: finalPlans.length > 0 ? finalPlans : CURATED_DATA_PLANS };
      }

      return { status: true, data: CURATED_DATA_PLANS };
    } catch (err: unknown) {
      console.warn('SMEPlug plans error, falling back to curated plans:', err);
      let fallback = CURATED_DATA_PLANS;
      if (networkId) fallback = fallback.filter((p) => p.networkId === networkId);
      return { status: true, data: fallback };
    }
  }

  /**
   * Dispatches data purchase to SMEPlug API
   */
  async purchaseData(payload: SMEPlugPurchasePayload): Promise<SMEPlugPurchaseResponse> {
    if (!this.isConfigured()) {
      // Sandbox simulated response
      return {
        status: true,
        msg: `[Sandbox] Success! Transferred data to ${payload.phone}`,
        data: {
          reference: `SIM_${Date.now()}`,
          msg: `You have successfully transferred Data to ${payload.phone}.`,
          current_status: 'successful'
        }
      };
    }

    try {
      const res = await fetch(`${SMEPLUG_BASE_URL}/data/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          network_id: Number(payload.network_id),
          plan_id: payload.plan_id,
          phone: payload.phone,
          customer_reference: payload.customer_reference
        })
      });

      const json = await res.json();
      return json;
    } catch (error: unknown) {
      console.error('SMEPlug purchase API error:', error);
      return {
        status: false,
        msg: error instanceof Error ? error.message : 'Network error communicating with SMEPlug VTU Engine'
      };
    }
  }
}
