import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
import {
  GladTidingsBalanceResponse,
  MeterValidationResponse,
  ElectricityPaymentResponse,
  CableValidationResponse,
  CableSubscriptionResponse
} from './types';

const GLADTIDINGS_BASE_URL = (
  process.env.GLADTIDINGS_BASE_URL || 'https://www.gladtidingsdata.com'
).trim().replace(/\/+$/, '');

function getProxyUrl(): string {
  return (process.env.FIXIE_URL || process.env.GLADTIDINGS_PROXY_URL || '').trim();
}

export function isGladTidingsProxyConfigured(): boolean {
  return Boolean(getProxyUrl());
}

function safeParseJson(rawText: string, status: number): unknown {
  if (!rawText) return { error: `HTTP ${status}` };
  try {
    return JSON.parse(rawText);
  } catch {
    return { error: rawText || `HTTP ${status}` };
  }
}

async function gladtidingsRequest(
  url: string,
  options: {
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    body?: string;
  }
): Promise<{ ok: boolean; status: number; json: any; rawText: string }> {
  const proxyUrlStr = getProxyUrl();

  if (!proxyUrlStr) {
    const res = await fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      cache: 'no-store'
    });
    const rawText = await res.text();
    const json = safeParseJson(rawText, res.status);
    return {
      ok: res.ok,
      status: res.status,
      json,
      rawText
    };
  }

  const proxy = new URL(proxyUrlStr);
  const target = new URL(url);
  const proxyPort = proxy.port
    ? Number(proxy.port)
    : proxy.protocol === 'https:'
      ? 443
      : 80;
  const targetPort = target.port
    ? Number(target.port)
    : target.protocol === 'https:'
      ? 443
      : 80;

  const proxyAuth =
    proxy.username || proxy.password
      ? `Basic ${Buffer.from(
          `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`
        ).toString('base64')}`
      : undefined;

  const reqHeaders: Record<string, string> = {
    ...options.headers,
    Accept: 'application/json',
    'Accept-Encoding': 'identity',
    'User-Agent': 'DataAbeg-Server/1.0'
  };
  if (options.body !== undefined) {
    reqHeaders['Content-Length'] = String(Buffer.byteLength(options.body, 'utf8'));
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finishResolve = (val: { ok: boolean; status: number; json: any; rawText: string }) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };
    const finishReject = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    const readResponse = (res: http.IncomingMessage, cleanupSocket?: { destroy: () => void }) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        const rawText = Buffer.concat(chunks).toString('utf8');
        const json = safeParseJson(rawText, status);
        finishResolve({
          ok: status >= 200 && status < 300,
          status,
          json,
          rawText
        });
      });
      res.on('error', (err) => {
        cleanupSocket?.destroy();
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });
    };

    if (target.protocol === 'http:') {
      if (proxyAuth) {
        reqHeaders['Proxy-Authorization'] = proxyAuth;
      }
      const reqModule = proxy.protocol === 'https:' ? https : http;
      const req = reqModule.request(
        {
          hostname: proxy.hostname,
          port: proxyPort,
          path: target.toString(),
          method: options.method,
          headers: reqHeaders,
          agent: false
        },
        (res) => readResponse(res)
      );
      req.setTimeout(25000, () => {
        req.destroy(new Error('Glad Tidings proxied request timed out'));
      });
      req.on('error', (err) => {
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });
      if (options.body !== undefined) {
        req.write(options.body);
      }
      req.end();
      return;
    }

    const connectHeaders: Record<string, string> = {
      Host: `${target.hostname}:${targetPort}`
    };
    if (proxyAuth) {
      connectHeaders['Proxy-Authorization'] = proxyAuth;
    }

    const connectModule = proxy.protocol === 'https:' ? https : http;
    const connectReq = connectModule.request({
      hostname: proxy.hostname,
      port: proxyPort,
      method: 'CONNECT',
      path: `${target.hostname}:${targetPort}`,
      headers: connectHeaders,
      agent: false
    });

    connectReq.setTimeout(15000, () => {
      connectReq.destroy(new Error('Proxy CONNECT timed out'));
    });

    connectReq.on('error', (err) => {
      finishReject(err instanceof Error ? err : new Error(String(err)));
    });

    connectReq.on('connect', (proxyRes, socket) => {
      socket.on('error', (err) => {
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });

      if (proxyRes.statusCode !== 200) {
        socket.destroy();
        finishReject(new Error(`Proxy CONNECT failed (HTTP ${proxyRes.statusCode ?? 'unknown'})`));
        return;
      }

      const tlsSocket = tls.connect({
        socket,
        servername: target.hostname
      });

      tlsSocket.on('error', (err) => {
        socket.destroy();
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });

      const req = https.request(
        {
          hostname: target.hostname,
          port: targetPort,
          path: `${target.pathname}${target.search}`,
          method: options.method,
          headers: reqHeaders,
          agent: false,
          createConnection: () => tlsSocket
        },
        (res) => readResponse(res, tlsSocket)
      );

      req.setTimeout(25000, () => {
        req.destroy(new Error('Glad Tidings proxied HTTPS request timed out'));
        tlsSocket.destroy();
      });

      req.on('error', (err) => {
        tlsSocket.destroy();
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });

      if (options.body !== undefined) {
        req.write(options.body);
      }
      req.end();
    });

    connectReq.end();
  });
}

export function extractErrorMessage(input: unknown, defaultMessage = 'Transaction could not be processed'): string {
  if (!input) return defaultMessage;
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    const joined = input
      .map(item => extractErrorMessage(item, ''))
      .filter(Boolean)
      .join(', ');
    return joined || defaultMessage;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    const candidate =
      obj.api_response ||
      obj.msg ||
      obj.message ||
      obj.error ||
      obj.detail ||
      obj.non_field_errors;
    if (candidate && candidate !== input) {
      return extractErrorMessage(candidate, defaultMessage);
    }
    const parts: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (key !== 'status' && key !== 'Status' && key !== 'data') {
        const str = extractErrorMessage(val, '');
        if (str) parts.push(`${key}: ${str}`);
      }
    }
    if (parts.length > 0) return parts.join(' | ');
    try {
      return JSON.stringify(input);
    } catch {
      return defaultMessage;
    }
  }
  return String(input);
}

export class GladTidingsClient {
  private token: string;

  constructor(customToken?: string) {
    this.token =
      customToken ||
      process.env.GLADTIDINGS_API_TOKEN ||
      process.env.NEXT_PUBLIC_GLADTIDINGS_TOKEN ||
      '';
  }

  public isConfigured(): boolean {
    return Boolean(this.token && this.token.trim().length > 10 && !this.token.includes('your_token'));
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Token ${this.token.trim()}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Retrieves merchant wallet balance and user profile from Glad Tidings
   */
  async getBalance(): Promise<GladTidingsBalanceResponse> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: 'Demo mode active. Add GLADTIDINGS_API_TOKEN to connect live.',
        data: {
          balance: '50,000.00',
          user: {
            username: 'DataAbeg Merchant',
            email: 'admin@dataabeg.com',
            user_type: 'API User'
          }
        }
      };
    }

    try {
      const res = await gladtidingsRequest(`${GLADTIDINGS_BASE_URL}/api/user/`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const json = res.json;

      if (!res.ok) {
        return {
          status: false,
          msg: json.detail || json.message || 'Failed to fetch Glad Tidings balance.'
        };
      }

      const balance = json.user?.Account_Balance ?? json.user?.wallet_balance ?? 0;

      return {
        status: true,
        msg: 'Balance fetched successfully',
        data: {
          balance,
          user: json.user
        }
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      return {
        status: false,
        msg: `Glad Tidings connection error: ${errorMsg}`
      };
    }
  }

  /**
   * Purchases Data Bundle via Glad Tidings API
   * POST /api/data/
   */
  async purchaseData(payload: {
    network: number;
    mobile_number: string;
    plan: number | string;
    Ported_number?: boolean;
  }): Promise<{ status: boolean; msg: string; data?: any }> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: '[Sandbox Demo] Data bundle simulated successfully.',
        data: {
          ident: `DEMO_${Date.now()}`,
          Status: 'successful',
          plan_name: 'Simulated Bundle'
        }
      };
    }

    try {
      const res = await gladtidingsRequest(`${GLADTIDINGS_BASE_URL}/api/data/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          network: Number(payload.network),
          mobile_number: payload.mobile_number,
          plan: Number(payload.plan),
          Ported_number: payload.Ported_number !== false
        })
      });

      const json = res.json;

      const isSuccess =
        res.ok &&
        (json.Status === 'successful' ||
          json.status === 'successful' ||
          json.status === true ||
          (json.id && json.Status !== 'failed'));

      if (isSuccess) {
        return {
          status: true,
          msg: json.api_response || 'Data sent successfully.',
          data: {
            ...json,
            reference: json.ident || String(json.id)
          }
        };
      }

      const errorMsg = extractErrorMessage(
        json.api_response ||
        json.error ||
        json.detail ||
        json.message ||
        json,
        'Transaction was not successful on the telecom network.'
      );

      return {
        status: false,
        msg: errorMsg,
        data: json
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown gateway error';
      return {
        status: false,
        msg: `Glad Tidings API Error: ${errorMsg}`
      };
    }
  }

  /**
   * Purchases Airtime via Glad Tidings API
   * POST /api/topup/
   */
  async purchaseAirtime(payload: {
    network: number;
    amount: number;
    mobile_number: string;
    airtime_type?: 'VTU' | 'Share and Sell';
    Ported_number?: boolean;
  }): Promise<{ status: boolean; msg: string; data?: any }> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: '[Sandbox Demo] Airtime top-up simulated successfully.',
        data: {
          ident: `AIRTIME_${Date.now()}`,
          Status: 'successful'
        }
      };
    }

    try {
      const res = await gladtidingsRequest(`${GLADTIDINGS_BASE_URL}/api/topup/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          network: Number(payload.network),
          amount: Number(payload.amount),
          mobile_number: payload.mobile_number,
          Ported_number: payload.Ported_number !== false,
          airtime_type: payload.airtime_type || 'VTU'
        })
      });

      const json = res.json;
      const isSuccess =
        res.ok &&
        (json.Status === 'successful' ||
          json.status === 'successful' ||
          (json.id && json.Status !== 'failed'));

      if (isSuccess) {
        return {
          status: true,
          msg: 'Airtime recharge successful.',
          data: {
            ...json,
            reference: json.ident || String(json.id)
          }
        };
      }

      return {
        status: false,
        msg: extractErrorMessage(json.error || json.detail || json.message || json, 'Airtime top-up failed.'),
        data: json
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Airtime request failed';
      return {
        status: false,
        msg: `Glad Tidings Airtime Error: ${errorMsg}`
      };
    }
  }

  /**
   * Validates Electricity Meter Number
   * GET /api/v2/validatemeter/?disco_id={id}&meter_type={prepaid/postpaid}&meter_number={number}
   */
  async validateMeter(
    discoId: number,
    meterType: 'Prepaid' | 'Postpaid',
    meterNumber: string
  ): Promise<MeterValidationResponse> {
    if (!this.isConfigured()) {
      return {
        invalid: false,
        name: 'DEMO CUSTOMER (TEST METER)',
        address: '14 Marina St, Lagos, Nigeria'
      };
    }

    try {
      const url = `${GLADTIDINGS_BASE_URL}/api/v2/validatemeter/?disco_id=${discoId}&meter_type=${meterType.toLowerCase()}&meter_number=${encodeURIComponent(meterNumber.trim())}`;
      const res = await gladtidingsRequest(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const json = res.json;

      if (json.invalid === true || json.name === 'INVALID' || !json.name) {
        return {
          invalid: true,
          error: extractErrorMessage(json.detail || json.message || json.error || json, 'Invalid meter number. Please verify with your Disco.')
        };
      }

      return {
        invalid: false,
        name: json.name,
        address: json.address || 'Address on file'
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Meter verification error';
      return {
        invalid: true,
        error: errorMsg
      };
    }
  }

  /**
   * Recharges Electricity Meter
   * POST /api/billpayment/
   */
  async rechargeMeter(payload: {
    disco_name: number; // Disco ID
    amount: number;
    meter_number: string;
    MeterType: 'Prepaid' | 'Postpaid';
    Customer_Phone: string;
    customer_name?: string;
    customer_address?: string;
  }): Promise<ElectricityPaymentResponse> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: 'Electricity token generated successfully (Demo Mode)',
        token: '4829-1940-5829-1049-5830',
        data: {
          ident: `ELEC_${Date.now()}`,
          token: 'Token : 4829 1940 5829 1049 5830',
          Status: 'successful',
          amount: payload.amount,
          meter_number: payload.meter_number
        }
      };
    }

    try {
      const res = await gladtidingsRequest(`${GLADTIDINGS_BASE_URL}/api/billpayment/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          disco_name: Number(payload.disco_name),
          amount: Number(payload.amount),
          meter_number: payload.meter_number,
          MeterType: payload.MeterType,
          Customer_Phone: payload.Customer_Phone,
          customer_name: payload.customer_name || 'Customer',
          customer_address: payload.customer_address || 'Customer Address'
        })
      });

      const json = res.json;

      const isSuccess =
        res.ok &&
        (json.Status === 'successful' ||
          json.status === 'successful' ||
          (json.id && json.Status !== 'failed'));

      if (isSuccess) {
        // Extract token string
        let cleanToken = json.token || '';
        if (cleanToken.toLowerCase().startsWith('token :')) {
          cleanToken = cleanToken.replace(/token\s*:\s*/i, '').trim();
        }

        return {
          status: true,
          msg: 'Electricity payment confirmed and token generated.',
          token: cleanToken || json.token,
          data: {
            ...json,
            token: cleanToken || json.token
          }
        };
      }

      return {
        status: false,
        msg: extractErrorMessage(json.error || json.detail || json.message || json, 'Electricity bill payment failed.'),
        data: json
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Electricity request failed';
      return {
        status: false,
        msg: `Electricity payment error: ${errorMsg}`
      };
    }
  }

  /**
   * Validates Cable TV Smartcard / IUC Number
   * GET /api/v2/validateiuc/?cable_id={id}&smart_card_number={number}
   */
  async validateSmartCard(
    cableId: number,
    smartCardNumber: string
  ): Promise<CableValidationResponse> {
    if (!this.isConfigured()) {
      return {
        invalid: false,
        name: 'DEMO SUBSCRIBER'
      };
    }

    try {
      const url = `${GLADTIDINGS_BASE_URL}/api/v2/validateiuc/?cable_id=${cableId}&smart_card_number=${encodeURIComponent(smartCardNumber.trim())}`;
      const res = await gladtidingsRequest(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const json = res.json;

      if (json.invalid === true || !json.name) {
        return {
          invalid: true,
          error: extractErrorMessage(json.detail || json.message || json.error || json, 'Invalid smartcard number.')
        };
      }

      return {
        invalid: false,
        name: json.name
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Smartcard verification error';
      return {
        invalid: true,
        error: errorMsg
      };
    }
  }

  /**
   * Subscribes to Cable TV Package
   * POST /api/cablesub/
   */
  async subscribeCable(payload: {
    cablename: number;
    cableplan: number;
    smart_card_number: string;
  }): Promise<CableSubscriptionResponse> {
    if (!this.isConfigured()) {
      return {
        status: true,
        msg: 'Cable TV renewed successfully (Demo Mode)',
        data: {
          ident: `CABLE_${Date.now()}`,
          Status: 'successful',
          smart_card_number: payload.smart_card_number
        }
      };
    }

    try {
      const res = await gladtidingsRequest(`${GLADTIDINGS_BASE_URL}/api/cablesub/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          cablename: Number(payload.cablename),
          cableplan: Number(payload.cableplan),
          smart_card_number: payload.smart_card_number
        })
      });

      const json = res.json;

      const isSuccess =
        res.ok &&
        (json.Status === 'successful' ||
          json.status === 'successful' ||
          (json.id && json.Status !== 'failed'));

      if (isSuccess) {
        return {
          status: true,
          msg: 'Cable subscription activated successfully.',
          data: json
        };
      }

      return {
        status: false,
        msg: extractErrorMessage(json.error || json.detail || json.message || json, 'Cable subscription failed.'),
        data: json
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Cable request failed';
      return {
        status: false,
        msg: `Cable activation error: ${errorMsg}`
      };
    }
  }
}
