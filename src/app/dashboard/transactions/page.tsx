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
  Receipt
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time delivery status, order references, and payment receipts.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone, reference, network..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin text-[#1e3a8a] mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading transactions...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
              <Frown className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No transactions found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              New data, airtime, and bill vending orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Service / Bundle</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((tx) => {
                  const isSuccess = tx.status === 'SUCCESS' || tx.status === 'successful';
                  const isPending = tx.status === 'PENDING' || tx.status === 'pending';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status || 'SUCCESS'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {tx.networkName || tx.network}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {tx.planName || tx.planSize}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-800 font-medium">
                        {tx.phone || tx.phoneNumber}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <span>{tx.reference.slice(0, 14)}...</span>
                          <button
                            onClick={() => handleCopyRef(tx.reference, tx.id)}
                            className="p-1 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Copy reference"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 font-extrabold text-slate-900">
                        {formatCurrency(tx.amountPaid || tx.amount || 0)}
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
