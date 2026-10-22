'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { NETWORKS, CURATED_DATA_PLANS } from '@/lib/constants';
import { fetchOrdersByUser, getAdminSettings, AdminSettings, DEFAULT_ADMIN_SETTINGS } from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import { PurchaseModal } from '@/components/PurchaseModal';
import {
  Smartphone,
  Zap,
  Tv,
  Wallet,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Trophy,
  Copy,
  Check,
  Send,
  Eye,
  Frown,
  Grid,
  AlertCircle
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, profile, refreshProfile } = useAuth();

  // Quick Vending Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('1');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<DataPlan | null>(null);
  const [checkoutNetwork, setCheckoutNetwork] = useState<NetworkInfo | null>(null);

  // Orders & Settings State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserOrders();
      getAdminSettings()
        .then((s) => setAdminSettings(s))
        .catch(() => {});
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    try {
      const userOrders = await fetchOrdersByUser(user.uid, user.email || undefined);
      setOrders(userOrders);
    } catch {
      // Graceful fallback
    }
  };

  const availablePlans = selectedNetworkId
    ? CURATED_DATA_PLANS.filter((p) => p.networkId.toString() === selectedNetworkId)
    : [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setFormError('Please enter a valid 11-digit phone number (e.g. 08012345678)');
      return;
    }

    if (!selectedNetworkId) {
      setFormError('Please select a telecom network');
      return;
    }

    if (!selectedPlanId) {
      setFormError('Please choose a data bundle plan');
      return;
    }

    const net = NETWORKS.find((n) => n.id.toString() === selectedNetworkId);
    const plan = CURATED_DATA_PLANS.find((p) => p.id === selectedPlanId);

    if (!net || !plan) {
      setFormError('Invalid plan or network selected.');
      return;
    }

    setCheckoutNetwork(net);
    setCheckoutPlan(plan);
    setIsPurchaseModalOpen(true);
  };

  const handleOrderCompleted = (newTx: Transaction) => {
    setOrders((prev) => [newTx, ...prev]);
    refreshProfile();
  };

  const userFullName =
    profile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Bello');

  const userFirstName = userFullName.split(' ')[0] || 'Bello';

  const successfulTxCount = orders.filter((o) => o.status === 'SUCCESS' || o.status === 'successful').length;
  const totalSalesAmount = orders
    .filter((o) => o.status === 'SUCCESS' || o.status === 'successful')
    .reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-7 max-w-[1340px] mx-auto">
      {/* Greeting Row + Wallet Balance Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, <span className="font-extrabold">{userFirstName}</span>
          </h1>
        </div>

        <Link
          href="/dashboard/wallet"
          className="self-start sm:self-auto flex items-center gap-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-amber-400 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          title="Click to fund wallet"
        >
          <span>★</span>
          <span>
            ₦{(profile?.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Link>
      </div>

      {/* Distinction Hero Promo Banner ("Quizathon is Back and Better!" style) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs flex flex-col md:flex-row">
        {/* Left Co-branded Info Panel */}
        <div className="md:w-[40%] bg-[#faf8f5] p-6 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/60">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1e3a8a]"></span>
                <span>DataAbeg</span>
              </div>
              <span className="text-slate-300">×</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Glad Tidings VTU</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              Wholesale SME &amp; CG Data from ₦250/GB
            </h3>
          </div>

          <div className="pt-4 text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Direct Telco Gateway</span>
            <span>•</span>
            <span>Nigerian tertiary students</span>
            <span>•</span>
            <span>18+</span>
          </div>
        </div>

        {/* Right Ruby/Wine Gradient Section ("Quizathon is Back and Better!") */}
        <div className="md:w-[60%] bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#b91c1c] text-white p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10 space-y-3.5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Automated VTU Switch is Live &amp; Instant!
            </h2>
            <p className="text-xs sm:text-sm text-red-100 font-medium leading-relaxed max-w-xl">
              Automated direct dispensing for MTN SME, Airtel CG, Glo &amp; 9mobile. Top up any line in under 5 seconds with instant wallet auto-credit.
            </p>

            <div className="flex items-center gap-4 pt-1">
              <Link
                href="/dashboard/data"
                className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Start Purchase
              </Link>

              <Link
                href="/dashboard/api-docs"
                className="text-white/90 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-48 bg-radial from-red-500/20 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Distinction Banner Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        <span className="w-2 h-2 rounded-full bg-[#1e3a8a]"></span>
        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
      </div>

      {/* ================= SECTION: "Your Utility Hub" ================= */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Your Utility Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Track your ongoing progress and preview what is coming next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Instant Mobile Data */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                  AVAILABLE NOW
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Delivery in 00m 05s</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Instant Mobile Data (All Networks)
              </h3>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    WHOLESALE RATES
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    MTN SME ₦250 • Airtel ₦260 • Glo ₦255
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Route: Glad Tidings VTU
              </span>
              <Link
                href="/dashboard/data"
                className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>Purchase Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Electricity & Meter Tokens */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                  UPCOMING &amp; LIVE
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instant Verification</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Electricity &amp; Meter Token Dispenser
              </h3>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SUPPORTED DISCOS
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    12 Discos: Ikeja, Eko, Abuja, Kano &amp; more
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                0% Convenience Fee Promo
              </span>
              <Link
                href="/dashboard/electricity"
                className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>Buy Token</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Cable TV Renewals */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                  AVAILABLE NOW
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instant Activation</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Cable TV Subscription Renewal
              </h3>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    PROVIDERS
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    DStv, GOtv &amp; StarTimes
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Live IUC Verification
              </span>
              <Link
                href="/dashboard/cable"
                className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>Renew Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOWER SPLIT SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Quick Vending + Recent Transactions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Vending Console */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Direct Quick Data Vending</h2>
                <p className="text-xs text-slate-500 font-medium">Delivers in 5 seconds via Glad Tidings direct carrier route</p>
              </div>
              <Link
                href="/dashboard/bulk-data"
                className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Send Bulk</span>
              </Link>
            </div>

            {/* Telecom Network Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">1. Select Network:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {NETWORKS.map((net) => {
                  const isSelected = selectedNetworkId === net.id.toString();
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => {
                        setSelectedNetworkId(net.id.toString());
                        setSelectedPlanId('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#1e3a8a] bg-blue-50/60 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: net.color, color: net.id === 1 ? '#000' : '#fff' }}
                      >
                        {net.name.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{net.displayName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Direct Switch</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Vending Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    2. Recipient Phone Number:
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    3. Choose Bundle Plan:
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={!selectedNetworkId}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <option value="">- Select Data Plan -</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({plan.validity}) - {formatCurrency(plan.sellingPrice || (plan as any).price || 0)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Dispense Data Instantly</span>
              </button>
            </form>
          </div>

          {/* Distinction Styled Recent Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
                <p className="text-xs text-slate-500 font-medium">Real-time status of your orders</p>
              </div>
              <Link
                href="/dashboard/transactions"
                className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>See All ({orders.length})</span>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full border border-slate-200 text-slate-400 flex items-center justify-center mb-2.5">
                  <Frown className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  Your recent data &amp; bill vending orders will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {orders.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                          tx.status === 'SUCCESS' || tx.status === 'successful'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'PENDING' || tx.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.status || 'SUCCESS'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {tx.networkName || tx.network} • {tx.planName || tx.planSize}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          To: {tx.phone || tx.phoneNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-slate-900">
                        {formatCurrency(tx.amountPaid || tx.amount || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Dedicated Virtual Account */}
        <div className="lg:col-span-4 space-y-6">
          {/* Virtual Account Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Virtual Bank Account</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Auto-Credit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Transfer from any bank app to fund your wallet automatically in 30 seconds.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  BANK NAME
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {adminSettings.bankName || 'Moniepoint MFB / OPay'}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Account Number</div>
                  <div className="text-base font-black font-mono tracking-wider text-slate-900">
                    {adminSettings.accountNumber || '08154276838'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(adminSettings.accountNumber || '08154276838');
                    setCopiedBank(true);
                    setTimeout(() => setCopiedBank(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ACCOUNT NAME
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {adminSettings.accountName || 'DataAbeg VTU Ventures'}
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/wallet"
              className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Fund Wallet Details</span>
            </Link>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Account Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Successful Orders</span>
                <span className="font-bold text-slate-900">{successfulTxCount}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Total Volume Dispensed</span>
                <span className="font-bold text-slate-900">₦{totalSalesAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Reseller Tier</span>
                <span className="font-bold text-blue-700">Level 1 (Direct API)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        plan={checkoutPlan}
        phoneNumber={phoneNumber}
        network={checkoutNetwork}
        onOrderCompleted={handleOrderCompleted}
      />
    </main>
  );
}
