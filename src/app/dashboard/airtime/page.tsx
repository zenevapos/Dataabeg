'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NETWORKS } from '@/lib/constants';
import { formatCurrency, isValidNigerianPhone, normalizePhone } from '@/lib/utils';
import { PhoneCall, CheckCircle2, Zap, ArrowRight, Check } from 'lucide-react';
import { PurchaseModal } from '@/components/PurchaseModal';
import NetworkLogo from '@/components/NetworkLogo';

export default function AirtimePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(1);
  const [phone, setPhone] = useState<string>('');
  const [amount, setAmount] = useState<number>(500);
  const [customAmountInput, setCustomAmountInput] = useState<string>('500');

  // Purchase Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhone(profile.phoneNumber);
    } else if (user?.phoneNumber) {
      setPhone(user.phoneNumber);
    }
  }, [profile, user]);

  const currentNetwork = NETWORKS.find((n) => n.id === selectedNetworkId) || NETWORKS[0];

  const handlePresetAmount = (amt: number) => {
    setAmount(amt);
    setCustomAmountInput(amt.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmountInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    }
  };

  const discountedAmount = amount * 0.98; // 2% discount

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !isValidNigerianPhone(phone)) {
      alert('Please enter a valid 11-digit phone number.');
      return;
    }
    if (amount < 50) {
      alert('Minimum airtime recharge is ₦50.');
      return;
    }

    setIsPurchaseModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Instant Airtime Topup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Recharge any Nigerian network line instantly with automated 2% cash discount.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>2% Instant Cash Discount</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <form onSubmit={handleRecharge} className="space-y-6">
            {/* 1. Network Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-space">
                1. Select Telecom Network
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {NETWORKS.map((net) => {
                  const isSelected = selectedNetworkId === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setSelectedNetworkId(net.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#4f46e5] bg-[#f0efff]/60 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200/80 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <NetworkLogo network={net.name} size={36} roundedClassName="rounded-xl" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{net.displayName}</div>
                        <div className="text-[10px] text-emerald-600 font-bold font-space">2% OFF</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Recipient Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-space">
                2. Recipient Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0801 234 5678"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-base text-slate-900 font-space font-bold tracking-wide focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-colors"
                required
              />
            </div>

            {/* 3. Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-space">
                3. Recharge Amount (₦)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetAmount(amt)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold font-space transition-all cursor-pointer ${
                      amount === amt
                        ? 'border-[#4f46e5] bg-[#f0efff] text-[#4f46e5]'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="50"
                max="50000"
                value={customAmountInput}
                onChange={handleCustomChange}
                placeholder="Enter amount (min ₦50)"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-base text-slate-900 font-space font-bold focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-colors"
                required
              />
            </div>

            {/* Summary card */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">You Pay (2% Discount):</span>
                <div className="text-xl font-black text-[#4f46e5] font-space tracking-tight">
                  {formatCurrency(discountedAmount)}
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-space">
                Save: {formatCurrency(amount - discountedAmount)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Recharge <span className="font-space">{formatCurrency(amount)}</span> Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Airtime Features
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant 3-second delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automatic 2% instant discount</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Supports MTN, Airtel, Glo, 9mobile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Funds directly from wallet or card</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        plan={{
          id: `airtime-${selectedNetworkId}-${amount}`,
          networkId: selectedNetworkId,
          networkName: currentNetwork.name,
          name: `${formatCurrency(amount)} Airtime`,
          planId: 0,
          category: 'SME',
          categoryLabel: 'Airtime',
          size: `${formatCurrency(amount)} Airtime`,
          sizeInMB: 0,
          validity: 'Instant',
          costPrice: discountedAmount,
          sellingPrice: discountedAmount,
          retailPrice: amount,
          savingsPercentage: 2
        }}
        phoneNumber={phone}
        network={currentNetwork}
        onOrderCompleted={() => refreshProfile()}
      />
    </div>
  );
}
