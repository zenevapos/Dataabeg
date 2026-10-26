'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NETWORKS, CURATED_DATA_PLANS, DISCOS, CABLE_PROVIDERS, CABLE_PLANS } from '@/lib/constants';
import { NetworkInfo, DataPlan, PlanCategory, ElectricityDisco, CableProvider, CablePlan } from '@/lib/types';
import { detectNetworkFromPhone, isValidNigerianPhone, normalizePhone, formatCurrency } from '@/lib/utils';
import { ElectricityCheckoutDetails, CableCheckoutDetails } from '@/components/PurchaseModal';
import NetworkLogo from '@/components/NetworkLogo';
import {
  Check,
  Phone,
  ArrowRight,
  Flame,
  Zap,
  PhoneCall,
  Tv,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Building2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface DataPurchaseWidgetProps {
  onSelectPlanForCheckout: (plan: DataPlan, phone: string, network: NetworkInfo) => void;
  onSelectElectricityForCheckout?: (details: ElectricityCheckoutDetails) => void;
  onSelectCableForCheckout?: (details: CableCheckoutDetails) => void;
  plans?: DataPlan[];
}

export function DataPurchaseWidget({
  onSelectPlanForCheckout,
  onSelectElectricityForCheckout,
  onSelectCableForCheckout,
  plans = CURATED_DATA_PLANS
}: DataPurchaseWidgetProps) {
  // Service Switcher: data | airtime | electricity | cable
  const [serviceMode, setServiceMode] = useState<'data' | 'airtime' | 'electricity' | 'cable'>('data');

  // --- DATA & AIRTIME STATE ---
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>('mtn-sme-1gb');
  const [categoryFilter, setCategoryFilter] = useState<PlanCategory | 'ALL'>('ALL');
  const [autoDetectedMessage, setAutoDetectedMessage] = useState<string | null>(null);

  // Airtime specific state
  const [airtimeAmount, setAirtimeAmount] = useState<number>(500);
  const [customAirtimeInput, setCustomAirtimeInput] = useState<string>('500');

  // --- ELECTRICITY STATE ---
  const [selectedDiscoId, setSelectedDiscoId] = useState<number>(18); // Default Ikeja Electric
  const [meterType, setMeterType] = useState<'Prepaid' | 'Postpaid'>('Prepaid');
  const [meterNumber, setMeterNumber] = useState<string>('');
  const [electricityAmount, setElectricityAmount] = useState<number>(2000);
  const [customElectricityInput, setCustomElectricityInput] = useState<string>('2000');
  const [electricityPhone, setElectricityPhone] = useState<string>('');
  const [isValidatingMeter, setIsValidatingMeter] = useState<boolean>(false);
  const [meterValidationResult, setMeterValidationResult] = useState<{
    verified: boolean;
    name?: string;
    address?: string;
    error?: string;
  } | null>(null);

  // --- CABLE TV STATE ---
  const [selectedCableId, setSelectedCableId] = useState<number>(1); // Default GOtv
  const [smartCardNumber, setSmartCardNumber] = useState<string>('');
  const [selectedCablePlanId, setSelectedCablePlanId] = useState<number>(17); // GOtv Smallie
  const [cablePhone, setCablePhone] = useState<string>('');
  const [isValidatingCable, setIsValidatingCable] = useState<boolean>(false);
  const [cableValidationResult, setCableValidationResult] = useState<{
    verified: boolean;
    name?: string;
    error?: string;
  } | null>(null);

  // Current network info
  const currentNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.id === selectedNetworkId) || NETWORKS[0];
  }, [selectedNetworkId]);

  // Current Disco info
  const currentDisco = useMemo(() => {
    return DISCOS.find((d) => d.id === selectedDiscoId) || DISCOS[0];
  }, [selectedDiscoId]);

  // Filter cable plans by selected provider
  const availableCablePlans = useMemo(() => {
    return CABLE_PLANS.filter((p) => p.cableId === selectedCableId);
  }, [selectedCableId]);

  const currentCablePlan = useMemo(() => {
    return availableCablePlans.find((p) => p.id === selectedCablePlanId) || availableCablePlans[0];
  }, [availableCablePlans, selectedCablePlanId]);

  // Auto-select valid plan when cable provider changes
  useEffect(() => {
    if (availableCablePlans.length > 0 && !availableCablePlans.some((p) => p.id === selectedCablePlanId)) {
      setSelectedCablePlanId(availableCablePlans[0].id);
    }
  }, [availableCablePlans, selectedCablePlanId]);

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
        if (serviceMode === 'data') {
          const firstNetPlan =
            plans.find((p) => p.networkId === detected.id && p.isPopular) ||
            plans.find((p) => p.networkId === detected.id);
          if (firstNetPlan) {
            setSelectedPlanId(firstNetPlan.id);
          }
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

  // Selected plan object for data
  const currentSelectedPlan = useMemo(() => {
    return availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0] || null;
  }, [availablePlans, selectedPlanId]);

  useEffect(() => {
    if (serviceMode === 'data' && availablePlans.length > 0 && !availablePlans.some((p) => p.id === selectedPlanId)) {
      const popular = availablePlans.find((p) => p.isPopular) || availablePlans[0];
      setSelectedPlanId(popular.id);
    }
  }, [availablePlans, selectedPlanId, serviceMode]);

  const isPhoneValid = isValidNigerianPhone(phoneNumber);

  // Meter verification trigger
  const handleVerifyMeter = async () => {
    if (!meterNumber || meterNumber.trim().length < 6) {
      setMeterValidationResult({ verified: false, error: 'Please enter a valid meter number (minimum 6 digits).' });
      return;
    }

    setIsValidatingMeter(true);
    setMeterValidationResult(null);

    try {
      const res = await fetch(
        `/api/gladtidings/electricity/validate?disco_id=${selectedDiscoId}&meter_type=${meterType.toLowerCase()}&meter_number=${encodeURIComponent(
          meterNumber.trim()
        )}`
      );
      const data = await res.json();

      if (data.invalid === false && data.name) {
        setMeterValidationResult({
          verified: true,
          name: data.name,
          address: data.address
        });
      } else {
        setMeterValidationResult({
          verified: false,
          error: data.error || 'Meter number not recognized by this Disco. Please check details.'
        });
      }
    } catch {
      setMeterValidationResult({ verified: false, error: 'Could not connect to Disco server for validation.' });
    } finally {
      setIsValidatingMeter(false);
    }
  };

  // Smartcard verification trigger
  const handleVerifySmartCard = async () => {
    if (!smartCardNumber || smartCardNumber.trim().length < 6) {
      setCableValidationResult({ verified: false, error: 'Please enter a valid IUC / SmartCard number.' });
      return;
    }

    setIsValidatingCable(true);
    setCableValidationResult(null);

    try {
      const res = await fetch(
        `/api/gladtidings/cable/validate?cable_id=${selectedCableId}&smart_card_number=${encodeURIComponent(
          smartCardNumber.trim()
        )}`
      );
      const data = await res.json();

      if (data.invalid === false && data.name) {
        setCableValidationResult({
          verified: true,
          name: data.name
        });
      } else {
        setCableValidationResult({
          verified: false,
          error: data.error || 'SmartCard not recognized by provider. Please verify number.'
        });
      }
    } catch {
      setCableValidationResult({ verified: false, error: 'Could not connect to cable gateway for validation.' });
    } finally {
      setIsValidatingCable(false);
    }
  };

  // Master Checkout Trigger
  const handleCheckoutClick = () => {
    if (serviceMode === 'electricity') {
      if (!meterNumber || meterNumber.trim().length < 6) {
        alert('Please enter your meter number.');
        return;
      }
      if (electricityAmount < 500) {
        alert('Minimum electricity recharge amount is ₦500.');
        return;
      }
      const targetPhone = electricityPhone || phoneNumber;
      if (!isValidNigerianPhone(targetPhone)) {
        alert('Please enter an 11-digit phone number to receive your electricity token via SMS/Receipt.');
        return;
      }

      if (onSelectElectricityForCheckout) {
        onSelectElectricityForCheckout({
          discoId: selectedDiscoId,
          discoName: currentDisco.name,
          meterNumber: meterNumber.trim(),
          meterType,
          amount: electricityAmount,
          phone: normalizePhone(targetPhone),
          customerName: meterValidationResult?.name,
          customerAddress: meterValidationResult?.address
        });
      }
      return;
    }

    if (serviceMode === 'cable') {
      if (!smartCardNumber || smartCardNumber.trim().length < 6) {
        alert('Please enter your IUC / Smartcard number.');
        return;
      }
      const targetPhone = cablePhone || phoneNumber;
      if (!isValidNigerianPhone(targetPhone)) {
        alert('Please enter an 11-digit phone number for subscription confirmation.');
        return;
      }

      const provider = CABLE_PROVIDERS.find((c) => c.id === selectedCableId);
      if (onSelectCableForCheckout && currentCablePlan && provider) {
        onSelectCableForCheckout({
          cableId: selectedCableId,
          cableName: provider.name,
          cablePlanId: currentCablePlan.id,
          cablePlanName: currentCablePlan.name,
          smartCardNumber: smartCardNumber.trim(),
          amount: currentCablePlan.amount,
          phone: normalizePhone(targetPhone),
          customerName: cableValidationResult?.name
        });
      }
      return;
    }

    if (!isPhoneValid) {
      alert('Please enter a valid 11-digit Nigerian phone number (e.g. 08031234567)');
      return;
    }

    if (serviceMode === 'airtime') {
      if (airtimeAmount < 50 || airtimeAmount > 50000) {
        alert('Please enter an airtime amount between ₦50 and ₦50,000');
        return;
      }

      const airtimeDiscountedPrice = Math.round(airtimeAmount * 0.98);
      const airtimePlan: DataPlan = {
        id: `airtime-${airtimeAmount}`,
        planId: 0,
        networkId: selectedNetworkId,
        networkName: currentNetwork.name,
        name: `₦${airtimeAmount.toLocaleString()} Airtime Top-Up`,
        category: 'DIRECT',
        categoryLabel: '📞 Instant Airtime',
        size: `₦${airtimeAmount.toLocaleString()}`,
        sizeInMB: 0,
        validity: 'Instant Top-Up',
        costPrice: Math.round(airtimeAmount * 0.96),
        sellingPrice: airtimeDiscountedPrice,
        retailPrice: airtimeAmount,
        savingsPercentage: 2
      };

      onSelectPlanForCheckout(airtimePlan, normalizePhone(phoneNumber), currentNetwork);
      return;
    }

    // Default: Mobile Data
    if (!currentSelectedPlan) return;
    onSelectPlanForCheckout(currentSelectedPlan, normalizePhone(phoneNumber), currentNetwork);
  };

  const PRESET_AIRTIME_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
  const PRESET_ELECTRICITY_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000];

  return (
    <div id="data-purchase-section" className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-5 sm:p-8">
        
        {/* Top 4-Service Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-1.5 bg-slate-100 rounded-2xl mb-8 max-w-2xl mx-auto border border-slate-200/80 gap-1">
          <button
            type="button"
            id="tab-select-data"
            onClick={() => setServiceMode('data')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serviceMode === 'data'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Mobile Data</span>
          </button>

          <button
            type="button"
            id="tab-select-airtime"
            onClick={() => setServiceMode('airtime')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serviceMode === 'airtime'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Airtime Top-Up</span>
          </button>

          <button
            type="button"
            id="tab-select-electricity"
            onClick={() => setServiceMode('electricity')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serviceMode === 'electricity'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Electricity Bill</span>
          </button>

          <button
            type="button"
            id="tab-select-cable"
            onClick={() => setServiceMode('cable')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serviceMode === 'cable'
                ? 'bg-[#1E40AF] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Cable TV</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* SERVICE 1: MOBILE DATA */}
        {/* ==================================================== */}
        {serviceMode === 'data' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step 1: Phone Number Input with Auto-Network Detection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>1. Enter Recipient Phone Number</span>
                {autoDetectedMessage && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                    {autoDetectedMessage}
                  </span>
                )}
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  id="recipient-phone-input"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 0803 123 4567"
                  maxLength={11}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/10 outline-none font-mono text-base sm:text-lg font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Step 2: Network Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                2. Select Mobile Network
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {NETWORKS.map((net) => {
                  const isSelected = selectedNetworkId === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      id={`network-button-${net.name.toLowerCase()}`}
                      onClick={() => {
                        setSelectedNetworkId(net.id);
                        setAutoDetectedMessage(null);
                      }}
                      className={`py-3 px-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? `${net.borderColor} ${net.bgColor} ring-2 ring-blue-600/20 shadow-sm font-black`
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <NetworkLogo network={net.name} size={24} roundedClassName="rounded-md" />
                        <span className="text-sm font-bold">{net.displayName}</span>
                      </div>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Plan Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <span className="font-bold text-slate-500 uppercase text-[11px] shrink-0 mr-1">Filter:</span>
              {(['ALL', 'SME', 'SME2', 'SPECIAL', 'CORPORATE_GIFTING', 'GIFTING'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-[#1E40AF] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Plans' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Step 4: Plan Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                3. Choose Data Bundle
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availablePlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50/50 ring-2 ring-[#1E40AF]/20 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                          🔥 Best Seller
                        </span>
                      )}

                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xl font-black text-slate-950 font-heading tracking-tight">
                            {plan.size}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{plan.validity}</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 mb-3">{plan.categoryLabel}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-[#1E40AF]">
                            {formatCurrency(plan.sellingPrice)}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through ml-1.5">
                            {formatCurrency(plan.retailPrice)}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Save {plan.savingsPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SERVICE 2: AIRTIME TOP-UP */}
        {/* ==================================================== */}
        {serviceMode === 'airtime' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>1. Enter Recipient Phone Number</span>
                {autoDetectedMessage && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                    {autoDetectedMessage}
                  </span>
                )}
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  id="recipient-phone-airtime"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 0803 123 4567"
                  maxLength={11}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/10 outline-none font-mono text-base sm:text-lg font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Network Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                2. Select Mobile Network
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {NETWORKS.map((net) => {
                  const isSelected = selectedNetworkId === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => {
                        setSelectedNetworkId(net.id);
                        setAutoDetectedMessage(null);
                      }}
                      className={`py-3 px-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? `${net.borderColor} ${net.bgColor} ring-2 ring-blue-600/20 shadow-sm font-black`
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <NetworkLogo network={net.name} size={24} roundedClassName="rounded-md" />
                        <span className="text-sm font-bold">{net.displayName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preset Airtime Amounts */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                3. Choose Airtime Amount (2% Instant Cashback)
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_AIRTIME_AMOUNTS.map((amt) => {
                  const isSelected = airtimeAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAirtimeAmount(amt);
                        setCustomAirtimeInput(String(amt));
                      }}
                      className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF] font-black ring-2 ring-[#1E40AF]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold'
                      }`}
                    >
                      <div className="text-sm">₦{amt.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Pay ₦{Math.round(amt * 0.98)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Airtime Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Or Enter Custom Amount (₦50 - ₦50,000):</label>
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">₦</span>
                <input
                  type="number"
                  min={50}
                  max={50000}
                  value={customAirtimeInput}
                  onChange={(e) => {
                    setCustomAirtimeInput(e.target.value);
                    const val = Number(e.target.value);
                    if (!isNaN(val)) setAirtimeAmount(val);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/10 outline-none font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SERVICE 3: ELECTRICITY BILL TOKENS */}
        {/* ==================================================== */}
        {serviceMode === 'electricity' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step 1: Select Electricity Disco */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Select Electricity Distribution Company (Disco)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {DISCOS.map((disco) => {
                  const isSelected = selectedDiscoId === disco.id;
                  return (
                    <button
                      key={disco.id}
                      type="button"
                      onClick={() => {
                        setSelectedDiscoId(disco.id);
                        setMeterValidationResult(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50/70 text-[#1E40AF] ring-2 ring-[#1E40AF]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs">{disco.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{disco.code}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Meter Type (Prepaid vs Postpaid) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                2. Meter Type
              </label>
              <div className="flex gap-3 max-w-xs">
                {(['Prepaid', 'Postpaid'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setMeterType(type);
                      setMeterValidationResult(null);
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      meterType === type
                        ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Meter Number & Verification Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                3. Enter Meter Number & Verify Customer
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={meterNumber}
                  onChange={(e) => {
                    setMeterNumber(e.target.value);
                    setMeterValidationResult(null);
                  }}
                  placeholder="Enter 11-digit or 13-digit Meter No."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/10 outline-none font-mono font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleVerifyMeter}
                  disabled={isValidatingMeter || !meterNumber}
                  className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isValidatingMeter ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Verify Name</span>
                    </>
                  )}
                </button>
              </div>

              {/* Validation Result Box */}
              {meterValidationResult && (
                <div
                  className={`mt-2 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    meterValidationResult.verified
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {meterValidationResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    {meterValidationResult.verified ? (
                      <>
                        <p className="font-bold text-slate-900">{meterValidationResult.name}</p>
                        <p className="text-[11px] text-slate-600">{meterValidationResult.address}</p>
                      </>
                    ) : (
                      <p>{meterValidationResult.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Electricity Amount */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                4. Select Recharge Amount (Min ₦500)
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_ELECTRICITY_AMOUNTS.map((amt) => {
                  const isSelected = electricityAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setElectricityAmount(amt);
                        setCustomElectricityInput(String(amt));
                      }}
                      className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF] font-black ring-2 ring-[#1E40AF]/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold'
                      }`}
                    >
                      <div className="text-xs">₦{amt.toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 max-w-xs">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Custom Amount:</span>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">₦</span>
                  <input
                    type="number"
                    min={500}
                    value={customElectricityInput}
                    onChange={(e) => {
                      setCustomElectricityInput(e.target.value);
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setElectricityAmount(val);
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/10 outline-none font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Phone Number for Token SMS */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                5. Phone Number to Receive Token SMS / Receipt
              </label>
              <input
                type="tel"
                value={electricityPhone || phoneNumber}
                onChange={(e) => setElectricityPhone(e.target.value)}
                placeholder="e.g. 0803 123 4567"
                maxLength={11}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/10 outline-none font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SERVICE 4: CABLE TV SUBSCRIPTIONS */}
        {/* ==================================================== */}
        {serviceMode === 'cable' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step 1: Select Provider (GOtv, DStv, StarTimes) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Select Cable TV Provider
              </label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {CABLE_PROVIDERS.map((provider) => {
                  const isSelected = selectedCableId === provider.id;
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        setSelectedCableId(provider.id);
                        setCableValidationResult(null);
                      }}
                      className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF] font-black ring-2 ring-[#1E40AF]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold'
                      }`}
                    >
                      <Tv className="w-5 h-5 mx-auto mb-1 text-[#1E40AF]" />
                      <div className="text-sm">{provider.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Smartcard / IUC & Verification */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                2. Enter IUC / SmartCard Number & Verify
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={smartCardNumber}
                  onChange={(e) => {
                    setSmartCardNumber(e.target.value);
                    setCableValidationResult(null);
                  }}
                  placeholder="Enter 10-digit SmartCard / IUC No."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/10 outline-none font-mono font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleVerifySmartCard}
                  disabled={isValidatingCable || !smartCardNumber}
                  className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isValidatingCable ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Verify Name</span>
                    </>
                  )}
                </button>
              </div>

              {cableValidationResult && (
                <div
                  className={`mt-2 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    cableValidationResult.verified
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {cableValidationResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    {cableValidationResult.verified ? (
                      <p className="font-bold text-slate-900">{cableValidationResult.name}</p>
                    ) : (
                      <p>{cableValidationResult.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Choose Package / Bouquet */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                3. Select Bouquet / Package
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableCablePlans.map((plan) => {
                  const isSelected = selectedCablePlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedCablePlanId(plan.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1E40AF] bg-blue-50/60 ring-2 ring-[#1E40AF]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{plan.name}</div>
                        <div className="text-xs text-slate-500 font-semibold">1 Month Validity</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-[#1E40AF]">
                          {formatCurrency(plan.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Phone Number for Confirmation */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                4. Recipient Phone Number
              </label>
              <input
                type="tel"
                value={cablePhone || phoneNumber}
                onChange={(e) => setCablePhone(e.target.value)}
                placeholder="e.g. 0803 123 4567"
                maxLength={11}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#1E40AF] focus:ring-4 focus:ring-[#1E40AF]/10 outline-none font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        )}

        {/* Master CTA Button */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            type="button"
            id="proceed-checkout-button"
            onClick={handleCheckoutClick}
            className="w-full py-4 px-6 rounded-2xl bg-[#1E40AF] text-white font-bold text-base hover:bg-blue-700 transition-all cursor-pointer shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group"
          >
            <span>
              {serviceMode === 'electricity'
                ? `Proceed to Pay ₦${electricityAmount.toLocaleString()} Electricity Token`
                : serviceMode === 'cable'
                ? `Proceed to Renew ${currentCablePlan ? formatCurrency(currentCablePlan.amount) : ''}`
                : serviceMode === 'airtime'
                ? `Proceed to Buy ₦${airtimeAmount.toLocaleString()} Airtime`
                : `Proceed to Buy ${currentSelectedPlan?.size || ''} Data Bundle`}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
