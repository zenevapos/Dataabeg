'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NETWORKS } from '@/lib/constants';
import { formatCurrency, isValidNigerianPhone, normalizePhone } from '@/lib/utils';
import { PhoneCall, CheckCircle2, Zap, ArrowRight, Check } from 'lucide-react';
import { PurchaseModal } from '@/components/PurchaseModal';

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Instant Airtime Topup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Recharge any Nigerian network line instantly with automated 2% cash discount.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>2% Instant Cash Discount</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <form onSubmit={handleRecharge} className="space-y-5">
            {/* 1. Network Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Select Telecom Network:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {NETWORKS.map((net) => {
                  const isSelected = selectedNetworkId === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setSelectedNetworkId(net.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#1e3a8a] bg-blue-50/70 ring-2 ring-blue-600/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: net.color, color: net.id === 1 ? '#000' : '#fff' }}
                      >
                        {net.name.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{net.displayName}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">2% OFF</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Recipient Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. Recipient Phone Number:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                required
              />
            </div>

            {/* 3. Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                3. Recharge Amount (₦):
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetAmount(amt)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      amount === amt
                        ? 'border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                required
              />
            </div>

            {/* Summary card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">You Pay (2% Discount):</span>
                <div className="text-base font-extrabold text-[#1e3a8a]">
                  {formatCurrency(discountedAmount)}
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                You Save: {formatCurrency(amount - discountedAmount)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Recharge Airtime Now</span>
            </button>
          </form>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">Direct VTU Switch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Airtime recharge credits directly on your recipient line within 3 to 5 seconds with zero network delay.
            </p>
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supports all Nigerian networks</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant 2% reseller discount</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        serviceType="airtime"
        phoneNumber={phone}
        network={currentNetwork}
        plan={{
          id: `airtime-${amount}`,
          planId: 0,
          networkId: currentNetwork.id,
          networkName: currentNetwork.name,
          name: `${currentNetwork.name} ₦${amount} Airtime`,
          category: 'SME',
          categoryLabel: 'Airtime',
          size: `₦${amount}`,
          sizeInMB: 0,
          validity: 'Instant Topup',
          costPrice: discountedAmount,
          sellingPrice: discountedAmount,
          retailPrice: amount,
          savingsPercentage: 2
        }}
        onOrderCompleted={() => refreshProfile()}
      />
    </div>
  );
}
