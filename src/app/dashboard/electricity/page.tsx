'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCOS } from '@/lib/constants';
import { ElectricityDisco, Transaction } from '@/lib/types';
import { formatCurrency, isValidNigerianPhone, normalizePhone } from '@/lib/utils';
import { PurchaseModal, ElectricityCheckoutDetails } from '@/components/PurchaseModal';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Building2,
  ShieldCheck,
  Check,
  Clock,
  ArrowRight,
  Info,
  Smartphone
} from 'lucide-react';

export default function ElectricityPage() {
  const { user, profile, refreshProfile } = useAuth();

  // Electricity state
  const [selectedDiscoId, setSelectedDiscoId] = useState<number>(18); // Default Ikeja Electric
  const [meterType, setMeterType] = useState<'Prepaid' | 'Postpaid'>('Prepaid');
  const [meterNumber, setMeterNumber] = useState<string>('');
  const [electricityAmount, setElectricityAmount] = useState<number>(2000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('2000');
  const [phone, setPhone] = useState<string>('');
  
  // Validation state
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    verified: boolean;
    name?: string;
    address?: string;
    error?: string;
  } | null>(null);

  // Purchase Modal state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<ElectricityCheckoutDetails | null>(null);

  // Pre-fill user phone if available
  useEffect(() => {
    if (profile?.phoneNumber) {
      setPhone(profile.phoneNumber);
    } else if (user?.phoneNumber) {
      setPhone(user.phoneNumber);
    }
  }, [profile, user]);

  const currentDisco = DISCOS.find((d) => d.id === selectedDiscoId) || DISCOS[0];

  // Live Meter Verification against Glad Tidings API
  const handleVerifyMeter = async () => {
    const cleanMeter = meterNumber.trim();
    if (!cleanMeter || cleanMeter.length < 6) {
      setValidationResult({
        verified: false,
        error: 'Please enter a valid meter number (minimum 6 digits).'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch(
        `/api/gladtidings/electricity/validate?disco_id=${selectedDiscoId}&meter_type=${meterType.toLowerCase()}&meter_number=${encodeURIComponent(
          cleanMeter
        )}`
      );
      const data = await res.json();

      if (data.invalid === false && data.name) {
        setValidationResult({
          verified: true,
          name: data.name,
          address: data.address
        });
      } else {
        setValidationResult({
          verified: false,
          error: data.error || data.msg || 'Meter number not recognized by this Disco. Please verify disco & meter number.'
        });
      }
    } catch {
      setValidationResult({
        verified: false,
        error: 'Could not connect to electricity validation gateway. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handlePresetAmount = (amt: number) => {
    setElectricityAmount(amt);
    setCustomAmountInput(amt.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmountInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setElectricityAmount(parsed);
    }
  };

  const handleProceedToPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!meterNumber || meterNumber.trim().length < 6) {
      alert('Please enter a valid meter number.');
      return;
    }

    if (electricityAmount < 500) {
      alert('Minimum electricity recharge amount is ₦500.');
      return;
    }

    if (!phone || !isValidNigerianPhone(phone)) {
      alert('Please enter an 11-digit phone number to receive your token via SMS/Receipt.');
      return;
    }

    setCheckoutDetails({
      discoId: selectedDiscoId,
      discoName: currentDisco.name,
      meterNumber: meterNumber.trim(),
      meterType,
      amount: electricityAmount,
      phone: normalizePhone(phone),
      customerName: validationResult?.name,
      customerAddress: validationResult?.address
    });

    setIsPurchaseModalOpen(true);
  };

  const handleOrderCompleted = (tx: Transaction) => {
    refreshProfile();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Electricity Bills &amp; Meter Tokens
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Generate instant prepaid meter tokens and pay postpaid bills for all 12 Nigerian Discos with 0% convenience fee.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
          <span>0% Surcharge • 24/7 Dispenser</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Configuration Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <form onSubmit={handleProceedToPurchase} className="space-y-5">
            {/* 1. Disco Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-space">
                1. Select Electricity Distribution Company (Disco):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {DISCOS.map((disco) => {
                  const isSelected = selectedDiscoId === disco.id;
                  return (
                    <button
                      key={disco.id}
                      type="button"
                      onClick={() => {
                        setSelectedDiscoId(disco.id);
                        setValidationResult(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                        isSelected
                          ? 'border-[#1e3a8a] bg-blue-50/70 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {disco.name.replace(' Electric', '').replace(' Distribution Company', '')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-1">
                        {disco.state}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Meter Type (Prepaid vs Postpaid) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-space">
                2. Meter Type:
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {(['Prepaid', 'Postpaid'] as const).map((type) => {
                  const isSelected = meterType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setMeterType(type);
                        setValidationResult(null);
                      }}
                      className={`py-2.5 px-4 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type === 'Prepaid' ? '⚡ Prepaid (Token)' : '📄 Postpaid (Bill)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Meter Number + Live Verification Button */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-space">
                3. Meter / Account Number:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={meterNumber}
                  onChange={(e) => {
                    setMeterNumber(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Enter 11 to 13 digit meter number"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={handleVerifyMeter}
                  disabled={isValidating || !meterNumber || meterNumber.trim().length < 6}
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
                      <span>Verify Meter</span>
                    </>
                  )}
                </button>
              </div>

              {/* Validation Result Feedback Banner */}
              {validationResult && (
                <div className="mt-3">
                  {validationResult.verified ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>METER VERIFIED SUCCESSFULLY</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        Customer: {validationResult.name}
                      </div>
                      {validationResult.address && (
                        <div className="text-slate-600 text-[11px]">
                          Address: {validationResult.address}
                        </div>
                      )}
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

            {/* 4. Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-space">
                4. Purchase Amount (₦):
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[1000, 2000, 5000, 10000, 20000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePresetAmount(amt)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold font-space transition-all cursor-pointer ${
                      electricityAmount === amt
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
                min="500"
                max="500000"
                value={customAmountInput}
                onChange={handleCustomAmountChange}
                placeholder="Enter amount (min ₦500)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-space font-bold focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                required
              />
            </div>

            {/* 5. Recipient Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-space">
                5. Recipient Phone Number (for token SMS &amp; receipt):
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0801 234 5678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-space font-bold focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Generate Electricity Token ({formatCurrency(electricityAmount)})</span>
            </button>
          </form>
        </div>

        {/* Right Card: Guidelines & Verification Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Direct Disco Verification</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              DataAbeg connects directly to the central switch for all Nigerian Discos. When you click <strong>Verify Meter</strong>, your registered meter details and address are confirmed directly before any deduction.
            </p>

            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant 20-digit token generated in 5 seconds.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Token displayed on screen and sent via SMS.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>0% convenience fee on all transactions.</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl border border-blue-200/80 p-5 space-y-3 text-xs text-blue-900">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Need Quick Token Reload?</span>
            </div>
            <p className="leading-relaxed text-blue-800">
              You can pay via your wallet balance or direct bank transfer. Ensure your meter has a minimum of ₦500 recharge.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        serviceType="electricity"
        electricityDetails={checkoutDetails}
        phoneNumber={phone}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}
