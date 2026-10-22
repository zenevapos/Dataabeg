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
  Info
} from 'lucide-react';

export default function WalletPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

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

  const virtualAccounts = [
    {
      bank: adminSettings.bankName || 'Moniepoint MFB',
      accountNumber: adminSettings.accountNumber || '08154276838',
      accountName: adminSettings.accountName || 'DataAbeg VTU Ventures',
      speed: 'Instant (30s)',
      key: 'moniepoint'
    },
    {
      bank: 'OPay Digital Services',
      accountNumber: '8154276838',
      accountName: adminSettings.accountName || 'DataAbeg VTU Ventures',
      speed: 'Instant (30s)',
      key: 'opay'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Fund Your DataAbeg Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Make a bank transfer to your dedicated account number below. Your wallet balance credits automatically within 30 seconds.
          </p>
        </div>

        {/* Current Balance */}
        <div className="flex items-center gap-2.5 bg-[#1e293b] text-white px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
          <Wallet className="w-4 h-4 text-amber-400" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">BALANCE</div>
            <div className="text-sm font-extrabold text-amber-400">
              ₦{(profile?.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button
            onClick={() => refreshProfile()}
            className="p-1 hover:text-amber-300 transition-colors cursor-pointer ml-1"
            title="Refresh balance"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Virtual Account Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Dedicated Automated Transfer Accounts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {virtualAccounts.map((acc) => (
            <div
              key={acc.key}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>{acc.bank}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {acc.speed}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      ACCOUNT NUMBER
                    </div>
                    <div className="text-lg font-black font-mono tracking-wider text-slate-900">
                      {acc.accountNumber}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(acc.accountNumber, acc.key)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
                  >
                    {copiedAccount === acc.key ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="text-slate-400">Account Name:</span>{' '}
                  <span className="font-bold text-slate-800">{acc.accountName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Auto-credited via direct webhook. No manual approval needed.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>How Automated Wallet Funding Works</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <div className="font-bold text-slate-900 pt-1">Copy Account Number</div>
            <p className="leading-relaxed">
              Open your banking app (GTBank, Access, Zenith, OPay, PalmPay, Kuda, etc.) and initiate a bank transfer.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <div className="font-bold text-slate-900 pt-1">Transfer Any Amount</div>
            <p className="leading-relaxed">
              Transfer your desired amount (e.g. ₦1,000, ₦5,000, ₦20,000). Ensure the beneficiary matches the account name.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <div className="font-bold text-slate-900 pt-1">Instant Auto-Credit</div>
            <p className="leading-relaxed">
              Our automated banking switch detects the credit in 30 seconds and your wallet updates instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
