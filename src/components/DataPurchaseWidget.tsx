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
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 sm:p-8 backdrop-blur-xl">
        {/* Step 1: Select Network */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                1
              </span>
              Select Mobile Network
            </label>
            {autoDetectedMessage && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
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
                  className={`relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                    isSelected
                      ? `bg-slate-800/90 ${network.borderColor} ring-2 ring-emerald-500/30 shadow-lg`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: network.color, color: network.name === 'MTN' ? '#000' : '#fff' }}
                  >
                    {network.name === 'MTN' && 'MTN'}
                    {network.name === 'AIRTEL' && 'airtel'}
                    {network.name === 'GLO' && 'glo'}
                    {network.name === '9MOBILE' && '9mob'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{network.displayName}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">From ₦285/GB</p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
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
            <label htmlFor="recipient-phone-input" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                2
              </span>
              Recipient Phone Number
            </label>
            <span className="text-[11px] text-slate-400">Auto-detects network</span>
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
              className={`w-full pl-11 pr-24 py-3.5 bg-slate-950/80 rounded-2xl text-white text-base sm:text-lg font-medium tracking-wide placeholder-slate-500 border transition-all outline-none focus:ring-2 ${
                isPhoneValid
                  ? 'border-emerald-500/70 focus:ring-emerald-500/30'
                  : phoneNumber.length > 3
                  ? 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                  : 'border-slate-800 focus:border-slate-600 focus:ring-emerald-500/10'
              }`}
            />

            {/* Quick Helper button on right */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isPhoneValid ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" /> Valid SIM
                </span>
              ) : phoneNumber.length > 0 ? (
                <span className="text-[10px] text-amber-400/90 font-medium">
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
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors px-2 py-1 rounded bg-slate-800/60"
                >
                  Use Sample
                </button>
              )}
            </div>
          </div>

          <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Works with all Nigerian SIMs (including lines with DND enabled). 30-day validity.</span>
          </p>
        </div>

        {/* Step 3: Plan Category Tabs */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              3
            </span>
            Choose Data Bundle
          </label>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Bundles
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('SME')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                categoryFilter === 'SME'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" /> SME Super Cheap
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('CORPORATE_GIFTING')}
              className={`px-3 py-1 rounded-lg transition-all ${
                categoryFilter === 'CORPORATE_GIFTING'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
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
                    ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40 glow-emerald'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/30'
                }`}
              >
                {/* Popular / Best Value Badge */}
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                    ★ Best Seller
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {plan.size}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Save {plan.savingsPercentage}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium">{plan.validity}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
                      {formatCurrency(plan.sellingPrice)}
                    </span>
                    <span className="ml-1.5 text-xs text-slate-500 line-through">
                      {formatCurrency(plan.retailPrice)}
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    isSelected ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'
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
          <div className="rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 border border-slate-700/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="w-full sm:w-auto text-left">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentNetwork.color }}
                />
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Order Summary
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white mt-0.5">
                {currentNetwork.displayName} • {currentSelectedPlan.name}
              </p>
              <p className="text-xs text-slate-400">
                To: <span className="text-white font-mono">{phoneNumber || 'Enter phone number above'}</span> (30 Days Validity)
              </p>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-400 uppercase font-medium">Total Amount</p>
                <p className="text-2xl font-black text-emerald-400">
                  {formatCurrency(currentSelectedPlan.sellingPrice)}
                </p>
              </div>

              <button
                type="button"
                id="checkout-proceed-btn"
                onClick={handleCheckoutClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
