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

      const json = await res.json();
      
      // SMEPlug returns { balance: 0 } or { status: true, data: { balance: ... } }
      const balanceNum = typeof json.balance === 'number' 
        ? json.balance 
        : (json.data?.balance ? Number(json.data.balance) : 0);

      return {
        status: true,
        msg: 'Balance fetched successfully',
        data: {
          balance: Number(balanceNum).toLocaleString('en-NG', { minimumFractionDigits: 2 }),
          user: json.user || json.data?.user || {
            name: 'DataAbeg Merchant',
            email: 'admin@dataabeg.com'
          }
        }
      };
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
        let fallback = CURATED_DATA_PLANS;
        if (networkId) fallback = fallback.filter((p) => p.networkId === networkId);
        return { status: true, data: fallback };
      }

      const json = await res.json();
      
      const NETWORK_NAMES: Record<number, 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE'> = {
        1: 'MTN',
        2: 'AIRTEL',
        3: 'GLO',
        4: '9MOBILE'
      };

      // SMEPlug returns { status: true, data: { '1': [...], '2': [...], '3': [...], '4': [...] } } or array
      const rawList: any[] = [];
      if (json && json.data) {
        if (Array.isArray(json.data)) {
          rawList.push(...json.data);
        } else if (typeof json.data === 'object') {
          for (const [netKey, plans] of Object.entries(json.data)) {
            const netNum = Number(netKey);
            if (Array.isArray(plans)) {
              plans.forEach((p: any) => {
                rawList.push({
                  ...p,
                  network_id: netNum,
                  network: NETWORK_NAMES[netNum] || 'MTN'
                });
              });
            }
          }
        }
      }

      // Filter only active plans with positive price
      const activeRaw = rawList.filter((item) => Number(item.price) > 0);

      if (activeRaw.length > 0) {
        const parsedPlans: DataPlan[] = activeRaw.map((item) => {
          const planId = item.id || item.plan_id || 0;
          const cost = Number(item.price) || 250;
          // Clean competitive profit markup
          const markup = cost < 500 ? 50 : cost < 1500 ? 100 : cost < 3000 ? 150 : 250;
          const sellingPrice = cost + markup;
          const retailPrice = Math.round(sellingPrice * 1.35);
          const netId = (Number(item.network_id) || 1) as 1 | 2 | 3 | 4;
          const netName = (item.network?.toUpperCase() || NETWORK_NAMES[netId] || 'MTN') as 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
          const name = item.name || item.plan_name || 'Data Plan';
          const isCorporate = name.toUpperCase().includes('CORP') || name.toUpperCase().includes('CG');

          return {
            id: `smeplug-${planId}`,
            planId,
            networkId: netId,
            networkName: netName,
            name,
            category: isCorporate ? 'CORPORATE_GIFTING' : 'SME',
            categoryLabel: isCorporate ? '⚡ Corporate Gifting' : '🔥 SME Super Cheap',
            size: name.match(/\d+(\.\d+)?\s*(GB|MB)/i)?.[0] || '1GB',
            sizeInMB: 1024,
            validity: name.match(/(\d+\s*(Days?|Months?|Hours?|Day))/i)?.[0] || item.validity || '30 Days',
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

  /**
   * Dispatches instant airtime recharge to SMEPlug API
   */
  async purchaseAirtime(payload: { network_id: number; phone: string; amount: number; customer_reference?: string }): Promise<SMEPlugPurchaseResponse> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: `[Sandbox] Success! Recharged ₦${payload.amount} airtime to ${payload.phone}`,
        data: {
          reference: `AIR_${Date.now()}`,
          msg: `You have successfully recharged ₦${payload.amount} airtime to ${payload.phone}.`,
          current_status: 'successful'
        }
      };
    }

    try {
      const res = await fetch(`${SMEPLUG_BASE_URL}/airtime/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          network_id: Number(payload.network_id),
          phone: payload.phone,
          amount: Number(payload.amount),
          customer_reference: payload.customer_reference
        })
      });

      const json = await res.json();
      return json;
    } catch (error: unknown) {
      console.error('SMEPlug airtime API error:', error);
      return {
        status: false,
        msg: error instanceof Error ? error.message : 'Network error communicating with SMEPlug VTU Engine'
      };
    }
  }
}
