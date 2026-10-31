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
  Smartphone,
  X,
  AlertCircle,
  CheckCircle2,
  Lock
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

  const userFullName = profile?.displayName || user?.displayName || 'DataAbeg User';
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
                setFundSuccess(`🎉 Successfully credited ₦${amountToFund.toLocaleString()} to your wallet!`);
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

  const hasManualSettlementBank = Boolean(
    adminSettings.accountNumber && adminSettings.accountNumber.trim().length > 5
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Top Total Balance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <span>Total wallet balance</span>
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
            className="px-5 py-2.5 rounded-full bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>+ Add money</span>
          </button>
          <a
            href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://wa.me/2348154276838?text=Hello%20DataAbeg%20Support'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Support
          </a>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WALLET SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: DataAbeg Wallet Pass & Verified Phone */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            DataAbeg Wallet Pass
          </div>

          {/* Authentic DataAbeg Wallet Pass Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-slate-950/20 aspect-[1.58/1] flex flex-col justify-between border border-slate-800">
            {/* Top Pass Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#4f46e5] flex items-center justify-center text-xs font-black shadow-xs">
                  DA
                </div>
                <span className="font-bold text-sm tracking-tight font-space">DataAbeg Wallet</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active</span>
              </div>
            </div>

            {/* Middle Balance Section */}
            <div className="my-auto space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Available Vending Balance
              </div>
              <div className="text-2xl sm:text-3xl font-black font-space tracking-tight text-white">
                {showBalance ? `₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '••••••••'}
              </div>
            </div>

            {/* Bottom Pass Row */}
            <div className="flex items-end justify-between pt-3 border-t border-slate-800/80">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Account Holder</div>
                <div className="text-xs font-bold tracking-wide uppercase truncate max-w-[140px] text-slate-200">
                  {userFullName}
                </div>
              </div>

              <button
                onClick={() => setIsAddMoneyOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-600 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Top-up</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Registered Phone Verification Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
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
                        ? localStorage.getItem('dataabeg_phone') || ''
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

        {/* RIGHT COLUMN: Automated Online Funding & Dynamic Bank Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Automated Wallet Funding
          </div>

          {/* Instant Online Funding Card (Powered by Paystack) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:border-indigo-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 font-space flex items-center gap-2">
                    <span>Instant Automated Top-Up</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Live Gateway
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Powered by Paystack • Instant balance crediting in 5 seconds
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full self-start sm:self-auto">
                0% Transaction Fee
              </span>
            </div>

            {/* Quick Payment Channels Supported */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">💳</span>
                <span className="font-bold text-slate-900 block text-[11px]">Debit Cards</span>
                <span className="text-[10px] text-slate-400">Mastercard, Visa, Verve</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">🏦</span>
                <span className="font-bold text-slate-900 block text-[11px]">Pay with Transfer</span>
                <span className="text-[10px] text-slate-400">Dynamic Bank Account</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">📱</span>
                <span className="font-bold text-slate-900 block text-[11px]">USSD Banking</span>
                <span className="text-[10px] text-slate-400">All Major Nigerian Banks</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">⚡</span>
                <span className="font-bold text-slate-900 block text-[11px]">OPay &amp; QR</span>
                <span className="text-[10px] text-slate-400">Instant One-Tap Credit</span>
              </div>
            </div>

            {/* Embedded Quick Top-up Amount Form */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Select Top-Up Amount</span>
                <span className="text-indigo-600 font-normal text-[11px]">Minimum: ₦100</span>
              </div>

              {/* Amount Preset Chips */}
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
                        ? 'bg-[#4f46e5] text-white shadow-xs scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom Input & Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
                <div className="relative flex-1">
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
                    placeholder="Enter custom amount"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#4f46e5] text-sm font-bold text-slate-900 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePaystackFunding}
                  disabled={isFunding || fundAmount < 100}
                  className="px-6 py-3 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isFunding ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Opening Paystack...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Fund ₦{fundAmount.toLocaleString()} Now</span>
                    </>
                  )}
                </button>
              </div>

              {fundError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{fundError}</span>
                </div>
              )}

              {fundSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fundSuccess}</span>
                </div>
              )}
            </div>
          </div>

          {/* Manual Company Bank Settlement (Rendered ONLY if admin configured it) */}
          {hasManualSettlementBank && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{adminSettings.bankName}</div>
                    <div className="text-[10px] text-slate-400">{adminSettings.accountName}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Manual Bank Transfer
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Settlement Account Number</div>
                  <div className="text-base font-black font-mono tracking-wider text-slate-900">
                    {adminSettings.accountNumber}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(adminSettings.accountNumber || '', 'settlement')}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-semibold"
                  title="Copy Account Number"
                >
                  {copiedAccount === 'settlement' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Note: Transfers to this manual bank account require payment receipt confirmation. For instant 5-second automatic wallet crediting, use the Paystack Online Top-Up above.
              </p>
            </div>
          )}

          {/* Security & Verification Callout */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">100% Secure &amp; PCI-DSS Certified</div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                All transactions are processed over encrypted TLS 1.3 connections by Paystack. Your card details are never stored on DataAbeg servers. Wallets are credited automatically the exact moment payment is confirmed.
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

      {/* Full Modal Popup for Add Money */}
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
                    Supports Mastercard, Visa, Verve, USSD, Bank Transfer &amp; OPay
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
