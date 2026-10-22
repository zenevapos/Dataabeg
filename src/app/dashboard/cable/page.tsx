'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CABLE_PROVIDERS, CABLE_PLANS } from '@/lib/constants';
import { CableProvider, CablePlan, Transaction } from '@/lib/types';
import { formatCurrency, isValidNigerianPhone, normalizePhone } from '@/lib/utils';
import { PurchaseModal, CableCheckoutDetails } from '@/components/PurchaseModal';
import {
  Tv,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Check,
  Building2,
  Info
} from 'lucide-react';

export default function CablePage() {
  const { user, profile, refreshProfile } = useAuth();

  // Cable State
  const [selectedCableId, setSelectedCableId] = useState<number>(1); // 1 = GOtv, 2 = DStv, 3 = StarTimes
  const [smartCardNumber, setSmartCardNumber] = useState<string>('');
  const [selectedCablePlanId, setSelectedCablePlanId] = useState<number>(17); // GOtv Smallie default
  const [phone, setPhone] = useState<string>('');

  // Validation State
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    verified: boolean;
    name?: string;
    error?: string;
  } | null>(null);

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<CableCheckoutDetails | null>(null);

  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhone(profile.phoneNumber);
    } else if (user?.phoneNumber) {
      setPhone(user.phoneNumber);
    }
  }, [profile, user]);

  const currentProvider = useMemo(() => {
    return CABLE_PROVIDERS.find((p) => p.id === selectedCableId) || CABLE_PROVIDERS[0];
  }, [selectedCableId]);

  const availablePlans = useMemo(() => {
    return CABLE_PLANS.filter((p) => p.cableId === selectedCableId);
  }, [selectedCableId]);

  const currentPlan = useMemo(() => {
    return availablePlans.find((p) => p.id === selectedCablePlanId) || availablePlans[0];
  }, [availablePlans, selectedCablePlanId]);

  // When provider changes, select the first valid plan
  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.some((p) => p.id === selectedCablePlanId)) {
      setSelectedCablePlanId(availablePlans[0].id);
    }
  }, [availablePlans, selectedCablePlanId]);

  // Live Smartcard / IUC Verification against Glad Tidings API
  const handleVerifySmartCard = async () => {
    const cleanCard = smartCardNumber.trim();
    if (!cleanCard || cleanCard.length < 6) {
      setValidationResult({
        verified: false,
        error: 'Please enter a valid IUC or SmartCard number (minimum 6 digits).'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch(
        `/api/gladtidings/cable/validate?cable_id=${selectedCableId}&smart_card_number=${encodeURIComponent(
          cleanCard
        )}`
      );
      const data = await res.json();

      if (data.invalid === false && data.name) {
        setValidationResult({
          verified: true,
          name: data.name
        });
      } else {
        setValidationResult({
          verified: false,
          error: data.error || data.msg || 'SmartCard/IUC number not recognized by provider. Please check number.'
        });
      }
    } catch {
      setValidationResult({
        verified: false,
        error: 'Could not connect to cable gateway for validation. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleProceedToPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!smartCardNumber || smartCardNumber.trim().length < 6) {
      alert('Please enter your SmartCard / IUC number.');
      return;
    }

    if (!currentPlan) {
      alert('Please select a cable package.');
      return;
    }

    if (!phone || !isValidNigerianPhone(phone)) {
      alert('Please enter an 11-digit phone number for subscription confirmation.');
      return;
    }

    setCheckoutDetails({
      cableId: selectedCableId,
      cableName: currentProvider.name,
      cablePlanId: currentPlan.id,
      cablePlanName: currentPlan.name,
      smartCardNumber: smartCardNumber.trim(),
      customerName: validationResult?.name,
      amount: currentPlan.amount,
      phone: normalizePhone(phone)
    });

    setIsPurchaseModalOpen(true);
  };

  const handleOrderCompleted = (tx: Transaction) => {
    refreshProfile();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cable TV Subscription Renewal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Instant automatic reactivation for DStv, GOtv, and StarTimes decoders nationwide.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <Tv className="w-3.5 h-3.5 text-purple-600" />
          <span>Instant Decoder Reactivation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <form onSubmit={handleProceedToPurchase} className="space-y-5">
            {/* 1. Provider Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Select Cable Provider:
              </label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {CABLE_PROVIDERS.map((prov) => {
                  const isSelected = selectedCableId === prov.id;
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => {
                        setSelectedCableId(prov.id);
                        setValidationResult(null);
                      }}
                      className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                        isSelected
                          ? 'border-[#1e3a8a] bg-blue-50/70 text-[#1e3a8a] ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {prov.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Smartcard Number + Verification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. IUC / SmartCard Number:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={smartCardNumber}
                  onChange={(e) => {
                    setSmartCardNumber(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Enter 10 to 11 digit SmartCard or IUC number"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={handleVerifySmartCard}
                  disabled={isValidating || !smartCardNumber || smartCardNumber.trim().length < 6}
                  className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer shrink-0"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify SmartCard</span>
                    </>
                  )}
                </button>
              </div>

              {/* Validation Feedback */}
              {validationResult && (
                <div className="mt-3">
                  {validationResult.verified ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>SMARTCARD VERIFIED</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        Subscriber Name: {validationResult.name}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{validationResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Package Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                3. Choose Cable Package:
              </label>
              <select
                value={selectedCablePlanId}
                onChange={(e) => setSelectedCablePlanId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-blue-600 transition-colors cursor-pointer"
              >
                {availablePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.amount)}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Recipient Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                4. Notification Phone Number:
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
            >
              <Tv className="w-4 h-4" />
              <span>Renew Subscription ({currentPlan ? formatCurrency(currentPlan.amount) : '₦0.00'})</span>
            </button>
          </form>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Decoder Activation Tips</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Make sure your decoder is plugged in and powered on before renewing so that the activation signal clears any on-screen error (e.g. E16 or E30) instantly.
            </p>

            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero service charge on all cable renewals.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant API verification with MultiChoice &amp; StarTimes.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        serviceType="cable"
        cableDetails={checkoutDetails}
        phoneNumber={phone}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}
