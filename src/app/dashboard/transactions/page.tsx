'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchOrdersByUser } from '@/lib/firebaseDb';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Frown,
  Receipt,
  Smartphone,
  PhoneCall,
  Zap,
  Tv,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userOrders = await fetchOrdersByUser(user.uid, user.email || undefined);
      setOrders(userOrders);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = (ref: string, id: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getServiceIcon = (serviceType?: string, network?: string) => {
    const net = (network || '').toUpperCase();
    if (serviceType === 'airtime') return <PhoneCall className="w-4 h-4 text-emerald-600" />;
    if (serviceType === 'electricity') return <Zap className="w-4 h-4 text-amber-600" />;
    if (serviceType === 'cable') return <Tv className="w-4 h-4 text-purple-600" />;
    return <Smartphone className="w-4 h-4 text-[#4f46e5]" />;
  };

  const filteredOrders = orders.filter((tx) => {
    const matchesSearch =
      !search ||
      (tx.phone && tx.phone.includes(search)) ||
      (tx.reference && tx.reference.toLowerCase().includes(search.toLowerCase())) ||
      (tx.network && tx.network.toLowerCase().includes(search.toLowerCase()));

    const txStatus = (tx.status || 'SUCCESS').toUpperCase();
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && (txStatus === 'SUCCESS' || txStatus === 'SUCCESSFUL')) ||
      (statusFilter === 'PENDING' && txStatus === 'PENDING') ||
      (statusFilter === 'FAILED' && (txStatus === 'FAILED' || txStatus === 'ERROR'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1300px] mx-auto">
      {/* Header matching Raenest */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time delivery status, order receipts, and payment records.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#4f46e5]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone, reference, network..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin text-[#4f46e5] mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading transactions...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 px-4">
            <div className="w-12 h-12 rounded-full border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No transactions yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Your mobile data, airtime, and utility purchases will show here with instant delivery updates.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE NATIVE CARD LIST (SCREENSHOT 2 & 3 STYLE) */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {filteredOrders.map((tx) => {
                const isSuccess = tx.status === 'SUCCESS' || tx.status === 'successful';
                const isPending = tx.status === 'PENDING' || tx.status === 'pending';

                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-3 active:bg-slate-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                        {getServiceIcon(tx.serviceType, tx.network)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {tx.network || tx.networkName} {tx.planName || tx.planSize || 'VTU Order'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          {tx.phone || tx.phoneNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recent'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-slate-900">
                        -{formatCurrency(tx.amountPaid || tx.amount || 0)}
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700'
                            : isPending
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tx.status || 'SUCCESS'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP RAENEST-STYLE TABLE */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-400 border-b border-slate-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Recipient & Ref</th>
                    <th className="py-3.5 px-6 text-right">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredOrders.map((tx) => {
                    const isSuccess = tx.status === 'SUCCESS' || tx.status === 'successful';
                    const isPending = tx.status === 'PENDING' || tx.status === 'pending';
                    const dateFormatted = tx.timestamp
                      ? new Date(tx.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
                      : 'Recent';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Date */}
                        <td className="py-4 px-6 text-slate-400 font-medium whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* Description with provider avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                              {getServiceIcon(tx.serviceType, tx.network)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {tx.network || tx.networkName} {tx.planName || tx.planSize || 'Service'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {tx.statusMessage || 'Instant delivery confirmation'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Amount & Status badge */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              -{formatCurrency(tx.amountPaid || tx.amount || 0)}
                            </span>
                            {!isSuccess && (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isPending
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-orange-50 text-orange-700'
                                }`}
                              >
                                {isPending ? 'Pending' : 'Declined'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Recipient & Reference */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-700 font-semibold">{tx.phone || tx.phoneNumber}</span>
                            <button
                              onClick={() => handleCopyRef(tx.reference, tx.id)}
                              className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Copy reference"
                            >
                              {copiedId === tx.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {tx.reference.slice(0, 16)}...
                          </div>
                        </td>

                        {/* Channel (Card, Add Money, Data) */}
                        <td className="py-4 px-6 text-right whitespace-nowrap font-medium text-slate-500">
                          {tx.serviceType === 'airtime' ? 'Airtime' : tx.paymentMethod === 'WALLET' ? 'Wallet' : 'Data'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
