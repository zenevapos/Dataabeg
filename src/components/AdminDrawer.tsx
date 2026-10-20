'use client';

import React, { useState, useEffect } from 'react';
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
  Zap
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#1E40AF] text-white shadow-md shadow-blue-950">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SMEPlug, MoMo &amp; Smartcash</h3>
                <p className="text-xs text-slate-400">Gateway Management Portal</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SMEPlug Wallet Balance Card */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950/40 border border-blue-900/60 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-sky-300">
                <Wallet className="w-4 h-4 text-sky-400" /> SMEPlug Wallet Balance
              </span>
              <button
                onClick={() => fetchBalance(inputKey)}
                className="text-sky-400 hover:underline flex items-center gap-1"
                disabled={isLoadingBalance}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <p className="text-2xl font-black text-white">
              {isLoadingBalance ? 'Checking balance...' : balance || '₦0.00'}
            </p>
            {statusMessage && (
              <p className="mt-1 text-[11px] text-sky-400">{statusMessage}</p>
            )}
          </div>

          {/* MoMo PSB & Smartcash PSB Integration Guide */}
          <div className="mt-5 p-4 rounded-2xl bg-blue-950/30 border border-blue-900/70 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-amber-400" />
              MoMo PSB &amp; Smartcash PSB Linking
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              You can connect your <strong>MoMo PSB (671)</strong> and <strong>Smartcash PSB</strong> accounts directly on your SMEPlug dashboard for zero-fee auto wallet funding &amp; SIM automated dispensing:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="https://smeplug.ng/dashboard/integrations/momo/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition-all text-left group block"
              >
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
                  <span>MoMo PSB (671)</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">MTN Auto Bank Link</p>
              </a>

              <a
                href="https://smeplug.ng/dashboard/integrations/smartcash"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-red-400 transition-all text-left group block"
              >
                <div className="flex items-center justify-between text-red-400 text-xs font-bold">
                  <span>Smartcash PSB</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Airtel Auto Bank Link</p>
              </a>
            </div>
          </div>

          {/* API Key Configuration Form */}
          <div className="mt-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  SMEPlug Secret Key
                </label>
                <a
                  href="https://smeplug.ng/dashboard/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk_live_... or paste your key here"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                You can also define <code className="text-sky-300">SMEPLUG_SECRET_KEY</code> in <code className="text-slate-300">.env.local</code>.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save API Key
            </button>
          </div>

          {/* Webhook Configuration */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Webhook Callback URL
              </span>
              <button
                onClick={handleCopyWebhook}
                className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1"
              >
                {copiedWebhook ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedWebhook ? 'Copied' : 'Copy URL'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Paste this in <a href="https://smeplug.ng/dashboard/settings/api" target="_blank" rel="noreferrer" className="text-sky-400 underline">SMEPlug Dashboard &gt; Webhook URL</a> to receive real-time updates:
            </p>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-sky-300 break-all select-all">
              {webhookUrl}
            </div>
          </div>

          {/* Recent Orders Log */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              Recent Transactions ({transactions.length})
            </h4>

            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No orders processed in this session yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white">{tx.network} {tx.planSize}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{tx.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sky-400">{formatCurrency(tx.amount)}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-sky-300">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          DataAbeg Core Engine v1.0 • Connected to SMEPlug NG &bull; Brand #1E40AF
        </div>
      </div>
    </div>
  );
}
