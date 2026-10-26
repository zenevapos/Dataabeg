'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NETWORKS, CURATED_DATA_PLANS } from '@/lib/constants';
import { DataPlan, NetworkInfo, PlanCategory, Transaction } from '@/lib/types';
import { detectNetworkFromPhone, isValidNigerianPhone, normalizePhone, formatCurrency } from '@/lib/utils';
import { PurchaseModal } from '@/components/PurchaseModal';
import NetworkLogo from '@/components/NetworkLogo';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function BuyDataPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>('mtn-sme-1gb');
  const [categoryFilter, setCategoryFilter] = useState<PlanCategory | 'ALL'>('ALL');
  const [formError, setFormError] = useState<string | null>(null);

  // Purchase Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<DataPlan | null>(null);
  const [checkoutNetwork, setCheckoutNetwork] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhoneNumber(profile.phoneNumber);
    } else if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [profile, user]);

  const currentNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.id === selectedNetworkId) || NETWORKS[0];
  }, [selectedNetworkId]);

  // Handle phone input with network auto-detect
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhoneNumber(raw);
    setFormError(null);

    const clean = normalizePhone(raw);
    if (clean.length >= 4) {
      const detected = detectNetworkFromPhone(clean);
      if (detected && detected.id !== selectedNetworkId) {
        setSelectedNetworkId(detected.id);
      }
    }
  };

  const availablePlans = useMemo(() => {
    return CURATED_DATA_PLANS.filter((plan) => {
      const matchesNet = plan.networkId === selectedNetworkId;
      const matchesCat = categoryFilter === 'ALL' || plan.category === categoryFilter;
      return matchesNet && matchesCat;
    });
  }, [selectedNetworkId, categoryFilter]);

  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(availablePlans[0].id);
    }
  }, [availablePlans, selectedPlanId]);

  const selectedPlan = useMemo(() => {
    return availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];
  }, [availablePlans, selectedPlanId]);

  const handleBuyPlan = (plan: DataPlan) => {
    setFormError(null);
    const clean = phoneNumber.trim().replace(/\s+/g, '');
    if (!clean || clean.length < 11) {
      setFormError('Please enter a valid 11-digit recipient phone number first.');
      const input = document.getElementById('phone-input-field');
      if (input) input.focus();
      return;
    }

    setCheckoutNetwork(currentNetwork);
    setCheckoutPlan(plan);
    setIsPurchaseModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Buy Mobile Data Bundles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Automated direct carrier delivery for MTN SME, Airtel Corporate Gifting, Glo &amp; 9mobile.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-xs font-bold px-3.5 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>Glad Tidings Carrier Switch • 5-Sec Dispense</span>
        </div>
      </div>

      {/* Network Picker Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-space">
          1. Select Mobile Telecom Network
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NETWORKS.map((net) => {
            const isSelected = selectedNetworkId === net.id;
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => {
                  setSelectedNetworkId(net.id);
                  setCategoryFilter('ALL');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#4f46e5] bg-[#f0efff]/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <NetworkLogo network={net.name} size={42} roundedClassName="rounded-2xl" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{net.displayName}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Direct Carrier</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recipient Phone Input */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-space">
            2. Recipient Phone Number
          </label>
          <div className="max-w-md">
            <input
              id="phone-input-field"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="e.g. 0801 234 5678"
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-base text-slate-900 font-space font-bold tracking-wide focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-colors"
            />
          </div>
          {formError && (
            <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{formError}</span>
            </p>
          )}
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Available {currentNetwork.displayName} Plans <span className="font-space font-extrabold text-[#4f46e5]">({availablePlans.length})</span>
          </h2>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'SME', 'CORPORATE_GIFTING', 'GIFTING'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-space uppercase tracking-wide transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#4f46e5] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                {cat === 'ALL' ? 'All Plans' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availablePlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`bg-white rounded-3xl border p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-slate-300 ${
                  isSelected ? 'border-[#4f46e5] ring-2 ring-indigo-500/20' : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] uppercase tracking-wider">
                      {plan.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold font-space">
                      {plan.validity}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-slate-900 tracking-tight font-space">
                    {plan.size}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PRICE</div>
                    <div className="text-lg font-black text-[#4f46e5] font-space tracking-tight">
                      {formatCurrency(plan.sellingPrice)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyPlan(plan);
                    }}
                    className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Buy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        plan={checkoutPlan}
        phoneNumber={phoneNumber}
        network={checkoutNetwork}
        onOrderCompleted={() => refreshProfile()}
      />
    </div>
  );
}
