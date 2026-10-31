'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Key,
  Database,
  Building2,
  TrendingUp,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  DollarSign,
  Lock,
  LogOut,
  ArrowLeft,
  Smartphone,
  Save,
  Sliders,
  Users,
  Megaphone,
  Radio,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  Plus,
  Minus,
  Activity,
  Send
} from 'lucide-react';
import { Transaction, DataPlan } from '@/lib/types';
import { CURATED_DATA_PLANS, NETWORKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL, ADMIN_EMAILS, isAuthorizedAdmin } from '@/lib/firebase';
import {
  fetchAllOrdersFromFirestore,
  updateOrderStatusInFirestore,
  getAdminSettings,
  saveAdminSettings,
  fetchAllUsersFromFirestore,
  adminAdjustUserBalance,
  UserProfile,
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS
} from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import NetworkLogo from '@/components/NetworkLogo';

export default function AdminSalamPage() {
  const { user, signInWithGoogle, signInWithEmail, logout: authLogout, loading: authLoading } = useAuth();

  // Authentication State
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [inputEmail, setInputEmail] = useState(ADMIN_EMAIL);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'pin' | 'email'>('pin');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'gateway' | 'broadcast' | 'psb' | 'pricing'>('orders');

  // Firestore Data State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Live Gateway Balances
  const [gladtidingsBalance, setGladtidingsBalance] = useState<number | null>(null);
  const [smeplugBalance, setSmeplugBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [networkFilter, setNetworkFilter] = useState<string>('ALL');

  // Wallet Adjustment Modal
  const [selectedUserForAdjustment, setSelectedUserForAdjustment] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState<string>('Manual offline transfer topup');
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);

  // Clipboard & UI Notifications
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_salam_auth');
    if (sessionAuth === 'true') {
      setPinAuthenticated(true);
    }
  }, []);

  // Determine if admin is authorized (Restricted to kokoroowoabdulsalam@gmail.com and belloimam431@gmail.com)
  const isEmailAdmin = isAuthorizedAdmin(user?.email);
  const isAuthenticated = isEmailAdmin || pinAuthenticated;

  // Fetch initial data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoadingOrders(true);
    setIsLoadingUsers(true);
    try {
      const [fetchedSettings, fetchedOrders, fetchedUsers] = await Promise.all([
        getAdminSettings(),
        fetchAllOrdersFromFirestore(200),
        fetchAllUsersFromFirestore(100)
      ]);
      setAdminSettings(fetchedSettings);
      setOrders(fetchedOrders);
      setUsersList(fetchedUsers);

      // Check live balances
      checkGatewaysBalance(fetchedSettings);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingOrders(false);
      setIsLoadingUsers(false);
    }
  };

  const checkGatewaysBalance = async (settings?: AdminSettings) => {
    setIsCheckingBalance(true);
    setBalanceError(null);
    const activeSettings = settings || adminSettings;

    try {
      // 1. Check GladTidings Balance
      const gtKey = activeSettings.gladtidingsApiKey || '230b1f76866a191134045e619ae5f914b2c7cd3f';
      const gtRes = await fetch(`/api/gladtidings/balance?customKey=${encodeURIComponent(gtKey)}`);
      const gtData = await gtRes.json();
      if (gtRes.ok && gtData.balance !== undefined) {
        setGladtidingsBalance(Number(gtData.balance));
      }

      // 2. Check SMEPlug Balance if key exists
      if (activeSettings.smeplugApiKey) {
        const smeRes = await fetch(`/api/smeplug/balance?customKey=${encodeURIComponent(activeSettings.smeplugApiKey)}`);
        const smeData = await smeRes.json();
        if (smeRes.ok && smeData.balance !== undefined) {
          setSmeplugBalance(Number(smeData.balance));
        }
      }
    } catch {
      setBalanceError('Connection warning: Carrier balance check timed out');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (inputPin === 'salam2026' || inputPin === adminSettings.adminPin) {
      setPinAuthenticated(true);
      sessionStorage.setItem('admin_salam_auth', 'true');
    } else {
      setAuthError('Incorrect Master PIN. Default is: salam2026');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const signedInUser = await signInWithGoogle();
      if (!isAuthorizedAdmin(signedInUser.email)) {
        setAuthError(`Access Denied: ${signedInUser.email} is not authorized. Only kokoroowoabdulsalam@gmail.com and belloimam431@gmail.com can access this portal.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const signedInUser = await signInWithEmail(inputEmail.trim(), inputPassword);
      if (!isAuthorizedAdmin(signedInUser.email)) {
        setAuthError(`Access Denied: ${signedInUser.email} is not authorized. Only kokoroowoabdulsalam@gmail.com and belloimam431@gmail.com can access this portal.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Email authentication failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    setPinAuthenticated(false);
    sessionStorage.removeItem('admin_salam_auth');
    setInputPin('');
    await authLogout();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    try {
      await saveAdminSettings(adminSettings);
      setSaveSuccessMsg('Admin configurations successfully updated across DataAbeg!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      checkGatewaysBalance(adminSettings);
    } catch {
      alert('Failed to save settings to Firestore');
    }
  };

  const handleUpdateStatus = async (reference: string, newStatus: 'SUCCESS' | 'PENDING' | 'FAILED') => {
    try {
      await updateOrderStatusInFirestore(reference, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.reference === reference ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Failed to update status in Firestore');
    }
  };

  const handleAdjustUserBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjustment) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive amount in Naira.');
      return;
    }

    setIsSubmittingAdjustment(true);
    setAdjustSuccessMsg(null);
    try {
      const newBal = await adminAdjustUserBalance(
        selectedUserForAdjustment.uid,
        amountNum,
        adjustType,
        adjustReason
      );

      // Update in local users state
      setUsersList((prev) =>
        prev.map((u) =>
          u.uid === selectedUserForAdjustment.uid ? { ...u, walletBalance: newBal } : u
        )
      );

      setAdjustSuccessMsg(`Successfully ${adjustType === 'CREDIT' ? 'credited' : 'debited'} ₦${amountNum.toLocaleString()}! New balance: ₦${newBal.toLocaleString()}`);
      setTimeout(() => {
        setSelectedUserForAdjustment(null);
        setAdjustSuccessMsg(null);
        setAdjustAmount('');
      }, 2500);

      // Refresh orders feed to show new audit transaction
      fetchAllOrdersFromFirestore(200).then((o) => setOrders(o)).catch(() => {});
    } catch (err: any) {
      alert(err?.message || 'Could not adjust user balance');
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'SUCCESS')
    .reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);

  const successfulOrdersCount = orders.filter((o) => o.status === 'SUCCESS').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const failedOrdersCount = orders.filter((o) => o.status === 'FAILED').length;
  const deliverySuccessRate = orders.length > 0
    ? Math.round((successfulOrdersCount / orders.length) * 100)
    : 100;

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.phoneNumber && order.phoneNumber.includes(searchQuery)) ||
      (order.phone && order.phone.includes(searchQuery)) ||
      (order.reference && order.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.planName && order.planName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesNetwork = networkFilter === 'ALL' || order.networkName === networkFilter || order.network === networkFilter;

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.displayName && u.displayName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phoneNumber && u.phoneNumber.includes(query)) ||
      (u.uid && u.uid.toLowerCase().includes(query))
    );
  });

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.com';
  const webhookUrl = `${currentHost}/api/smeplug/webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  // ================= 1. LOGIN SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
        {/* Futuristic glowing backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 text-center relative z-10 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-[#6366f1] mx-auto flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
            DataAbeg <span className="text-[#818cf8]">Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Restricted to: <span className="text-indigo-400 font-mono text-[11px]">kokoroowoabdulsalam@gmail.com</span> &amp; <span className="text-indigo-400 font-mono text-[11px]">belloimam431@gmail.com</span>
          </p>

          {/* Login Method Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl mt-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setLoginMethod('pin'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'pin'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Master PIN (Fast)
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'email'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Email / Google
            </button>
          </div>

          {/* Option A: Master PIN Login */}
          {loginMethod === 'pin' && (
            <form onSubmit={handlePinLogin} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enter Admin Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Enter salam2026"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-sm font-mono text-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-500/20"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default emergency PIN: <code className="text-indigo-400">salam2026</code></p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-lg shadow-indigo-600/30 text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Unlock Admin Portal</span>
              </button>
            </form>
          )}

          {/* Option B: Google / Email Login */}
          {loginMethod === 'email' && (
            <div className="mt-6 space-y-4 text-left">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmittingAuth}
                className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Continue with Authorized Google Account</span>
              </button>

              <form onSubmit={handleEmailSignIn} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] text-xs transition-colors cursor-pointer"
                >
                  {isSubmittingAuth ? 'Verifying...' : 'Sign In with Email'}
                </button>
              </form>
            </div>
          )}

          {authError && (
            <p className="mt-4 text-xs font-medium text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-800/60 text-left flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Customer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. AUTHENTICATED COMMAND CENTER =================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans">
      {/* Top Admin Executive Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center font-black shadow-xs font-space">
                DA
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg font-space tracking-tight">
                  DataAbeg <span className="text-[#4f46e5]">HQ</span>
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Operations
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Active Gateway: <strong className="text-slate-800 uppercase">{adminSettings.activeProvider || 'GLADTIDINGS'}</strong></span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              User App
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Storefront
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: GladTidings Live Balance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>GladTidings Carrier Balance</span>
              <button
                onClick={() => checkGatewaysBalance()}
                disabled={isCheckingBalance}
                className="text-[#4f46e5] hover:text-indigo-800 transition-colors p-1 rounded-md hover:bg-indigo-50 cursor-pointer"
                title="Refresh Live Balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBalance ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-space">
                {gladtidingsBalance !== null ? formatCurrency(gladtidingsBalance) : '₦24,850.00'}
              </span>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active 5-Sec Dispenser Pool</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Gross Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Total Vended Volume
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-space">
                {formatCurrency(totalRevenue)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">From {successfulOrdersCount} completed orders</p>
            </div>
          </div>

          {/* Card 3: Success Rate & Performance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Carrier Delivery Rate</span>
              <span className="text-emerald-700 font-extrabold">{deliverySuccessRate}%</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-space">
                {orders.length}
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                <span className="text-emerald-600 font-bold">{successfulOrdersCount} passed</span> • <span className="text-amber-600 font-bold">{pendingOrdersCount} pending</span> • <span className="text-rose-600 font-bold">{failedOrdersCount} failed</span>
              </p>
            </div>
          </div>

          {/* Card 4: Registered Users */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Registered Customers
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-[#4f46e5] font-space">
                {usersList.length} Users
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Active in Firestore Database</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Orders &amp; Logs ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users &amp; Wallets ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'gateway'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Telecom Gateways</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'broadcast'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Site Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('psb')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'psb'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pricing'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pricing Matrix</span>
          </button>
        </div>

        {/* ================= TAB 1: ORDERS & TRANSACTIONS ================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phone or reference..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#4f46e5] font-space"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="FAILED">Failed Only</option>
                </select>

                <select
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">All Networks</option>
                  <option value="MTN">MTN</option>
                  <option value="AIRTEL">Airtel</option>
                  <option value="GLO">Glo</option>
                  <option value="9MOBILE">9mobile</option>
                </select>

                <button
                  onClick={loadInitialData}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Reload orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Reference / Date</th>
                    <th className="px-4 py-3">Recipient Phone</th>
                    <th className="px-4 py-3">Network &amp; Bundle</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.reference} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono font-bold text-slate-900">{order.reference}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(order.timestamp || order.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 font-space font-mono">
                          {order.phoneNumber || order.phone}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <NetworkLogo network={order.networkName || order.network || 'MTN'} size={18} roundedClassName="rounded-xs" />
                            <span className="font-bold text-slate-900">{order.networkName || order.network}</span>
                            <span className="text-slate-500">{order.planName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 font-space">
                          {formatCurrency(order.amountPaid || order.amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {order.paymentMethod || 'WALLET'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'FAILED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                            {order.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                            {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          {order.status !== 'SUCCESS' && (
                            <button
                              onClick={() => handleUpdateStatus(order.reference, 'SUCCESS')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Mark as Delivered"
                            >
                              Approve
                            </button>
                          )}
                          {order.status !== 'FAILED' && (
                            <button
                              onClick={() => handleUpdateStatus(order.reference, 'FAILED')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Mark as Failed"
                            >
                              Fail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No transactions found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: USERS DIRECTORY & WALLET ADJUSTER ================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Customers &amp; Wallets</h2>
                <p className="text-xs text-slate-500">View user balances, verified phones, and execute instant wallet credit/debit.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#4f46e5]"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Phone Verified?</th>
                    <th className="px-4 py-3">Wallet Balance</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{u.displayName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email || u.uid}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 font-space font-mono">
                          {u.phoneNumber || 'Not Set'}
                        </td>
                        <td className="px-4 py-3">
                          {u.phoneVerified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              Verified ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 font-space text-sm">
                          ₦{(u.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserForAdjustment(u);
                              setAdjustAmount('');
                              setAdjustReason('Manual offline bank transfer credit');
                            }}
                            className="bg-[#f0efff] hover:bg-[#e4e2fd] text-[#4f46e5] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Credit / Debit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        {isLoadingUsers ? 'Loading customer accounts...' : 'No customers found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TELECOM GATEWAYS & PROVIDERS ================= */}
        {activeTab === 'gateway' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-space">
                Telecom Carrier Gateways &amp; Dispatcher
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure your API credentials and select which carrier provider handles live mobile data dispensing.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              {/* Active Provider Switcher */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Primary Carrier Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdminSettings({ ...adminSettings, activeProvider: 'gladtidings' })}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      (adminSettings.activeProvider || 'gladtidings') === 'gladtidings'
                        ? 'border-[#4f46e5] bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">GladTidings API</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">5-second delivery • ₦230 - ₦280 wholesale rate</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSettings({ ...adminSettings, activeProvider: 'smeplug' })}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      adminSettings.activeProvider === 'smeplug'
                        ? 'border-[#4f46e5] bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">SMEPlug API</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Secondary
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">SME &amp; Corporate Gifting backup engine</p>
                  </button>
                </div>
              </div>

              {/* GladTidings API Key Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  GladTidings API Key
                </label>
                <input
                  type="text"
                  value={adminSettings.gladtidingsApiKey || '230b1f76866a191134045e619ae5f914b2c7cd3f'}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, gladtidingsApiKey: e.target.value })
                  }
                  placeholder="230b1f76866a191134045e619ae5f914b2c7cd3f"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Connected to GladTidings live endpoint (<code className="text-slate-700 font-mono">https://gladtidingsdata.com/api/user/</code>).
                </p>
              </div>

              {/* SMEPlug Secret Key Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  SMEPlug Secret Key (Optional Fallback)
                </label>
                <input
                  type="password"
                  value={adminSettings.smeplugApiKey || ''}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, smeplugApiKey: e.target.value })
                  }
                  placeholder="sme_sk_live_..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-slate-50"
                />
              </div>

              {/* Paystack Payment Gateway Box */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-space flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#4f46e5]" />
                      <span>Paystack Live Payment Gateway</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Powers instant debit card checkout and automated wallet funding for DataAbeg users.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Active
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Live Secret Key (sk_live_...)
                  </label>
                  <input
                    type="password"
                    value={adminSettings.paystackSecretKey || ''}
                    onChange={(e) =>
                      setAdminSettings({ ...adminSettings, paystackSecretKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used securely server-side for transaction initialization, verification, and webhooks.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Live Public Key (pk_live_...)
                  </label>
                  <input
                    type="text"
                    value={adminSettings.paystackPublicKey || 'pk_live_49c5d3adb3f90c37a62d3c297eb291a5242abb36'}
                    onChange={(e) =>
                      setAdminSettings({ ...adminSettings, paystackPublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used client-side for Paystack inline checkout popup.
                  </p>
                </div>

                {/* Paystack Webhook Box */}
                <div className="pt-2 border-t border-indigo-100">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paystack Live Webhook URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.vercel.app'}/api/paystack/webhook`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.vercel.app'}/api/paystack/webhook`
                        )
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-bold shrink-0 hover:bg-[#4338ca] transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Paste this in your Paystack Dashboard $\rightarrow$ Settings $\rightarrow$ API Keys &amp; Webhooks $\rightarrow$ Live Webhook URL.
                  </p>
                </div>
              </div>

              {/* Webhook URL Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Automated Webhook Callback URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-bold shrink-0 hover:bg-[#4338ca] transition-colors cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Telecom Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 4: SITE BROADCAST & ANNOUNCEMENTS ================= */}
        {activeTab === 'broadcast' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-space">
                Site Broadcast &amp; Alert Banner
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Post live notices to customer dashboards (e.g. telecom downtime alerts, price updates, holiday bonuses).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">Broadcast Banner Active</p>
                  <p className="text-[11px] text-slate-500">Toggle this to show or hide the announcement bar across user dashboards.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdminSettings({
                      ...adminSettings,
                      broadcastActive: !(adminSettings.broadcastActive ?? true)
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    (adminSettings.broadcastActive ?? true) ? 'bg-[#4f46e5]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                      (adminSettings.broadcastActive ?? true) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Broadcast Message Text
                </label>
                <textarea
                  rows={3}
                  value={adminSettings.broadcastNotice || ''}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, broadcastNotice: e.target.value })
                  }
                  placeholder="⚡ Instant 5-second mobile data delivery active across MTN, Airtel, Glo & 9mobile!"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs text-slate-900 bg-white"
                />
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Live Customer Preview
                </label>
                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 flex items-center gap-2.5 text-xs font-semibold">
                  <Megaphone className="w-4 h-4 text-[#4f46e5] shrink-0 animate-bounce" />
                  <span>{adminSettings.broadcastNotice || '⚡ Super-fast 5-second carrier delivery active across MTN, Airtel, Glo & 9mobile!'}</span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save &amp; Publish Announcement</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 5: BANK SETTLEMENTS & MOMO ================= */}
        {activeTab === 'psb' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-space">
                Bank Transfer &amp; Virtual Funding Settings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                The bank account displayed to customers for automated wallet funding and direct transfers.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-4">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#4f46e5]" />
                  Primary Settlement Account
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={adminSettings.bankName || 'Moniepoint MFB'}
                      onChange={(e) => setAdminSettings({ ...adminSettings, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={adminSettings.accountNumber || '1855365255'}
                      onChange={(e) => setAdminSettings({ ...adminSettings, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-space text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={adminSettings.accountName || 'DataAbeg VTU'}
                      onChange={(e) => setAdminSettings({ ...adminSettings, accountName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Support WhatsApp Line
                </label>
                <input
                  type="text"
                  value={adminSettings.supportPhone || '08154276838'}
                  onChange={(e) => setAdminSettings({ ...adminSettings, supportPhone: e.target.value })}
                  className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 outline-none"
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settlement Details</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 6: PRICING MATRIX ================= */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-space">
                  Active Data Bundles &amp; Margin Matrix
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Live selling prices, commercial bank comparisons, and customer savings across all networks.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-[#4f46e5] border border-indigo-200 font-space">
                {CURATED_DATA_PLANS.length} Active Bundles
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Network</th>
                    <th className="px-4 py-3">Bundle Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Validity</th>
                    <th className="px-4 py-3">DataAbeg Price</th>
                    <th className="px-4 py-3">Bank Rate</th>
                    <th className="px-4 py-3 text-right">Customer Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CURATED_DATA_PLANS.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <NetworkLogo network={plan.networkName} size={18} roundedClassName="rounded-xs" />
                          <span>{plan.networkName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {plan.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                          {plan.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600">
                        {plan.validity}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#4f46e5] font-space">
                        ₦{plan.sellingPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400 line-through font-space">
                        ₦{plan.retailPrice ? plan.retailPrice.toLocaleString() : '---'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 font-space">
                        {plan.retailPrice
                          ? `Save ₦${(plan.retailPrice - plan.sellingPrice).toLocaleString()} (${plan.savingsPercentage || Math.round(
                              ((plan.retailPrice - plan.sellingPrice) / plan.retailPrice) * 100
                            )}%)`
                          : 'Special Wholesale Rate'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================= WALLET CREDIT / DEBIT MODAL ================= */}
      {selectedUserForAdjustment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Adjust Customer Wallet</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedUserForAdjustment.email || selectedUserForAdjustment.displayName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForAdjustment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustUserBalance} className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Wallet Balance:</p>
                <p className="text-xl font-black text-slate-900 font-space">
                  ₦{(selectedUserForAdjustment.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Action Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'CREDIT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Credit (+ Fund)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'DEBIT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Debit (- Deduct)</span>
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount to {adjustType} (₦)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-space font-bold text-slate-900 outline-none focus:bg-white focus:border-[#4f46e5]"
                  required
                  autoFocus
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Offline bank transfer deposit received"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#4f46e5]"
                  required
                />
              </div>

              {adjustSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adjustSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAdjustment(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjustment}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                    adjustType === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingAdjustment ? 'Executing...' : `Confirm ${adjustType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
