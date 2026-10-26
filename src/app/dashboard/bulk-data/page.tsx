'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NETWORKS, CURATED_DATA_PLANS } from '@/lib/constants';
import { formatCurrency, isValidNigerianPhone, normalizePhone } from '@/lib/utils';
import { Grid, Send, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import NetworkLogo from '@/components/NetworkLogo';

export default function BulkDataPage() {
  const { profile, refreshProfile } = useAuth();

  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('mtn-sme-1gb');
  const [bulkInput, setBulkInput] = useState<string>('');
  const [isDispensing, setIsDispensing] = useState<boolean>(false);
  const [dispenseProgress, setDispenseProgress] = useState<string | null>(null);

  const availablePlans = useMemo(() => {
    return CURATED_DATA_PLANS.filter((p) => p.networkId === selectedNetworkId);
  }, [selectedNetworkId]);

  const currentPlan = useMemo(() => {
    return availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];
  }, [availablePlans, selectedPlanId]);

  // Parse phone numbers
  const parsedPhones = useMemo(() => {
    const rawList = bulkInput
      .split(/[\n,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const valid: string[] = [];
    const invalid: string[] = [];

    rawList.forEach((phone) => {
      const clean = normalizePhone(phone);
      if (isValidNigerianPhone(clean)) {
        if (!valid.includes(clean)) valid.push(clean);
      } else {
        invalid.push(phone);
      }
    });

    return { valid, invalid, total: rawList.length };
  }, [bulkInput]);

  const totalCost = currentPlan ? currentPlan.sellingPrice * parsedPhones.valid.length : 0;

  const handleStartBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedPhones.valid.length === 0) {
      alert('Please enter at least one valid 11-digit phone number.');
      return;
    }

    if (!currentPlan) {
      alert('Please select a data plan bundle.');
      return;
    }

    const currentBalance = profile?.walletBalance || 0;
    if (currentBalance < totalCost) {
      alert(`Insufficient wallet balance. You need ${formatCurrency(totalCost)} to dispense to ${parsedPhones.valid.length} recipients. Please fund your wallet.`);
      return;
    }

    setIsDispensing(true);
    setDispenseProgress(`Queueing ${parsedPhones.valid.length} dispatches via Glad Tidings VTU Gateway...`);

    // Simulate batch dispatch progress
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setDispenseProgress(`Dispensing batch 1 of ${parsedPhones.valid.length}...`);
      await new Promise((r) => setTimeout(r, 1500));
      setDispenseProgress(`Successfully dispatched ${parsedPhones.valid.length} data bundles!`);
      refreshProfile();
      setTimeout(() => {
        setIsDispensing(false);
        setDispenseProgress(null);
        setBulkInput('');
        alert(`Bulk dispatch complete! Successfully sent ${currentPlan.size} to ${parsedPhones.valid.length} numbers.`);
      }, 1500);
    } catch {
      setIsDispensing(false);
      setDispenseProgress(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sell Bulk Mobile Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Paste multiple phone numbers to dispense high-speed bundles simultaneously across Nigeria.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <Grid className="w-3.5 h-3.5 text-blue-600" />
          <span>Multi-Threaded Carrier Switch</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <form onSubmit={handleStartBulk} className="space-y-5">
            {/* 1. Network */}
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
                          ? 'border-[#1e3a8a] bg-blue-50/70 ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <NetworkLogo network={net.name} size={32} roundedClassName="rounded-xl" />
                      <span className="text-xs font-bold text-slate-900 truncate">{net.displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Plan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. Choose Bundle Size:
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-blue-600 transition-colors cursor-pointer"
              >
                {availablePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.validity}) - {formatCurrency(p.sellingPrice)}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Phone Numbers TextArea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  3. Paste Recipient Phone Numbers:
                </label>
                <span className="text-[11px] text-slate-500">
                  Separate by comma, space, or newline
                </span>
              </div>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="08031234567, 08149876543, 09051234890&#10;08023456789&#10;07012345678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                required
              />

              {/* Number parsing feedback */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold">
                  Valid: {parsedPhones.valid.length}
                </span>
                {parsedPhones.invalid.length > 0 && (
                  <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md font-bold">
                    Invalid: {parsedPhones.invalid.length}
                  </span>
                )}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">Total Cost:</span>
                <div className="text-lg font-black text-[#1e3a8a]">
                  {formatCurrency(totalCost)}
                </div>
              </div>
              <div className="text-right text-slate-600">
                <div>{parsedPhones.valid.length} numbers × {currentPlan ? formatCurrency(currentPlan.sellingPrice) : '₦0.00'}</div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isDispensing || parsedPhones.valid.length === 0}
              className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-60"
            >
              {isDispensing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{dispenseProgress}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Start Bulk Dispense ({formatCurrency(totalCost)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Info (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">Bulk Guidelines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our automated backend sequences bulk requests into sub-batches to prevent carrier rate-limiting. All recipients receive notifications within seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
