import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NETWORKS } from './constants';
import { NetworkInfo } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes phone numbers to standard 11 digits format (e.g. 08031234567)
 */
export function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('234') && cleaned.length >= 13) {
    cleaned = '0' + cleaned.slice(3);
  }
  if (cleaned.startsWith('234') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Validates whether string is a valid Nigerian mobile phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 11) return false;
  return /^(070|080|081|090|091)\d{8}$/.test(normalized);
}

/**
 * Automatically detects the mobile network operator from the phone number prefix
 */
export function detectNetworkFromPhone(phone: string): NetworkInfo | null {
  const normalized = normalizePhone(phone);
  if (normalized.length < 4) return null;

  for (const net of NETWORKS) {
    for (const prefix of net.prefixes) {
      if (normalized.startsWith(prefix)) {
        return net;
      }
    }
  }
  return null;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('NGN', '₦').trim();
}

export function generateTxReference(prefix = 'DABG'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
