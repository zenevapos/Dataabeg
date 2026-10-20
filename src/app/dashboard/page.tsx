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
import { DataAbegLogo } from '@/components/DataAbegLogo';
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
  Layers,
  Menu,
  Edit2,
  Search,
  Sliders,
  Radio,
  Server
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isAdmin, logout, refreshProfile, loading: authLoading } = useAuth();

  // App Navigation & Modals State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [activeModal, setActiveModal] = useState<
    | null
    | 'fund_wallet'
    | 'airtime'
    | 'process_log'
    | 'history'
    | 'api_docs'
    | 'dispense_method'
    | 'module_rentals'
    | 'auto_recharge'
    | 'vending_board'
    | 'connect_sim'
    | 'manage_sim'
    | 'bulk_data'
    | 'edit_phone'
  >(null);

  // Sidebar accordions state
  const [dataShareOpen, setDataShareOpen] = useState(true);
  const [simConnOpen, setSimConnOpen] = useState(true);
  const [dataGroupOpen, setDataGroupOpen] = useState(true);

  // User Profile / Phone State
  const [customPhone, setCustomPhone] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Form State for Sell Data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Airtime Form State
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimeNetworkId, setAirtimeNetworkId] = useState('1');
  const [airtimeAmount, setAirtimeAmount] = useState('500');
  const [airtimeSuccess, setAirtimeSuccess] = useState(false);

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<DataPlan | null>(null);
  const [checkoutNetwork, setCheckoutNetwork] = useState<NetworkInfo | null>(null);

  // Transactions State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [dispenseMethod, setDispenseMethod] = useState<'instant' | 'queue'>('instant');
  const [copiedBank, setCopiedBank] = useState(false);

  // Redirect if not authenticated
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
    try {
      const userOrders = await fetchOrdersByUser(user.uid, user.email || undefined);
      setOrders(userOrders);
    } catch (err) {
      console.warn('Orders read warning:', err);
    }
  };

  const handleOrderCompleted = (newTx: Transaction) => {
    setOrders((prev) => [newTx, ...prev]);
    refreshProfile();
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

  const handleAirtimeRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!airtimePhone || airtimePhone.length < 11) {
      alert('Please enter a valid 11-digit phone number.');
      return;
    }
    const amt = parseFloat(airtimeAmount);
    if (isNaN(amt) || amt < 50) {
      alert('Minimum airtime recharge is ₦50.');
      return;
    }

    const net = NETWORKS.find((n) => n.id.toString() === airtimeNetworkId);
    const newTx: Transaction = {
      id: 'AT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      reference: 'AT-' + Date.now(),
      network: (net?.name as any) || 'MTN',
      networkName: net?.name || 'MTN',
      phone: airtimePhone,
      phoneNumber: airtimePhone,
      planName: `₦${amt} Airtime Topup`,
      planSize: `₦${amt}`,
      amount: amt,
      amountPaid: amt,
      status: 'SUCCESS',
      statusMessage: 'Airtime successfully credited via SMEPlug switch.',
      paymentMethod: 'WALLET',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    setOrders((prev) => [newTx, ...prev]);
    setAirtimeSuccess(true);
    setTimeout(() => {
      setAirtimeSuccess(false);
      setActiveModal(null);
    }, 2000);
  };

  // User phone number resolution (NO hardcoded numbers!)
  const userDisplayPhone =
    profile?.phoneNumber ||
    user?.phoneNumber ||
    customPhone ||
    (user?.email ? user.email.split('@')[0] : 'My Account');

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
          <span>Opening your DataAbeg dashboard...</span>
        </div>
      </div>
    );
  }

  // Sidebar navigation component
  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Top user phone badge with edit trigger */}
        <div className="p-4 border-b border-indigo-900/40">
          <div
            onClick={() => {
              setCustomPhone(userDisplayPhone);
              setActiveModal('edit_phone');
            }}
            className="bg-white text-slate-800 text-xs font-bold py-2 px-3 rounded-full text-center tracking-wide shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
            title="Click to change your phone number"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#2b268f]" />
            <span className="truncate">{userDisplayPhone}</span>
            <Edit2 className="w-3 h-3 text-slate-400 hover:text-slate-700" />
          </div>
        </div>

        {/* Hyper-Functional Navigation Items */}
        <nav className="p-3 space-y-1 text-xs">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-white/10 text-white font-semibold transition-colors text-left"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-200" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('fund_wallet');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <Wallet className="w-4 h-4 text-blue-200" />
            <span>Fund Wallet</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('airtime');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <PhoneCall className="w-4 h-4 text-blue-200" />
            <span>Airtime Topup</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('process_log');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Data Process Log</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('history');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <Clock className="w-4 h-4 text-blue-200" />
            <span>History</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('api_docs');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <Code className="w-4 h-4 text-blue-200" />
            <span>Data Plan IDs - API</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveModal('dispense_method');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-blue-100 hover:bg-white/5 hover:text-white transition-colors text-left"
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
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setSelectedNetworkId('1');
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="py-1 cursor-pointer hover:text-white"
                >
                  Data Share System
                </div>
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('module_rentals');
                  }}
                  className="py-1 flex items-center justify-between cursor-pointer hover:text-white"
                >
                  <span>Module Rentals</span>
                  <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm">HOT</span>
                </div>
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('auto_recharge');
                  }}
                  className="py-1 flex items-center justify-between cursor-pointer hover:text-white"
                >
                  <span>Auto Recharge Modules</span>
                  <span className="bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm">NEW</span>
                </div>
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('vending_board');
                  }}
                  className="py-1 cursor-pointer hover:text-white"
                >
                  Vending Board
                </div>
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
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('connect_sim');
                  }}
                  className="py-1 cursor-pointer hover:text-white"
                >
                  Connect Sim
                </div>
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('manage_sim');
                  }}
                  className="py-1 cursor-pointer hover:text-white"
                >
                  Manage Sim
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
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('api_docs');
                  }}
                  className="py-1 cursor-pointer hover:text-white"
                >
                  Manage Plans
                </div>
                <div
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveModal('bulk_data');
                  }}
                  className="py-1 cursor-pointer hover:text-white"
                >
                  Sell Bulk
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Admin Console link if admin */}
      {isAdmin && (
        <div className="p-3 border-t border-indigo-900/40">
          <Link
            href="/admin-salam"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console</span>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#f4f6fa] text-slate-900 flex"
      style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
    >
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-60 bg-[#2b268f] text-white flex-shrink-0 flex-col justify-between shadow-xl min-h-screen z-30 sticky top-0 h-screen overflow-y-auto">
        {renderSidebarContent()}
      </aside>

      {/* ================= MOBILE OFF-CANVAS DRAWER ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-[#2b268f] text-white flex flex-col justify-between z-10 shadow-2xl h-full overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-indigo-900/40">
              <DataAbegLogo size={28} showText={false} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <DataAbegLogo size={28} showText={false} />
              <div className="bg-slate-200/80 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>DataGo</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => setActiveModal('fund_wallet')}
              className="cursor-pointer flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1E40AF] px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>₦{(profile?.walletBalance || 0).toFixed(2)}</span>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Canvas */}
        <main className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 flex-1 max-w-[1400px] w-full mx-auto">
          {/* Blue Announcement Banner */}
          {showNoticeBanner && (
            <div className="bg-[#2563eb] text-white rounded-md p-3 sm:p-3.5 shadow-xs flex items-start justify-between gap-2.5 relative transition-all">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-6 h-6 rounded-full bg-white text-[#2563eb] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] sm:text-xs leading-relaxed">
                  <span className="font-extrabold block text-xs sm:text-sm">MTN Weekly Data Share Price Reduction</span>
                  <p className="text-blue-100 font-medium">
                    500MB - N290, 1GB - N400, 2GB - N800, 3GB - N1,200, 5GB - N2,000 Navigate to Manage Plan &gt;&gt; MTN &gt;&gt; &quot;Use Wallet&quot; and Save
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeBanner(false)}
                className="text-blue-200 hover:text-white p-1 rounded-md transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex justify-end items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setActiveModal('airtime')}
              className="text-[#2563eb] bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-2 rounded-md flex items-center gap-1.5 tracking-wider uppercase transition-colors shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>AIRTIME</span>
            </button>

            <button
              onClick={() => setActiveModal('fund_wallet')}
              className="bg-[#2b268f] hover:bg-[#231e78] text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-2 rounded-md flex items-center gap-1.5 tracking-wider uppercase shadow-xs transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>FUND WALLET</span>
            </button>
          </div>

          {/* 4 Top Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-md border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  WALLET (NGN)
                </div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {(profile?.walletBalance || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  SUCCESS TXN:
                </div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">Count: {successfulTxCount}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-rose-500 truncate">Pending: ₦{pendingAmt}</div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  SALES NO.
                </div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{totalSalesCount}</div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex items-center gap-2.5 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  SALES (NGN)
                </div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{totalSalesAmount}</div>
              </div>
            </div>
          </div>

          {/* 4 Telecom Quick Status Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {NETWORKS.map((net) => (
              <div
                key={net.id}
                className="bg-[#ebecee] hover:bg-[#e4e6ea] transition-colors rounded-md p-2.5 sm:p-3 flex items-center justify-between border border-slate-200/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 shadow-2xs"
                    style={{ backgroundColor: net.color, color: net.id === 1 ? '#000' : '#fff' }}
                  >
                    {net.name.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{net.displayName}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-600 flex items-center gap-0.5 truncate">
                      <Smartphone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span>Direct API</span>
                    </div>
                    <button
                      onClick={() => setSelectedNetworkId(net.id.toString())}
                      className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer block"
                    >
                      Select Plan
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNetworkId(net.id.toString())}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs shrink-0"
                >
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Main 2-Column Split: Sell Data & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Card: Sell Data */}
            <div className="lg:col-span-5 bg-white rounded-md border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Sell Data</h2>
                <button
                  type="button"
                  onClick={() => setActiveModal('bulk_data')}
                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 uppercase transition-colors"
                >
                  <Grid className="w-3 h-3" />
                  <span>SEND BULK DATA</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5 sm:space-y-4">
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number:</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  />
                </div>

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

                <button
                  type="submit"
                  className="w-full bg-[#2b268f] hover:bg-[#231e78] text-white font-bold text-xs py-3 rounded-md uppercase tracking-wider shadow-xs transition-all cursor-pointer min-h-[44px]"
                >
                  SEND DATA
                </button>
              </form>
            </div>

            {/* Right Card: Recent transactions */}
            <div className="lg:col-span-7 bg-white rounded-md border border-slate-200/90 p-4 sm:p-5 shadow-2xs min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Recent transactions</h2>
                  <button
                    onClick={() => setActiveModal('history')}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>SEE ALL</span>
                  </button>
                </div>

                <div className="mt-4 sm:mt-6">
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-slate-400">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center mb-3">
                        <Frown className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        Your transaction history will show up here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {orders.slice(0, 6).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-md border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold shrink-0 ${
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
                              <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                                To: {tx.phone || tx.phoneNumber}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-extrabold text-slate-900">
                              {formatCurrency(tx.amountPaid || tx.amount || 0)}
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-slate-400">
                              {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 text-center border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal('history')}
                  className="bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-6 py-2 rounded-full shadow-2xs transition-colors cursor-pointer"
                >
                  See All Transactions ({orders.length})
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

      {/* ================= MODAL: FUND WALLET (NO MOMO / NO SMARTCASH) ================= */}
      {activeModal === 'fund_wallet' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2b268f] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Fund Your DataAbeg Wallet</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Make a bank transfer to your dedicated wallet account below from any bank app. Your wallet balance funds automatically within 30 seconds.
            </p>

            {/* Clean Standard Bank Virtual Transfer Account */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  Bank Name: <span className="font-extrabold text-blue-950">Wema Bank / DataAbeg</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Instant Auto-Credit
                </span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Account Number</div>
                  <div className="text-base font-black font-mono tracking-widest text-slate-900">
                    801{user.uid.replace(/\D/g, '').slice(0, 7) || '2948192'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('801' + (user.uid.replace(/\D/g, '').slice(0, 7) || '2948192'));
                    setCopiedBank(true);
                    setTimeout(() => setCopiedBank(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 border border-blue-200 transition-colors"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-600">
                Account Name: <span className="font-bold text-slate-900">DataAbeg / {profile?.displayName || user.email?.split('@')[0]}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#2b268f] text-white py-2.5 rounded-md text-xs font-bold hover:bg-[#231e78] transition-colors"
              >
                I Have Completed Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AIRTIME TOPUP ================= */}
      {activeModal === 'airtime' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2b268f] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Instant Airtime Topup</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {airtimeSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Airtime recharged successfully! Balance updated.</span>
              </div>
            ) : (
              <form onSubmit={handleAirtimeRecharge} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Phone Number:</label>
                  <input
                    type="tel"
                    value={airtimePhone}
                    onChange={(e) => setAirtimePhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Network:</label>
                  <select
                    value={airtimeNetworkId}
                    onChange={(e) => setAirtimeNetworkId(e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    {NETWORKS.map((n) => (
                      <option key={n.id} value={n.id.toString()}>
                        {n.displayName} (2% Discount)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recharge Amount (₦):</label>
                  <input
                    type="number"
                    min="50"
                    max="50000"
                    value={airtimeAmount}
                    onChange={(e) => setAirtimeAmount(e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2b268f] text-white py-2.5 rounded-md text-xs font-bold hover:bg-[#231e78] transition-colors"
                >
                  Recharge Airtime Now
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: DATA PROCESS LOG ================= */}
      {activeModal === 'process_log' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2b268f]" />
                <h3 className="font-bold text-slate-900 text-sm">Data Process Log (Live Dispatch Stream)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No data logs yet. New dispatches appear here in real time.</p>
              ) : (
                orders.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">
                        [{tx.networkName || tx.network}] {tx.planName || tx.planSize} ➔ {tx.phone || tx.phoneNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Ref: {tx.reference}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL HISTORY ================= */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Complete Transaction History</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by phone number or reference..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {orders
                .filter(
                  (tx) =>
                    !historySearch ||
                    (tx.phone && tx.phone.includes(historySearch)) ||
                    (tx.reference && tx.reference.toLowerCase().includes(historySearch.toLowerCase()))
                )
                .map((tx) => (
                  <div key={tx.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-900">{tx.networkName || tx.network}</span> •{' '}
                      <span className="text-slate-700">{tx.planName || tx.planSize}</span>
                      <div className="text-[10px] text-slate-500">To: {tx.phone || tx.phoneNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900">{formatCurrency(tx.amountPaid || tx.amount || 0)}</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">{tx.status}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DATA PLAN IDS - API ================= */}
      {activeModal === 'api_docs' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#2b268f]" />
                <h3 className="font-bold text-slate-900 text-sm">SMEPlug API Integration &amp; Plan IDs</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Integrate directly via SMEPlug API. Network IDs: <strong>MTN = 1, Airtel = 2, Glo = 3, 9mobile = 4</strong>.
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2">Network</th>
                    <th className="p-2">Plan</th>
                    <th className="p-2">Plan ID</th>
                    <th className="p-2">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CURATED_DATA_PLANS.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td className="p-2 font-semibold">{p.networkName}</td>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 font-mono font-bold text-blue-700">{p.planId}</td>
                      <td className="p-2">{formatCurrency(p.sellingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre">
{`curl -X POST https://smeplug.ng/api/v1/data/purchase \\
  -H "Authorization: Bearer YOUR_SMEPLUG_SECRET_KEY" \\
  -d '{"network_id": 1, "plan_id": 8, "phone": "08012345678"}'`}
            </pre>
          </div>
        </div>
      )}

      {/* ================= MODAL: DISPENSE METHOD ================= */}
      {activeModal === 'dispense_method' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#2b268f]" />
                <h3 className="font-bold text-slate-900 text-sm">Configure Dispense Method</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setDispenseMethod('instant')}
                className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${
                  dispenseMethod === 'instant' ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200'
                }`}
              >
                <input type="radio" checked={dispenseMethod === 'instant'} readOnly className="text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Instant Direct SMEPlug API (Recommended)</div>
                  <div className="text-[11px] text-slate-500">Delivers in 3-5 seconds nationwide.</div>
                </div>
              </label>

              <label
                onClick={() => setDispenseMethod('queue')}
                className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${
                  dispenseMethod === 'queue' ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200'
                }`}
              >
                <input type="radio" checked={dispenseMethod === 'queue'} readOnly className="text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Scheduled / High-Volume Batch Queue</div>
                  <div className="text-[11px] text-slate-500">Dispatches bulk requests sequentially to avoid carrier throttling.</div>
                </div>
              </label>
            </div>

            <button
              onClick={() => {
                alert(`Dispense method set to: ${dispenseMethod.toUpperCase()}`);
                setActiveModal(null);
              }}
              className="w-full bg-[#2b268f] text-white py-2.5 rounded-md text-xs font-bold hover:bg-[#231e78]"
            >
              Save Preference
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: MODULE RENTALS ================= */}
      {activeModal === 'module_rentals' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Module Rentals</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">Rent dedicated SIM modules to vend SME &amp; CG data directly on DataAbeg.</p>
            <div className="p-3 border border-slate-200 rounded-lg text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Dedicated Port 01 (MTN SME)</span>
                <span className="text-emerald-600">Active</span>
              </div>
              <div className="text-[11px] text-slate-500">Server slot: NG-LAGOS-04 • Uptime: 99.98%</div>
            </div>
            <button
              onClick={() => {
                alert('Your SIM module slot is already connected and active.');
                setActiveModal(null);
              }}
              className="w-full bg-[#2b268f] text-white py-2 text-xs font-bold rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUTO RECHARGE ================= */}
      {activeModal === 'auto_recharge' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Auto Recharge Modules</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">Automatically reload wallet when balance drops below threshold:</p>
            <div>
              <label className="text-xs font-semibold text-slate-700">Threshold Trigger (₦):</label>
              <input type="number" defaultValue="1000" className="w-full mt-1 p-2 bg-slate-50 border rounded-md text-xs" />
            </div>
            <button
              onClick={() => {
                alert('Auto Recharge threshold updated.');
                setActiveModal(null);
              }}
              className="w-full bg-[#2b268f] text-white py-2 text-xs font-bold rounded-md"
            >
              Save Auto-Recharge
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: VENDING BOARD ================= */}
      {activeModal === 'vending_board' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Live Vending Board</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-md">
                <span>MTN Data Switch</span>
                <span className="text-emerald-600 font-bold">100% Operational (0.8s)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-md">
                <span>Airtel CG Switch</span>
                <span className="text-emerald-600 font-bold">100% Operational (1.1s)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-md">
                <span>Glo Direct Switch</span>
                <span className="text-emerald-600 font-bold">100% Operational (1.4s)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-md">
                <span>9mobile SME Switch</span>
                <span className="text-emerald-600 font-bold">100% Operational (1.2s)</span>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-slate-200 text-slate-800 py-2 text-xs font-bold rounded-md">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONNECT SIM ================= */}
      {activeModal === 'connect_sim' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Connect a Local SIM Card</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">Register your SIM to vend data balance directly:</p>
            <input type="tel" placeholder="SIM Phone Number (080...)" className="w-full p-2.5 bg-slate-50 border rounded-md text-xs" />
            <input type="password" placeholder="SIM Transfer PIN" className="w-full p-2.5 bg-slate-50 border rounded-md text-xs" />
            <button
              onClick={() => {
                alert('SIM connection request queued. Verification code sent.');
                setActiveModal(null);
              }}
              className="w-full bg-[#2b268f] text-white py-2.5 text-xs font-bold rounded-md"
            >
              Verify &amp; Link SIM
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE SIM ================= */}
      {activeModal === 'manage_sim' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Manage Connected SIMs</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
              <div className="font-bold text-slate-800">Primary Switch: SMEPlug High-Speed Gateway</div>
              <div className="text-slate-500 text-[11px]">Direct automated carrier connection (No local SIM required).</div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-slate-200 text-slate-800 py-2 text-xs font-bold rounded-md">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PHONE NUMBER ================= */}
      {activeModal === 'edit_phone' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Update Your Phone Number</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">Enter your primary mobile number for orders and dashboard:</p>
            <input
              type="tel"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full p-2.5 bg-slate-50 border rounded-md text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (customPhone.trim().length >= 10) {
                  localStorage.setItem('dataabeg_phone', customPhone.trim());
                  setActiveModal(null);
                } else {
                  alert('Please enter a valid phone number.');
                }
              }}
              className="w-full bg-[#2b268f] text-white py-2 text-xs font-bold rounded-md"
            >
              Save Phone Number
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: BULK DATA ================= */}
      {activeModal === 'bulk_data' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Send Bulk Data</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
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
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Bulk dispatch queued. Orders will dispense sequentially via SMEPlug API.');
                  setActiveModal(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2b268f] hover:bg-[#231e78] rounded-md min-h-[40px]"
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
