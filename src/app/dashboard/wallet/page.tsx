'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAdminSettings, AdminSettings, DEFAULT_ADMIN_SETTINGS } from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  RefreshCw,
  Clock,
  ArrowRight,
  Info,
  CreditCard,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ArrowDownLeft,
  Share2
} from 'lucide-react';

export default function WalletPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    getAdminSettings()
      .then((s) => setAdminSettings(s))
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(key);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const userFullName = profile?.displayName || user?.displayName || 'Imamshaffy Bello';
  const balance = profile?.walletBalance || 0;

  const virtualAccounts = [
    {
      bank: adminSettings.bankName || 'Moniepoint MFB',
      accountNumber: adminSettings.accountNumber || '08154276838',
      accountName: adminSettings.accountName || 'DataAbeg VTU Ventures',
      speed: 'Instant (30s)',
      key: 'moniepoint',
      logo: '🏦'
    },
    {
      bank: 'OPay Digital Services',
      accountNumber: '8154276838',
      accountName: adminSettings.accountName || 'DataAbeg VTU Ventures',
      speed: 'Instant (30s)',
      key: 'opay',
      logo: '📱'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Top Total Balance Header (Raenest Mobile & Web Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <span>Total balance</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              {showBalance ? `₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '••••••••'}
            </h1>
            <button
              onClick={() => refreshProfile()}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Refresh Balance"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(adminSettings.accountNumber || '08154276838', 'top')}
            className="px-4 py-2.5 rounded-full bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>+ Add money</span>
          </button>
          <a
            href="https://wa.me/2348154276838?text=Hello%20DataAbeg%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Support
          </a>
        </div>
      </div>

      {/* RAENEST CARDS PREVIEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Raenest Virtual Card (Screenshot 4 Style) */}
        <div className="lg:col-span-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Virtual Card
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#1e293b] p-6 text-white shadow-xl shadow-indigo-950/20 aspect-[1.58/1] flex flex-col justify-between">
            {/* Top Card Row */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-slate-300">
                Virtual Card
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#4f46e5] flex items-center justify-center text-[10px] font-black">
                  D
                </div>
                <span className="font-bold text-sm tracking-tight">dataabeg</span>
              </div>
            </div>

            {/* Middle Chip & Number */}
            <div className="space-y-2 my-auto">
              <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300/40"></div>
              <div className="font-mono text-base tracking-widest text-slate-200 font-semibold">
                •••• •••• •••• {user?.uid ? user.uid.slice(-4) : '4912'}
              </div>
            </div>

            {/* Bottom Card Row */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Cardholder</div>
                <div className="text-xs font-bold tracking-wide uppercase truncate max-w-[140px]">
                  {userFullName}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Mastercard-style overlapping circles */}
                <div className="w-6 h-6 rounded-full bg-[#eb001b] opacity-90 -mr-3"></div>
                <div className="w-6 h-6 rounded-full bg-[#f79e1b] opacity-90"></div>
              </div>
            </div>
          </div>
        </div>

        {/* All Accounts (Raenest Screenshot 2 & 3 Style) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            All Dedicated Accounts
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {virtualAccounts.map((acc) => (
              <div
                key={acc.key}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{acc.logo}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{acc.bank}</div>
                      <div className="text-[10px] text-slate-400">{acc.accountName}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {acc.speed}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Dedicated Account No.</div>
                    <div className="text-base font-black font-mono tracking-wider text-slate-900">
                      {acc.accountNumber}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(acc.accountNumber, acc.key)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                    title="Copy Account Number"
                  >
                    {copiedAccount === acc.key ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Fee: 0% Free</span>
                  <span className="font-semibold text-indigo-600">Auto-credits wallet</span>
                </div>
              </div>
            ))}
          </div>

          {/* Transfer Instructions Callout */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">How Instant Funding Works</div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Open your Nigerian banking app (OPay, PalmPay, Kuda, GTBank, Zenith, Access, etc.), transfer to your dedicated Moniepoint or OPay account number above. Your DataAbeg balance updates automatically within 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
