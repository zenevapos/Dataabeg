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
  Sliders
} from 'lucide-react';
import { Transaction, DataPlan } from '@/lib/types';
import { CURATED_DATA_PLANS, NETWORKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL } from '@/lib/firebase';
import {
  fetchAllOrdersFromFirestore,
  updateOrderStatusInFirestore,
  getAdminSettings,
  saveAdminSettings,
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS
} from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';

export default function AdminSalamPage() {
  const { user, signInWithGoogle, signInWithEmail, logout: authLogout, loading: authLoading } = useAuth();

  // Authentication State
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [inputEmail, setInputEmail] = useState(ADMIN_EMAIL);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'smeplug' | 'psb' | 'pricing'>('orders');

  // Firestore Data State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // SMEPlug Live Balance
  const [smeplugBalance, setSmeplugBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Orders Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [networkFilter, setNetworkFilter] = useState<string>('ALL');

  // Clipboard Copied State
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_salam_auth');
    if (sessionAuth === 'true') {
      setPinAuthenticated(true);
    }
  }, []);

  // Determine if admin is authorized (either by verified email or master PIN session)
  const isEmailAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  const isAuthenticated = isEmailAdmin || pinAuthenticated;

  // Fetch orders and settings once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoadingOrders(true);
    try {
      const [fetchedSettings, fetchedOrders] = await Promise.all([
        getAdminSettings(),
        fetchAllOrdersFromFirestore(150)
      ]);
      setAdminSettings(fetchedSettings);
      setOrders(fetchedOrders);

      // Check SMEPlug balance
      checkSmeplugBalance(fetchedSettings.smeplugApiKey);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser.email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
        setAuthError(`Access Denied: ${signedInUser.email} is not authorized. Only ${ADMIN_EMAIL} can access this portal.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
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
      if (signedInUser.email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
        setAuthError(`Access Denied: ${signedInUser.email} is not authorized. Only ${ADMIN_EMAIL} can access this portal.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Email authentication failed. Please check your credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (inputPin === 'salam2026' || inputPin === adminSettings.adminPin) {
      setPinAuthenticated(true);
      sessionStorage.setItem('admin_salam_auth', 'true');
    } else {
      setAuthError('Incorrect Emergency PIN.');
    }
  };

  const handleLogout = async () => {
    setPinAuthenticated(false);
    sessionStorage.removeItem('admin_salam_auth');
    setInputPin('');
    await authLogout();
  };

  const checkSmeplugBalance = async (keyOverride?: string) => {
    setIsCheckingBalance(true);
    setBalanceError(null);
    try {
      const activeKey = keyOverride || adminSettings.smeplugApiKey;
      const url = activeKey
        ? `/api/smeplug/balance?customKey=${encodeURIComponent(activeKey)}`
        : '/api/smeplug/balance';

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.balance !== undefined) {
        setSmeplugBalance(data.balance);
      } else {
        setBalanceError(data.message || data.error || 'Could not fetch balance');
      }
    } catch {
      setBalanceError('Connection error to SMEPlug API');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    try {
      await saveAdminSettings(adminSettings);
      localStorage.setItem('dataabeg_smeplug_key', adminSettings.smeplugApiKey);
      setSaveSuccessMsg('Settings saved successfully to Firebase & Local Storage!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      checkSmeplugBalance(adminSettings.smeplugApiKey);
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

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.phoneNumber && order.phoneNumber.includes(searchQuery)) ||
      (order.reference && order.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.planName && order.planName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesNetwork = networkFilter === 'ALL' || order.networkName === networkFilter;

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  // Calculate Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'SUCCESS')
    .reduce((sum, o) => sum + (o.amountPaid || 0), 0);

  const successfulOrdersCount = orders.filter((o) => o.status === 'SUCCESS').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.com';
  const webhookUrl = `${currentHost}/api/smeplug/webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E40AF] mx-auto flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Admin Salam Portal
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Restricted to master administrator: <br />
            <strong className="text-[#1E40AF] font-mono">{ADMIN_EMAIL}</strong>
          </p>

          {/* User logged in with wrong email */}
          {user && !isEmailAdmin ? (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Unauthorized Account</span>
              </div>
              <p className="text-xs text-rose-600">
                You are currently signed in as <strong className="font-mono">{user.email}</strong>. This email does not have administrative privileges.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Sign Out &amp; Switch to {ADMIN_EMAIL}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmittingAuth}
                className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium">Or Email Login</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-md shadow-blue-900/20 text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAuth ? 'Signing In...' : 'Sign In as Admin'}
                </button>
              </form>

              {/* Master PIN Accordion / Fallback */}
              <div className="pt-3 border-t border-slate-100">
                <details className="text-left text-xs">
                  <summary className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
                    Emergency PIN Access
                  </summary>
                  <form onSubmit={handlePinLogin} className="mt-3 space-y-2">
                    <input
                      type="password"
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value)}
                      placeholder="Emergency Master PIN (salam2026)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-center outline-none focus:border-[#1E40AF]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Verify Master PIN
                    </button>
                  </form>
                </details>
              </div>
            </div>
          )}

          {authError && (
            <p className="mt-4 text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-left">
              {authError}
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to DataAbeg Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Console Screen
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-black shadow-sm">
                SA
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg font-heading">
                  Admin <span className="text-[#1E40AF]">Salam</span>
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Firebase Connected
                </span>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1E40AF]" />
                  <span>{ADMIN_EMAIL}</span>
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              User Dashboard
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Storefront
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: SMEPlug Balance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>SMEPlug Live Wallet</span>
              <button
                onClick={() => checkSmeplugBalance()}
                disabled={isCheckingBalance}
                className="text-[#1E40AF] hover:text-blue-800 transition-colors"
                title="Refresh balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBalance ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {smeplugBalance !== null ? formatCurrency(smeplugBalance) : '₦---'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                {balanceError ? (
                  <span className="text-amber-600 font-medium">⚠️ {balanceError}</span>
                ) : (
                  'Automated Dispensing Pool'
                )}
              </p>
            </div>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Total Revenue
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">
                {formatCurrency(totalRevenue)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">From completed orders</p>
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Total Transactions
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                {orders.length}
              </span>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {successfulOrdersCount} Completed • {pendingOrdersCount} Pending
              </p>
            </div>
          </div>

          {/* Card 4: MoMo PSB (671) & Smartcash */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              PSB Bank Accounts
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>MoMo PSB (671): {adminSettings.momoAccountNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                <span>Smartcash: {adminSettings.smartcashAccountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Console Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Orders &amp; Transactions ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('smeplug')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'smeplug'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>SMEPlug API &amp; Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('psb')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'psb'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>MoMo &amp; Smartcash PSB</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pricing'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pricing &amp; Bundles</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & TRANSACTIONS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phone or reference..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#1E40AF]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="FAILED">Failed Only</option>
                </select>

                {/* Network Filter */}
                <select
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#1E40AF]"
                >
                  <option value="ALL">All Networks</option>
                  <option value="MTN">MTN</option>
                  <option value="AIRTEL">Airtel</option>
                  <option value="GLO">Glo</option>
                  <option value="9MOBILE">9mobile</option>
                </select>

                <button
                  onClick={loadInitialData}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                    <th className="px-4 py-3">Reference / Time</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Network &amp; Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Method</th>
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
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                          {order.phoneNumber}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900">{order.networkName}</span>
                          <span className="text-slate-500 ml-1.5">{order.planName}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {formatCurrency(order.amountPaid || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {order.paymentMethod || 'DIRECT_TRANSFER'}
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
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition-colors"
                              title="Mark as Delivered"
                            >
                              Approve
                            </button>
                          )}
                          {order.status !== 'FAILED' && (
                            <button
                              onClick={() => handleUpdateStatus(order.reference, 'FAILED')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-colors"
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
                        {isLoadingOrders ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#1E40AF]" />
                            <span>Loading orders from Firestore...</span>
                          </div>
                        ) : (
                          'No orders found matching the filter criteria.'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SMEPLUG API & WEBHOOK */}
        {activeTab === 'smeplug' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                SMEPlug API Integration
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure your SMEPlug Secret Key and Webhook URL for automated 5-second VTU data vending.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  SMEPlug API Secret Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminSettings.smeplugApiKey}
                    onChange={(e) =>
                      setAdminSettings({ ...adminSettings, smeplugApiKey: e.target.value })
                    }
                    placeholder="sme_sk_live_..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono text-slate-900 bg-slate-50"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>Retrieve or generate your key at</span>
                  <a
                    href="https://smeplug.ng/dashboard/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1E40AF] font-semibold underline inline-flex items-center gap-0.5"
                  >
                    smeplug.ng/dashboard/settings/api
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {/* Webhook Configuration Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Live Webhook URL
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E40AF] text-white text-xs font-bold shrink-0 hover:bg-blue-800 transition-colors"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Paste this URL into the <strong>Webhook URL</strong> field in your SMEPlug Dashboard to receive instant delivery confirmations.
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-md shadow-blue-900/20 text-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save SMEPlug Credentials</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MOMO & SMARTCASH PSB */}
        {activeTab === 'psb' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                MoMo PSB (671) &amp; Smartcash Virtual Funding
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your payment service bank accounts for direct zero-fee wallet top-ups.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              {/* MoMo PSB Section */}
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    MTN MoMo PSB Configuration
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                    Bank Code: 671
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      MoMo Dedicated Account / Phone
                    </label>
                    <input
                      type="text"
                      value={adminSettings.momoAccountNumber}
                      onChange={(e) =>
                        setAdminSettings({ ...adminSettings, momoAccountNumber: e.target.value })
                      }
                      placeholder="08154276838"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-900 outline-none focus:border-[#1E40AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      value={adminSettings.momoAccountName}
                      onChange={(e) =>
                        setAdminSettings({ ...adminSettings, momoAccountName: e.target.value })
                      }
                      placeholder="DataAbeg MoMo PSB"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              </div>

              {/* Smartcash Section */}
              <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Airtel Smartcash PSB Configuration
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/60 text-rose-900">
                    Airtel Digital Bank
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Smartcash Account / Phone
                    </label>
                    <input
                      type="text"
                      value={adminSettings.smartcashAccountNumber}
                      onChange={(e) =>
                        setAdminSettings({ ...adminSettings, smartcashAccountNumber: e.target.value })
                      }
                      placeholder="08154276838"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-900 outline-none focus:border-[#1E40AF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      value={adminSettings.smartcashAccountName}
                      onChange={(e) =>
                        setAdminSettings({ ...adminSettings, smartcashAccountName: e.target.value })
                      }
                      placeholder="DataAbeg Smartcash"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              </div>

              {/* Support Hotline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer WhatsApp Support Phone
                </label>
                <input
                  type="text"
                  value={adminSettings.supportPhone}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, supportPhone: e.target.value })
                  }
                  className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900 outline-none focus:border-[#1E40AF]"
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-md shadow-blue-900/20 text-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save PSB Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PRICING & BUNDLES */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  Active Data Bundles &amp; Wholesale Rates
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Selling prices and margins configured across MTN, Airtel, Glo &amp; 9mobile.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200">
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
                    <th className="px-4 py-3">Wholesale Selling Price</th>
                    <th className="px-4 py-3">Commercial Bank Rate</th>
                    <th className="px-4 py-3 text-right">Customer Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CURATED_DATA_PLANS.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {plan.networkName}
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
                      <td className="px-4 py-3 font-bold text-[#1E40AF]">
                        ₦{plan.sellingPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400 line-through">
                        ₦{plan.retailPrice ? plan.retailPrice.toLocaleString() : '---'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {plan.retailPrice
                          ? `Save ₦${(plan.retailPrice - plan.sellingPrice).toLocaleString()} (${plan.savingsPercentage || Math.round(
                              ((plan.retailPrice - plan.sellingPrice) / plan.retailPrice) * 100
                            )}%)`
                          : 'Special Rate'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
