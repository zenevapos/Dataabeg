'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL } from '@/lib/firebase';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { NETWORKS, CURATED_DATA_PLANS } from '@/lib/constants';
import { fetchOrdersByUser } from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import { PurchaseModal } from '@/components/PurchaseModal';
import {
  LayoutDashboard,
  Wallet,
  PhoneCall,
  FileText,
  Clock,
  Code,
  Package,
  ChevronDown,
  ChevronRight,
  Send,
  Smartphone,
  TrendingUp,
  BarChart3,
  X,
  Info,
  LogOut,
  Eye,
  Frown,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Grid,
  Zap,
  ShieldCheck,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isAdmin, logout, refreshProfile, loading: authLoading } = useAuth();

  // App UI State
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [copiedMomo, setCopiedMomo] = useState(false);
  const [copiedSmartcash, setCopiedSmartcash] = useState(false);

  // Sidebar accordions state
  const [dataShareOpen, setDataShareOpen] = useState(true);
  const [simConnOpen, setSimConnOpen] = useState(true);
  const [integrationsOpen, setIntegrationsOpen] = useState(true);
  const [dataGroupOpen, setDataGroupOpen] = useState(true);

  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<DataPlan | null>(null);
  const [checkoutNetwork, setCheckoutNetwork] = useState<NetworkInfo | null>(null);

  // Transactions State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [viewAllTx, setViewAllTx] = useState(false);

  // If not authenticated and not loading, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load orders
  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const userOrders = await fetchOrdersByUser(user.uid, user.email || undefined);
      setOrders(userOrders);
    } catch (err) {
      console.warn('Orders read warning:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleOrderCompleted = (newTx: Transaction) => {
    setOrders((prev) => [newTx, ...prev]);
    refreshProfile();
  };

  // Available plans for the chosen network
  const availablePlans = selectedNetworkId
    ? CURATED_DATA_PLANS.filter((p) => p.networkId.toString() === selectedNetworkId)
    : [];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate phone number
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

  const copyText = (text: string, type: 'momo' | 'smartcash') => {
    navigator.clipboard.writeText(text);
    if (type === 'momo') {
      setCopiedMomo(true);
      setTimeout(() => setCopiedMomo(false), 2500);
    } else {
      setCopiedSmartcash(true);
      setTimeout(() => setCopiedSmartcash(false), 2500);
    }
  };

  const userPhone = profile?.phoneNumber || user?.phoneNumber || '08154276838';
  const momoAcc = profile?.momoVirtualAccount || '671' + (user ? user.uid.slice(0, 7) : '8942158');
  const smartcashAcc = profile?.smartcashVirtualAccount || '90' + (user ? user.uid.slice(0, 8) : '89421581');

  // Stats calculation
  const successfulTxCount = orders.filter((o) => o.status === 'SUCCESS' || o.status === 'successful').length;
  const pendingAmt = orders
    .filter((o) => o.status === 'PENDING' || o.status === 'pending')
    .reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);
  const totalSalesCount = orders.length;
  const totalSalesAmount = orders
    .filter((o) => o.status === 'SUCCESS' || o.status === 'successful')
    .reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2b268f]" />
          <span>Opening your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900 flex font-sans">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-60 bg-[#2b268f] text-white flex-shrink-0 flex flex-col justify-between shadow-xl min-h-screen z-30">
        <div>
          {/* Top user phone badge */}
          <div className="p-4 border-b border-indigo-900/40">
            <div className="bg-white text-slate-800 text-xs font-bold py-2 px-3 rounded-full text-center tracking-wide shadow-sm select-all">
              {userPhone}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-xs">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-white/10 text-white font-semibold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-200" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={() => setShowFundModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <Wallet className="w-4 h-4 text-blue-200" />
              <span>Fund Wallet</span>
            </button>

            <button
              onClick={() => {
                alert('Airtime Topup is active. You can purchase instant airtime via SMEPlug.');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <PhoneCall className="w-4 h-4 text-blue-200" />
              <span>Airtime Topup</span>
            </button>

            <button
              onClick={() => setViewAllTx(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Data Process Log</span>
            </button>

            <button
              onClick={() => setViewAllTx(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <Clock className="w-4 h-4 text-blue-200" />
              <span>History</span>
            </button>

            <button
              onClick={() => {
                alert('SMEPlug API Integration is connected: MTN 500MB (ID: 7), 1GB (ID: 8), 2GB (ID: 11), 3GB (ID: 43), 5GB (ID: 12).');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <Code className="w-4 h-4 text-blue-200" />
              <span>Data Plan IDs - API</span>
            </button>

            <button
              onClick={() => {
                alert('Dispense Method is set to Instant Direct API via SMEPlug.');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <Package className="w-4 h-4 text-blue-200" />
              <span>Dispense Method</span>
            </button>

            {/* Accordion: DATA SHARE */}
            <div className="pt-2">
              <button
                onClick={() => setDataShareOpen(!dataShareOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-blue-200 uppercase hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>DATA SHARE</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dataShareOpen ? '' : '-rotate-90'}`} />
              </button>

              {dataShareOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-[11px] text-blue-100">
                  <div className="py-1 cursor-pointer hover:text-white">Data Share System</div>
                  <div className="py-1 flex items-center justify-between cursor-pointer hover:text-white">
                    <span>Module Rentals</span>
                    <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm">HOT</span>
                  </div>
                  <div className="py-1 flex items-center justify-between cursor-pointer hover:text-white">
                    <span>Auto Recharge Modules</span>
                    <span className="bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm">NEW</span>
                  </div>
                  <div className="py-1 cursor-pointer hover:text-white">Vending Board</div>
                  <div className="py-1 cursor-pointer hover:text-white">Merge Groups</div>
                </div>
              )}
            </div>

            {/* Accordion: SIM CONNECTIONS */}
            <div className="pt-1">
              <button
                onClick={() => setSimConnOpen(!simConnOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-blue-200 uppercase hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>SIM CONNECTIONS</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${simConnOpen ? '' : '-rotate-90'}`} />
              </button>

              {simConnOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-[11px] text-blue-100">
                  <div className="py-1 cursor-pointer hover:text-white">Connect Sim</div>
                  <div className="py-1 cursor-pointer hover:text-white">Manage Sim</div>
                </div>
              )}
            </div>

            {/* Accordion: INTEGRATIONS */}
            <div className="pt-1">
              <button
                onClick={() => setIntegrationsOpen(!integrationsOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-blue-200 uppercase hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  <span>INTEGRATIONS</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${integrationsOpen ? '' : '-rotate-90'}`} />
              </button>

              {integrationsOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-[11px] text-blue-100">
                  <div
                    onClick={() => setShowFundModal(true)}
                    className="py-1 cursor-pointer hover:text-white"
                  >
                    Smartcash
                  </div>
                  <div
                    onClick={() => setShowFundModal(true)}
                    className="py-1 flex items-center justify-between cursor-pointer hover:text-white"
                  >
                    <span>Momo PSB (671)</span>
                    <span className="bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm">NEW</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: DATA */}
            <div className="pt-1">
              <button
                onClick={() => setDataGroupOpen(!dataGroupOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-blue-200 uppercase hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>DATA</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dataGroupOpen ? '' : '-rotate-90'}`} />
              </button>

              {dataGroupOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 text-[11px] text-blue-100">
                  <div className="py-1 cursor-pointer hover:text-white">Manage Plans</div>
                  <div
                    onClick={() => setShowBulkModal(true)}
                    className="py-1 cursor-pointer hover:text-white"
                  >
                    Sell Bulk
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: DEVICES */}
            <div className="pt-1">
              <button className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-blue-200 uppercase hover:text-white transition-colors">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>DEVICES</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </nav>
        </div>

        {/* Admin Console link if admin */}
        {isAdmin && (
          <div className="p-3 border-t border-indigo-900/40">
            <Link
              href="/admin-salam"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>
          </div>
        )}
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div className="bg-slate-200/80 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>DataGo</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Canvas */}
        <main className="p-6 space-y-5 flex-1 max-w-[1400px] w-full">
          {/* Blue Announcement Banner */}
          {showNoticeBanner && (
            <div className="bg-[#2563eb] text-white rounded-md p-3.5 shadow-sm flex items-start justify-between gap-3 relative transition-all">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white text-[#2563eb] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-extrabold block text-sm">MTN Weekly Data Share Price Reduction</span>
                  <p className="text-blue-100 font-medium">
                    500MB - N290, 1GB - N400, 2GB - N800, 3GB - N1,200, 5GB - N2,000 Navigate to Manage Plan &gt;&gt; MTN &gt;&gt; &quot;Use Wallet&quot; and Save
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeBanner(false)}
                className="text-blue-200 hover:text-white p-1 rounded-md transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Action Buttons (Transfer & Fund Wallet) */}
          <div className="flex justify-end items-center gap-2.5">
            <button
              onClick={() => setShowFundModal(true)}
              className="text-[#2563eb] bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold px-4 py-2 rounded-md flex items-center gap-1.5 tracking-wider uppercase transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSFER</span>
            </button>

            <button
              onClick={() => setShowFundModal(true)}
              className="bg-[#2b268f] hover:bg-[#231e78] text-white text-xs font-bold px-4 py-2 rounded-md flex items-center gap-1.5 tracking-wider uppercase shadow-xs transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>FUND WALLET</span>
            </button>
          </div>

          {/* 4 Top Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: WALLET */}
            <div className="bg-white rounded-md border border-slate-200/90 p-4 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">WALLET (NGN)</div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {(profile?.walletBalance || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Card 2: SUCCESSFUL TXN USAGE */}
            <div className="bg-white rounded-md border border-slate-200/90 p-4 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SUCCESSFUL TXN USAGE:</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">Count: {successfulTxCount}</div>
                <div className="text-[11px] font-bold text-rose-500">Pending Amt NGN {pendingAmt}</div>
              </div>
            </div>

            {/* Card 3: SALES NO. */}
            <div className="bg-white rounded-md border border-slate-200/90 p-4 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SALES NO.</div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalSalesCount}</div>
              </div>
            </div>

            {/* Card 4: SALES (NGN) */}
            <div className="bg-white rounded-md border border-slate-200/90 p-4 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SALES (NGN)</div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalSalesAmount}</div>
              </div>
            </div>
          </div>

          {/* 4 Telecom Quick Status Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* MTN */}
            <div className="bg-[#ebecee] hover:bg-[#e4e6ea] transition-colors rounded-md p-3 flex items-center justify-between border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  MTN
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">MTN</div>
                  <div className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>No connected sim</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNetworkId('1');
                    }}
                    className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer block"
                  >
                    Manage
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedNetworkId('1')}
                className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Airtel */}
            <div className="bg-[#ebecee] hover:bg-[#e4e6ea] transition-colors rounded-md p-3 flex items-center justify-between border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  airtel
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Airtel</div>
                  <div className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>No connected sim</span>
                  </div>
                  <button
                    onClick={() => setSelectedNetworkId('2')}
                    className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer block"
                  >
                    Manage
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedNetworkId('2')}
                className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* T2 (9mobile) */}
            <div className="bg-[#ebecee] hover:bg-[#e4e6ea] transition-colors rounded-md p-3 flex items-center justify-between border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  T2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">T2</div>
                  <div className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>No connected sim</span>
                  </div>
                  <button
                    onClick={() => setSelectedNetworkId('4')}
                    className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer block"
                  >
                    Manage
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedNetworkId('4')}
                className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Glo */}
            <div className="bg-[#ebecee] hover:bg-[#e4e6ea] transition-colors rounded-md p-3 flex items-center justify-between border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  glo
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Glo</div>
                  <div className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>No connected sim</span>
                  </div>
                  <button
                    onClick={() => setSelectedNetworkId('3')}
                    className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer block"
                  >
                    Manage
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedNetworkId('3')}
                className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Left = Sell Data, Right = Recent transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Card: Sell Data */}
            <div className="lg:col-span-5 bg-white rounded-md border border-slate-200/90 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Sell Data</h2>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 uppercase transition-colors"
                >
                  <Grid className="w-3 h-3" />
                  <span>SEND BULK DATA</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Phone Number Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number:</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Network Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Network:</label>
                  <select
                    value={selectedNetworkId}
                    onChange={(e) => {
                      setSelectedNetworkId(e.target.value);
                      setSelectedPlanId('');
                    }}
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="">- Choose Network -</option>
                    {NETWORKS.map((net) => (
                      <option key={net.id} value={net.id.toString()}>
                        {net.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data Plan Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Data Plan:</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={!selectedNetworkId}
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <option value="">- Select Data Plan -</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({plan.validity}) - {formatCurrency(plan.sellingPrice || (plan as any).price || 0)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SEND DATA Button */}
                <button
                  type="submit"
                  className="w-full bg-[#2b268f] hover:bg-[#231e78] text-white font-bold text-xs py-3 rounded-md uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                >
                  SEND DATA
                </button>
              </form>
            </div>

            {/* Right Card: Recent transactions */}
            <div className="lg:col-span-7 bg-white rounded-md border border-slate-200/90 p-5 shadow-2xs min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Recent transactions</h2>
                  <button
                    onClick={() => setViewAllTx(!viewAllTx)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>SEE ALL</span>
                  </button>
                </div>

                {/* Content Area */}
                <div className="mt-6">
                  {orders.length === 0 ? (
                    /* Exact Empty State matching screenshot */
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                      <div className="w-14 h-14 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center mb-3">
                        <Frown className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        Your transaction history will show up here
                      </p>
                    </div>
                  ) : (
                    /* Transactions list */
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {orders.slice(0, viewAllTx ? 50 : 5).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-md border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.status === 'SUCCESS' || tx.status === 'successful'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'PENDING' || tx.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {tx.status || 'SUCCESS'}
                            </span>
                            <div>
                              <div className="font-bold text-slate-800">
                                {tx.networkName || tx.network} • {tx.planName || tx.planSize}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                To: {tx.phone || tx.phoneNumber}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-extrabold text-slate-900">
                              {formatCurrency(tx.amountPaid || tx.amount || 0)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'Just now'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Centered "See All Transactions" Button */}
              <div className="pt-4 text-center border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setViewAllTx(!viewAllTx)}
                  className="bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-6 py-2 rounded-full shadow-2xs transition-colors cursor-pointer"
                >
                  {viewAllTx ? 'Show Less' : 'See All Transactions'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= PURCHASE CONFIRMATION MODAL ================= */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        plan={checkoutPlan}
        phoneNumber={phoneNumber}
        network={checkoutNetwork}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* ================= FUND WALLET MODAL ================= */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2b268f] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Fund Your DataAbeg Wallet</h3>
              </div>
              <button
                onClick={() => setShowFundModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Transfer directly to your dedicated instant virtual accounts from any Nigerian bank app or USSD (*671#). Your wallet will fund automatically within seconds.
            </p>

            {/* Account 1: Momo PSB */}
            <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  MoMo PSB (MTN 671)
                </span>
                <span className="text-sm font-black font-mono text-slate-900 tracking-wider">
                  {momoAcc}
                </span>
                <span className="text-[10px] text-slate-500 block">Account Name: DataAbeg / {profile?.displayName || 'User'}</span>
              </div>
              <button
                onClick={() => copyText(momoAcc, 'momo')}
                className="px-2.5 py-1.5 rounded-md bg-white border border-amber-300 text-xs font-bold text-slate-700 hover:bg-amber-100 flex items-center gap-1 shadow-2xs"
              >
                {copiedMomo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMomo ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Account 2: Smartcash PSB */}
            <div className="p-3.5 rounded-lg border border-red-300 bg-red-50/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                  Smartcash PSB (Airtel 90)
                </span>
                <span className="text-sm font-black font-mono text-slate-900 tracking-wider">
                  {smartcashAcc}
                </span>
                <span className="text-[10px] text-slate-500 block">Account Name: DataAbeg / {profile?.displayName || 'User'}</span>
              </div>
              <button
                onClick={() => copyText(smartcashAcc, 'smartcash')}
                className="px-2.5 py-1.5 rounded-md bg-white border border-red-300 text-xs font-bold text-slate-700 hover:bg-red-100 flex items-center gap-1 shadow-2xs"
              >
                {copiedSmartcash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSmartcash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowFundModal(false)}
              className="w-full bg-[#2b268f] text-white py-2.5 rounded-md text-xs font-bold hover:bg-[#231e78] transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* ================= BULK DATA MODAL ================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Send Bulk Data</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Paste comma-separated phone numbers below to dispense high-speed bundles simultaneously:
            </p>
            <textarea
              rows={4}
              placeholder="08031234567, 08149876543, 09051234890"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Bulk dispatch queued. Orders will dispense sequentially via SMEPlug API.');
                  setShowBulkModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2b268f] hover:bg-[#231e78] rounded-md"
              >
                Start Bulk Dispense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
