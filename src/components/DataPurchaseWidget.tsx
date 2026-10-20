'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NETWORKS, CURATED_DATA_PLANS } from '@/lib/constants';
import { NetworkInfo, DataPlan, NetworkType, PlanCategory } from '@/lib/types';
import { detectNetworkFromPhone, isValidNigerianPhone, normalizePhone, formatCurrency } from '@/lib/utils';
import { Check, Phone, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Flame, Radio } from 'lucide-react';

interface DataPurchaseWidgetProps {
  onSelectPlanForCheckout: (plan: DataPlan, phone: string, network: NetworkInfo) => void;
  plans?: DataPlan[];
}

export function DataPurchaseWidget({ onSelectPlanForCheckout, plans = CURATED_DATA_PLANS }: DataPurchaseWidgetProps) {
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>('mtn-sme-1gb');
  const [categoryFilter, setCategoryFilter] = useState<PlanCategory | 'ALL'>('ALL');
  const [autoDetectedMessage, setAutoDetectedMessage] = useState<string | null>(null);

  // Current network info
  const currentNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.id === selectedNetworkId) || NETWORKS[0];
  }, [selectedNetworkId]);

  // Phone number change handler with intelligent network auto-detection
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhoneNumber(raw);

    const clean = normalizePhone(raw);
    if (clean.length >= 4) {
      const detected = detectNetworkFromPhone(clean);
      if (detected && detected.id !== selectedNetworkId) {
        setSelectedNetworkId(detected.id);
        setAutoDetectedMessage(`Detected ${detected.displayName}`);
        // Default to a suitable plan for the newly detected network
        const firstNetPlan = plans.find((p) => p.networkId === detected.id && p.isPopular) ||
                             plans.find((p) => p.networkId === detected.id);
        if (firstNetPlan) {
          setSelectedPlanId(firstNetPlan.id);
        }
      }
    } else {
      setAutoDetectedMessage(null);
    }
  };

  // Filter plans based on selected network and optional category
  const availablePlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesNet = plan.networkId === selectedNetworkId;
      const matchesCategory = categoryFilter === 'ALL' || plan.category === categoryFilter;
      return matchesNet && matchesCategory;
    });
  }, [plans, selectedNetworkId, categoryFilter]);

  // Selected plan object
  const currentSelectedPlan = useMemo(() => {
    return availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0] || null;
  }, [availablePlans, selectedPlanId]);

  // Update selected plan if current selection is invalid for this network
  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.some((p) => p.id === selectedPlanId)) {
      const popular = availablePlans.find((p) => p.isPopular) || availablePlans[0];
      setSelectedPlanId(popular.id);
    }
  }, [availablePlans, selectedPlanId]);

  const isPhoneValid = isValidNigerianPhone(phoneNumber);

  const handleCheckoutClick = () => {
    if (!currentSelectedPlan) return;
    if (!isPhoneValid) {
      alert('Please enter a valid 11-digit Nigerian phone number (e.g. 08031234567)');
      return;
    }
    onSelectPlanForCheckout(currentSelectedPlan, normalizePhone(phoneNumber), currentNetwork);
  };

  return (
    <div id="data-purchase-section" className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-5 sm:p-8">
        {/* Step 1: Select Network */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E40AF] text-white text-xs font-bold shadow-xs">
                1
              </span>
              Select Mobile Network
            </label>
            {autoDetectedMessage && (
              <span className="text-[11px] font-bold text-[#1E40AF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
                ✓ {autoDetectedMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {NETWORKS.map((network) => {
              const isSelected = network.id === selectedNetworkId;
              return (
                <button
                  key={network.id}
                  type="button"
                  id={`select-network-${network.name.toLowerCase()}`}
                  onClick={() => {
                    setSelectedNetworkId(network.id);
                    setAutoDetectedMessage(null);
                  }}
                  className={`relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group cursor-pointer ${
                    isSelected
                      ? `bg-blue-50/60 border-[#1E40AF] ring-2 ring-[#1E40AF]/30 shadow-xs`
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: network.color, color: network.name === 'MTN' ? '#000' : '#fff' }}
                  >
                    {network.name === 'MTN' && 'MTN'}
                    {network.name === 'AIRTEL' && 'airtel'}
                    {network.name === 'GLO' && 'glo'}
                    {network.name === '9MOBILE' && '9mob'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{network.displayName}</p>
                    <p className="text-[10px] text-[#1E40AF] font-semibold">From ₦285/GB</p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#1E40AF] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Recipient Phone Number */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="recipient-phone-input" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E40AF] text-white text-xs font-bold shadow-xs">
                2
              </span>
              Recipient Phone Number
            </label>
            <span className="text-[11px] text-slate-500">Auto-detects network</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              id="recipient-phone-input"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="0803 123 4567 or 0812 345 6789"
              maxLength={14}
              className={`w-full pl-11 pr-24 py-3.5 bg-slate-50 rounded-2xl text-slate-900 text-base sm:text-lg font-medium tracking-wide placeholder-slate-400 border transition-all outline-none focus:bg-white focus:ring-2 ${
                isPhoneValid
                  ? 'border-emerald-500/80 focus:ring-emerald-100'
                  : phoneNumber.length > 3
                  ? 'border-slate-300 focus:border-[#1E40AF] focus:ring-blue-100'
                  : 'border-slate-200 focus:border-[#1E40AF] focus:ring-blue-100'
              }`}
            />

            {/* Quick Helper button on right */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isPhoneValid ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Valid SIM
                </span>
              ) : phoneNumber.length > 0 ? (
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  {11 - normalizePhone(phoneNumber).length > 0
                    ? `${11 - normalizePhone(phoneNumber).length} digits left`
                    : 'Invalid format'}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const sample = '08031234567';
                    setPhoneNumber(sample);
                    setSelectedNetworkId(1);
                  }}
                  className="text-xs text-slate-600 hover:text-[#1E40AF] transition-colors px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer font-medium"
                >
                  Use Sample
                </button>
              )}
            </div>
          </div>

          <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
            <span>Works with all Nigerian SIMs (including lines with DND enabled). 30-day validity.</span>
          </p>
        </div>

        {/* Step 3: Plan Category Tabs */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E40AF] text-white text-xs font-bold shadow-xs">
              3
            </span>
            Choose Data Bundle
          </label>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-[#1E40AF] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Bundles
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('SME')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                categoryFilter === 'SME'
                  ? 'bg-[#1E40AF] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" /> SME Super Cheap
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('CORPORATE_GIFTING')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                categoryFilter === 'CORPORATE_GIFTING'
                  ? 'bg-[#1E40AF] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Corporate Gifting
            </button>
          </div>
        </div>

        {/* Step 4: Plan Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {availablePlans.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/50 border-[#1E40AF] shadow-md ring-2 ring-[#1E40AF]/30'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {/* Popular / Best Value Badge */}
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    ★ Best Seller
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                      {plan.size}
                    </span>
                    <span className="text-[10px] font-bold text-[#1E40AF] bg-blue-100 px-2 py-0.5 rounded-full">
                      Save {plan.savingsPercentage}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">{plan.validity}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-lg sm:text-xl font-extrabold text-[#1E40AF]">
                      {formatCurrency(plan.sellingPrice)}
                    </span>
                    <span className="ml-1.5 text-xs text-slate-400 line-through">
                      {formatCurrency(plan.retailPrice)}
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    isSelected ? 'border-[#1E40AF] bg-[#1E40AF] text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 5: Checkout Summary Bar */}
        {currentSelectedPlan && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-blue-50/80 border border-blue-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="w-full sm:w-auto text-left">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentNetwork.color }}
                />
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  Order Summary
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 font-heading">
                {currentNetwork.displayName} • {currentSelectedPlan.name}
              </p>
              <p className="text-xs text-slate-600">
                To: <span className="text-slate-900 font-mono font-bold">{phoneNumber || 'Enter phone number above'}</span> (30 Days Validity)
              </p>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-500 uppercase font-bold">Total Amount</p>
                <p className="text-2xl font-black text-[#1E40AF] font-heading">
                  {formatCurrency(currentSelectedPlan.sellingPrice)}
                </p>
              </div>

              <button
                type="button"
                id="checkout-proceed-btn"
                onClick={handleCheckoutClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
