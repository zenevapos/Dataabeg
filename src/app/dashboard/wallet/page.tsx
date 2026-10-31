'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { getAdminSettings, AdminSettings, DEFAULT_ADMIN_SETTINGS } from '@/lib/firebaseDb';
import { formatCurrency, generateTxReference } from '@/lib/utils';
import { getPaystackPublicKey } from '@/lib/paystack';
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
  Share2,
  Smartphone,
  X,
  AlertCircle
} from 'lucide-react';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';

function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).PaystackPop) return resolve(true);
    const existing = document.getElementById('paystack-inline-js');
    if (existing) return resolve(true);
    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function WalletPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(2000);
  const [customFundInput, setCustomFundInput] = useState<string>('2000');
  const [isFunding, setIsFunding] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [fundSuccess, setFundSuccess] = useState<string | null>(null);

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

  const handlePaystackFunding = async () => {
    if (!user) return;
    const amountToFund = fundAmount;
    if (amountToFund < 100) {
      setFundError('Minimum funding amount is ₦100');
      return;
    }
    setIsFunding(true);
    setFundError(null);
    setFundSuccess(null);

    const txRef = generateTxReference('FUND');
    const customerEmail = user.email || `${user.uid.slice(0, 8)}@dataabeg.com`;
    const publicKey = adminSettings.paystackPublicKey || getPaystackPublicKey();

    const metadata = {
      type: 'wallet_funding',
      uid: user.uid,
      amount: amountToFund
    };

    try {
      const hasScript = await loadPaystackScript();
      if (hasScript && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          key: publicKey,
          email: customerEmail,
          amount: Math.round(amountToFund * 100),
          ref: txRef,
          metadata,
          callback: async (response: { reference: string }) => {
            try {
              const verifyRes = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: response.reference })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.status) {
                setFundSuccess(`🎉 Successfully added ₦${amountToFund.toLocaleString()} to your wallet!`);
                await refreshProfile();
                try {
                  confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
                } catch {}
                setTimeout(() => {
                  setIsAddMoneyOpen(false);
                  setFundSuccess(null);
                }, 2000);
              } else {
                setFundError(verifyData.message || 'Payment received, updating your balance...');
                await refreshProfile();
              }
            } catch (err: any) {
              setFundError(err.message || 'Error confirming transaction with gateway.');
            } finally {
              setIsFunding(false);
            }
          },
          onClose: () => {
            setIsFunding(false);
          }
        });
        handler.openIframe();
      } else {
        const initRes = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountToFund,
            email: customerEmail,
            reference: txRef,
            metadata,
            callback_url: window.location.href
          })
        });
        const initData = await initRes.json();
        if (initRes.ok && initData.data?.authorization_url) {
          window.location.href = initData.data.authorization_url;
        } else {
          throw new Error(initData.message || 'Failed to initialize Paystack');
        }
      }
    } catch (err: any) {
      setFundError(err.message || 'Failed to start payment');
      setIsFunding(false);
    }
  };

  const virtualAccounts = [
    {
      bank: adminSettings.bankName || 'Moniepoint MFB',
      accountNumber: adminSettings.accountNumber || '1855365255',
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
            onClick={() => setIsAddMoneyOpen(true)}
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

          {/* Registered Phone Verification Card */}
          <div className="mt-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Verified Mobile Line
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1.5 mt-0.5">
                  <span>
                    {profile?.phoneNumber ||
                      (typeof window !== 'undefined'
                        ? localStorage.getItem('dataabeg_phone') !== '08154276838'
                          ? localStorage.getItem('dataabeg_phone')
                          : ''
                        : '') ||
                      'No phone added yet'}
                  </span>
                  {profile?.phoneVerified && (
                    <span title="Verified via WhatsApp" className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditPhoneOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Update Phone
            </button>
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

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={isEditPhoneOpen}
        onClose={() => setIsEditPhoneOpen(false)}
        initialPhone={profile?.phoneNumber || ''}
        onSuccess={() => refreshProfile()}
      />

      {/* Add Money / Paystack Funding Modal */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-900">
            <button
              onClick={() => {
                setIsAddMoneyOpen(false);
                setFundError(null);
                setFundSuccess(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading">Add Money to Wallet</h3>
                <p className="text-xs text-slate-500">Instant credit via Paystack Live Gateway</p>
              </div>
            </div>

            {fundSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <p className="text-sm font-bold text-slate-900">{fundSuccess}</p>
                <p className="text-xs text-slate-500">Your DataAbeg wallet balance has been updated.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Amount presets */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 2000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setFundAmount(amt);
                          setCustomFundInput(amt.toString());
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          fundAmount === amt
                            ? 'bg-[#4f46e5] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Or Enter Custom Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₦
                    </span>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={customFundInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomFundInput(val);
                        setFundAmount(Number(val) || 0);
                      }}
                      placeholder="e.g. 3500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#4f46e5] text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {fundError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{fundError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePaystackFunding}
                    disabled={isFunding || fundAmount < 100}
                    className="w-full py-3 px-4 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isFunding ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Opening Paystack...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₦{fundAmount.toLocaleString()} with Paystack</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Supports Mastercard, Visa, Verve, USSD, Bank Transfer &amp; Apple Pay
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
