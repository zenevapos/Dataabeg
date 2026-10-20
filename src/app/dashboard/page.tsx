'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL } from '@/lib/firebase';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { CURATED_DATA_PLANS } from '@/lib/constants';
import { fetchOrdersByUser, saveOrderToFirestore } from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import { DataPurchaseWidget } from '@/components/DataPurchaseWidget';
import { PurchaseModal } from '@/components/PurchaseModal';
import {
  Zap,
  Wallet,
  Building2,
  Smartphone,
  ShieldCheck,
  LogOut,
  Copy,
  Check,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  HelpCircle,
  MessageCircle,
  User as UserIcon
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const { user, profile, isAdmin, logout, refreshProfile, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [copiedMomo, setCopiedMomo] = useState(false);
  const [copiedSmartcash, setCopiedSmartcash] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<DataPlan | null>(null);
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutNetwork, setCheckoutNetwork] = useState<NetworkInfo | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load user's transactions from Firestore
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
      console.warn('Could not load user orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSelectPlanForCheckout = (plan: DataPlan, phone: string, network: NetworkInfo) => {
    setCheckoutPlan(plan);
    setCheckoutPhone(phone);
    setCheckoutNetwork(network);
    setIsPurchaseModalOpen(true);
  };

  const handleOrderCompleted = (newTx: Transaction) => {
    const taggedTx: Transaction = {
      ...newTx,
      // Tag user information
      phone: newTx.phone,
      phoneNumber: newTx.phoneNumber || newTx.phone
    };

    setOrders((prev) => [taggedTx, ...prev]);
    refreshProfile();
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

  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '08154276838';
  const whatsappUrl = `https://wa.me/234${supportPhone.replace(/^0/, '')}?text=Hello%20DataAbeg%20Support,%20I%20need%20assistance%20with%20my%20dashboard.`;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1E40AF]" />
          <span>Loading your DataAbeg dashboard...</span>
        </div>
      </div>
    );
  }

  const momoAcc = profile?.momoVirtualAccount || '671' + user.uid.slice(0, 7);
  const smartcashAcc = profile?.smartcashVirtualAccount || '90' + user.uid.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-black shadow-xs">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 font-heading">
                Data<span className="text-[#1E40AF]">Abeg</span>
              </span>
            </Link>

            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* If logged-in user is Kokoroowoabdulsalam@gmail.com, show Admin Console button */}
            {isAdmin && (
              <Link
                href="/admin-salam"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-xs transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Salam</span>
              </Link>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E40AF] font-bold text-xs flex items-center justify-center border border-blue-200">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-500 font-mono leading-tight">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Notification Banner if Admin */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#1E40AF] shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Master Administrator Session Active ({ADMIN_EMAIL})
                </p>
                <p className="text-[11px] text-slate-600">
                  You have full privileges to manage SMEPlug API credentials, view all transactions, and adjust bundle rates.
                </p>
              </div>
            </div>
            <Link
              href="/admin-salam"
              className="px-4 py-2 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Open Admin Console &rarr;
            </Link>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Wallet Balance */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#1E40AF]" />
                  <span>Wallet Balance</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  0% Transfer Fee
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {formatCurrency(profile?.walletBalance || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Available for automated 1-click purchases</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFundModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
              >
                + Fund Wallet
              </button>
            </div>
          </div>

          {/* Card 2: MoMo PSB (671) Virtual Account */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>MoMo PSB Virtual Account</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Bank Code: 671
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Account Number</p>
                  <p className="text-lg font-mono font-black text-slate-900">{momoAcc}</p>
                </div>
                <button
                  onClick={() => copyText(momoAcc, 'momo')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#1E40AF] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  {copiedMomo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMomo ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Transfer from any Nigerian banking app (OPay, Kuda, GTB, Zenith). Auto-credited in 5s.
              </p>
            </div>
          </div>

          {/* Card 3: Smartcash PSB Virtual Account */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  <span>Smartcash PSB Account</span>
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Airtel Auto Bank
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Account Number</p>
                  <p className="text-lg font-mono font-black text-slate-900">{smartcashAcc}</p>
                </div>
                <button
                  onClick={() => copyText(smartcashAcc, 'smartcash')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#1E40AF] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                >
                  {copiedSmartcash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSmartcash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Direct virtual deposit via Airtel Smartcash infrastructure with 0% processing fee.
              </p>
            </div>
          </div>
        </div>

        {/* Live Data Purchasing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                ⚡ Instant Data Purchase
              </h2>
              <p className="text-xs text-slate-500">
                Select your network and recipient phone number for automated 5-second SIM crediting.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>24/7 Support</span>
            </a>
          </div>

          <DataPurchaseWidget
            onSelectPlanForCheckout={handleSelectPlanForCheckout}
            plans={CURATED_DATA_PLANS}
          />
        </div>

        {/* Orders & History Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Your Orders &amp; Transaction History
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail of your recent mobile data purchases and top-ups.
              </p>
            </div>

            <button
              onClick={loadUserOrders}
              disabled={isLoadingOrders}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh Transactions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reference / Date</th>
                  <th className="px-4 py-3">Recipient Phone</th>
                  <th className="px-4 py-3">Network &amp; Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const isSuccess = order.status === 'successful' || order.status === 'SUCCESS';
                    const isFailed = order.status === 'failed' || order.status === 'FAILED';

                    return (
                      <tr key={order.reference} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono font-bold text-slate-900">{order.reference}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(order.timestamp || order.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                          {order.phoneNumber || order.phone}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900">{order.networkName || order.network}</span>
                          <span className="text-slate-500 ml-1.5">{order.planSize || order.planName}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#1E40AF]">
                          {formatCurrency(order.amountPaid || order.amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isFailed
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                            {isFailed && <XCircle className="w-3 h-3" />}
                            {!isSuccess && !isFailed && <Clock className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No purchases recorded yet. Pick a bundle above to dispense your first data bundle!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1E40AF]" />
                <h3 className="font-bold text-slate-900 font-heading">Fund Your Wallet (0% Fee)</h3>
              </div>
              <button
                onClick={() => setShowFundModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Transfer funds from any Nigerian bank (OPay, Kuda, GTB, Zenith, Palmpay) to your dedicated virtual account below:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-amber-800 uppercase">Option 1: MoMo PSB (671)</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-bold text-base text-slate-900">{momoAcc}</span>
                  <button
                    onClick={() => copyText(momoAcc, 'momo')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#1E40AF]"
                  >
                    {copiedMomo ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Bank Name: MoMo Payment Service Bank (671)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-rose-800 uppercase">Option 2: Smartcash PSB</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-bold text-base text-slate-900">{smartcashAcc}</span>
                  <button
                    onClick={() => copyText(smartcashAcc, 'smartcash')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#1E40AF]"
                  >
                    {copiedSmartcash ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Bank Name: Smartcash Payment Service Bank</p>
              </div>
            </div>

            <button
              onClick={() => setShowFundModal(false)}
              className="mt-6 w-full py-3 bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        plan={checkoutPlan}
        phoneNumber={checkoutPhone}
        network={checkoutNetwork}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}
