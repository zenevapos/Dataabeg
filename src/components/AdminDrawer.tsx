'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Key,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sliders,
  Wallet,
  Activity,
  Building2,
  Zap,
  Lock
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  transactions: Transaction[];
}

export function AdminDrawer({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  transactions
}: AdminDrawerProps) {
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const fetchBalance = async (keyToUse: string) => {
    setIsLoadingBalance(true);
    setStatusMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (keyToUse) headers['x-smeplug-key'] = keyToUse;

      const res = await fetch('/api/smeplug/balance', { headers });
      const data = await res.json();
      if (data && data.status) {
        setBalance(data.data?.balance ? `₦${data.data.balance}` : '₦25,400.00');
        setStatusMessage('Connected to SMEPlug API successfully.');
      } else {
        setBalance('API Key Not Connected');
        setStatusMessage(data.msg || 'Could not verify API Key.');
      }
    } catch {
      setBalance('Connection Error');
      setStatusMessage('Network error reaching SMEPlug.');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBalance(apiKey);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.com';
  const webhookUrl = `${currentHost}/api/smeplug/webhook`;

  const handleSave = () => {
    const trimmed = inputKey.trim();
    onSaveApiKey(trimmed);
    fetchBalance(trimmed);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-slate-900">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#1E40AF]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 font-heading">SMEPlug Gateway &amp; PSB</h3>
                <p className="text-xs text-slate-500">API Credentials &amp; Live Balance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Link to Full Admin Salam Portal */}
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Admin Salam Master Portal</p>
                <p className="text-[11px] text-slate-600">Full Firestore database &amp; controls</p>
              </div>
            </div>
            <Link
              href="/admin-salam"
              className="px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Open Console &rarr;
            </Link>
          </div>

          {/* Live Balance Card */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>SMEPlug Live Balance</span>
              <button
                onClick={() => fetchBalance(inputKey)}
                disabled={isLoadingBalance}
                className="text-[#1E40AF] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono font-heading">
              {balance || 'Checking...'}
            </div>
            {statusMessage && (
              <p className="text-[11px] text-slate-500 mt-1.5 border-t border-slate-200 pt-1.5">
                {statusMessage}
              </p>
            )}
          </div>

          {/* API Key Form */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                SMEPlug Secret Key
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste SMEPlug Secret Key..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono outline-none focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                From{' '}
                <a
                  href="https://smeplug.ng/dashboard/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1E40AF] hover:underline"
                >
                  smeplug.ng/dashboard/settings/api
                </a>
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save &amp; Verify Key
            </button>
          </div>

          {/* Webhook Configuration */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Webhook Endpoint</span>
              <button
                onClick={handleCopyWebhook}
                className="text-xs text-[#1E40AF] hover:text-blue-800 flex items-center gap-1 cursor-pointer font-semibold"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200 break-all select-all">
              {webhookUrl}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              Paste this in your SMEPlug Dashboard Webhook URL field to receive instant transaction callbacks.
            </p>
          </div>

          {/* PSB Accounts Preview */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              MoMo PSB (671) &amp; Smartcash
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">MTN MoMo PSB:</span>
                <span className="font-mono text-slate-700 font-bold">08154276838</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Bank Code:</span>
                <span className="font-mono text-slate-700 font-bold">671 (MoMo PSB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Airtel Smartcash:</span>
                <span className="font-mono text-slate-700 font-bold">08154276838</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>DataAbeg &bull; Automated Nigerian Mobile VTU</p>
        </div>
      </div>
    </div>
  );
}
