'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { NETWORKS, CURATED_DATA_PLANS } from '@/lib/constants';
import { fetchOrdersByUser, getAdminSettings, AdminSettings, DEFAULT_ADMIN_SETTINGS } from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import { PurchaseModal } from '@/components/PurchaseModal';
import NetworkLogo from '@/components/NetworkLogo';
import {
  Smartphone,
  Zap,
  Tv,
  Wallet,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Check,
  Send,
  Eye,
  EyeOff,
  Plus,
  ArrowLeftRight,
  FileText,
  ChevronRight,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, profile, refreshProfile } = useAuth();

  // Balance visibility toggle (like Raenest)
  const [showBalance, setShowBalance] = useState(true);

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
  const [copiedInvite, setCopiedInvite] = useState(false);

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
    (user?.email ? user.email.split('@')[0] : 'Imamshaffy');

  const userFirstName = userFullName.split(' ')[0] || 'Imamshaffy';

  const successfulTxCount = orders.filter((o) => o.status === 'SUCCESS' || o.status === 'successful').length;
  const pendingTxCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'pending').length;
  const failedTxCount = orders.filter((o) => o.status === 'FAILED' || o.status === 'failed' || o.status === 'Declined').length;

  const walletBalance = profile?.walletBalance || 0;

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-[1400px] mx-auto text-slate-800">
      
      {/* ================= 1. GREETING & BALANCE ROW (RAENEST EXACT STYLE) ================= */}
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Hi, {userFirstName}
        </h1>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          {/* Total balance display */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 tracking-wide">
              Total balance
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-space">
                {showBalance ? `₦${walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                title={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action pill buttons on right */}
          <div className="flex items-center flex-wrap gap-2.5">
            <Link
              href="/dashboard/wallet"
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add money</span>
            </Link>

            <Link
              href="/dashboard/data"
              className="bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>Buy data</span>
            </Link>

            <Link
              href="/dashboard/airtime"
              className="bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Airtime</span>
            </Link>

            <Link
              href="/dashboard/electricity"
              className="bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-slate-500" />
              <span>Pay bills</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 2. ALL ACCOUNTS / WALLETS ROW ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">All accounts</h2>
          <Link
            href="/dashboard/wallet"
            className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all accounts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Accounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Main Naira Wallet */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between h-[132px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg leading-none" role="img" aria-label="Nigeria">🇳🇬</span>
                <span className="text-xs font-bold text-slate-800">NG</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 font-space truncate">
                {showBalance ? `₦${walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '••••••'}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(adminSettings.accountNumber || '1855365255');
                  setCopiedBank(true);
                  setTimeout(() => setCopiedBank(false), 2000);
                }}
                className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Copy Moniepoint virtual account"
              >
                <span>🏦 {adminSettings.accountNumber || '1855365255'}</span>
                {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Card 2: MTN SME */}
          <Link
            href="/dashboard/data"
            onClick={() => { setSelectedNetworkId('1'); setSelectedPlanId(''); }}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between h-[132px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <NetworkLogo network="MTN" size={28} roundedClassName="rounded-xl" />
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                SME
              </span>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 font-space truncate">
                ₦290.00 / GB
              </div>
              <div className="text-[11px] text-[#4f46e5] font-semibold mt-1 flex items-center gap-0.5">
                <span>Quick buy</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>

          {/* Card 3: Airtel Corporate */}
          <Link
            href="/dashboard/data"
            onClick={() => { setSelectedNetworkId('3'); setSelectedPlanId(''); }}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all flex flex-col justify-between h-[132px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <NetworkLogo network="AIRTEL" size={28} roundedClassName="rounded-xl" />
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                CG
              </span>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 font-space truncate">
                ₦295.00 / GB
              </div>
              <div className="text-[11px] text-[#4f46e5] font-semibold mt-1 flex items-center gap-0.5">
                <span>Quick buy</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>

          {/* Card 4: Glo SME & CG */}
          <Link
            href="/dashboard/data"
            onClick={() => { setSelectedNetworkId('2'); setSelectedPlanId(''); }}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between h-[132px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <NetworkLogo network="GLO" size={28} roundedClassName="rounded-xl" />
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Direct
              </span>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 font-space truncate">
                ₦275.00 / GB
              </div>
              <div className="text-[11px] text-[#4f46e5] font-semibold mt-1 flex items-center gap-0.5">
                <span>Quick buy</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>

          {/* Card 5: 9mobile */}
          <Link
            href="/dashboard/data"
            onClick={() => { setSelectedNetworkId('6'); setSelectedPlanId(''); }}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between h-[132px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <NetworkLogo network="9MOBILE" size={28} roundedClassName="rounded-xl" />
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                High-Speed
              </span>
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 font-space truncate">
                ₦280.00 / GB
              </div>
              <div className="text-[11px] text-[#4f46e5] font-semibold mt-1 flex items-center gap-0.5">
                <span>Quick buy</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ================= 3. TWO MIDDLE BANNER CARDS (RAENEST EXACT REPLICA) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Tier Limit card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#f0efff] flex items-center justify-center text-[#4f46e5] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-700">
                You are on <span className="font-bold text-slate-900">Tier 1</span> with a ₦500,000 transaction limit.
              </p>
              <Link
                href="/dashboard/wallet"
                className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>Upgrade</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Banner 2: Invite Friends Referral card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between gap-4">
          <div className="space-y-2.5 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              Earn up to <span className="font-bold text-slate-900">₦1,500</span> when you invite friends.
            </p>
            <button
              onClick={() => {
                const inviteLink = `https://dataabeg.vercel.app?ref=${user?.uid || 'data'}`;
                navigator.clipboard.writeText(inviteLink);
                setCopiedInvite(true);
                setTimeout(() => setCopiedInvite(false), 2000);
              }}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{copiedInvite ? 'Link Copied!' : 'Invite friends'}</span>
            </button>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
            🧩
          </div>
        </div>
      </div>

      {/* ================= 4. TWO SIDE-BY-SIDE CARDS: EXCHANGE RATES & INVOICES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Wholesale Telecom Rates (Styled like Raenest's "Exchange rates") */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Exchange rates</h3>
            <Link
              href="/dashboard/data"
              className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-0.5"
            >
              <span>View all rates</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* MTN Pair */}
            <div className="bg-slate-50/80 rounded-xl p-3 text-center border border-slate-100 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                <NetworkLogo network="MTN" size={16} roundedClassName="rounded-xs" />
                <span>MTN</span>
                <span className="text-slate-400 text-[10px]">→</span>
                <span>NGN</span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-900 font-space">
                1 GB = ₦290
              </div>
            </div>

            {/* Airtel Pair */}
            <div className="bg-slate-50/80 rounded-xl p-3 text-center border border-slate-100 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                <NetworkLogo network="AIRTEL" size={16} roundedClassName="rounded-xs" />
                <span>AIR</span>
                <span className="text-slate-400 text-[10px]">→</span>
                <span>NGN</span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-900 font-space">
                1 GB = ₦295
              </div>
            </div>

            {/* Glo Pair */}
            <div className="bg-slate-50/80 rounded-xl p-3 text-center border border-slate-100 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
                <NetworkLogo network="GLO" size={16} roundedClassName="rounded-xs" />
                <span>GLO</span>
                <span className="text-slate-400 text-[10px]">→</span>
                <span>NGN</span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-900 font-space">
                1 GB = ₦275
              </div>
            </div>
          </div>
        </div>

        {/* Right: Invoices / Orders Summary (Styled like Raenest's "Invoices") */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Invoices &amp; Orders</h3>
            <Link
              href="/dashboard/transactions"
              className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-0.5"
            >
              <span>View all invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 text-center">
              <div className="text-[11px] font-medium text-slate-500 mb-1">Pending</div>
              <div className="text-xl font-bold text-slate-900 font-space">{pendingTxCount}</div>
            </div>
            <div className="p-3 text-center border-x border-slate-100">
              <div className="text-[11px] font-medium text-slate-500 mb-1">Processing</div>
              <div className="text-xl font-bold text-slate-900 font-space">0</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-[11px] font-medium text-slate-500 mb-1">Successful</div>
              <div className="text-xl font-bold text-emerald-600 font-space">{successfulTxCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 5. STREAMLINED QUICK VENDING CONSOLE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Quick Data Dispenser</h2>
            <p className="text-xs text-slate-400 font-medium">Automated 5-second carrier delivery</p>
          </div>
          <Link
            href="/dashboard/bulk-data"
            className="text-[#4f46e5] bg-[#f0efff] hover:bg-[#e4e2fd] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            Bulk Vending
          </Link>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Network Selection Pills */}
        <div className="flex items-center gap-2 flex-wrap">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#4f46e5] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <NetworkLogo network={net.name} size={18} roundedClassName="rounded-xs" />
                <span>{net.displayName}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0801 234 5678"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-space font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-colors"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Select Bundle Plan
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={!selectedNetworkId}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-colors cursor-pointer disabled:opacity-50"
            >
              <option value="">- Select Plan -</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.validity}) - {formatCurrency(plan.sellingPrice || (plan as any).price || 0)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 h-[38px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispense</span>
            </button>
          </div>
        </form>
      </div>

      {/* ================= 6. RECENT TRANSACTIONS (RAENEST EXACT TABLE DESIGN) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent transactions</h2>
          <Link
            href="/dashboard/transactions"
            className="text-xs font-semibold text-[#4f46e5] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-1">
            <p className="text-xs font-medium text-slate-500">No recent transactions yet.</p>
            <p className="text-[11px] text-slate-400">Your data top-ups and bill payments will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 8).map((tx) => {
                  const isSuccess = tx.status === 'SUCCESS' || tx.status === 'successful';
                  const isFailed = tx.status === 'FAILED' || tx.status === 'failed' || tx.status === 'Declined';
                  const isDebit = true; // vending orders are debits from wallet
                  const dateStr = tx.timestamp
                    ? new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Oct 26';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Column 1: Date */}
                      <td className="py-4 px-5 text-slate-400 text-xs whitespace-nowrap w-24">
                        {dateStr}
                      </td>

                      {/* Column 2: Logo + Description */}
                      <td className="py-4 px-3 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                            {tx.serviceType === 'airtime' ? (
                              <Send className="w-3.5 h-3.5" />
                            ) : tx.serviceType === 'electricity' ? (
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                            ) : tx.serviceType === 'cable' ? (
                              <Tv className="w-3.5 h-3.5 text-purple-500" />
                            ) : (
                              <Smartphone className="w-3.5 h-3.5 text-[#4f46e5]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {tx.networkName || tx.network || 'DataAbeg'} {tx.planName || tx.planSize || 'Bundle'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              To: {tx.phone || tx.phoneNumber || 'Recipient'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Status Tag (like Raenest Declined pill) */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {isFailed ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Declined
                          </span>
                        ) : isSuccess ? (
                          <span className="text-slate-400 text-[11px] font-medium">
                            Completed
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Column 4: Amount */}
                      <td className="py-4 px-5 font-bold font-space text-right whitespace-nowrap">
                        <span className={isDebit ? 'text-slate-900' : 'text-emerald-600'}>
                          {isDebit ? '-' : '+'}₦{(tx.amountPaid || tx.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Column 5: Note / Reference */}
                      <td className="py-4 px-5 text-slate-400 text-[11px] hidden md:table-cell truncate max-w-xs">
                        From {userFullName} to {tx.phone || tx.phoneNumber || 'DataAbeg'}
                      </td>

                      {/* Column 6: Channel / Type */}
                      <td className="py-4 px-5 text-right text-slate-500 text-[11px] font-medium whitespace-nowrap">
                        {tx.serviceType === 'airtime' ? 'Airtime' : tx.serviceType === 'electricity' ? 'Electricity' : tx.serviceType === 'cable' ? 'Cable TV' : 'Data'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
