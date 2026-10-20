'use client';

import React, { useState } from 'react';
import { X, Search, ShieldCheck, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { fetchOrdersByPhone } from '@/lib/firebaseDb';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export function TrackOrderModal({ isOpen, onClose, transactions }: TrackOrderModalProps) {
  const [query, setQuery] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);
  const [firestoreResults, setFirestoreResults] = useState<Transaction[]>([]);
  const [isSearchingFirestore, setIsSearchingFirestore] = useState<boolean>(false);

  if (!isOpen) return null;

  const localResults = transactions.filter((tx) => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return (
      tx.reference.toLowerCase().includes(q) ||
      (tx.phone && tx.phone.includes(q)) ||
      (tx.phoneNumber && tx.phoneNumber.includes(q)) ||
      (tx.smeplugReference && tx.smeplugReference.toLowerCase().includes(q))
    );
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setSearched(true);
    setIsSearchingFirestore(true);

    try {
      // If query looks like phone number, query Firestore
      if (/^\d{10,14}$/.test(cleanQuery.replace(/\D/g, ''))) {
        const phone = cleanQuery.replace(/\D/g, '');
        const fsOrders = await fetchOrdersByPhone(phone);
        setFirestoreResults(fsOrders);
      } else {
        setFirestoreResults([]);
      }
    } catch {
      setFirestoreResults([]);
    } finally {
      setIsSearchingFirestore(false);
    }
  };

  // Combine and deduplicate
  const allResultsMap = new Map<string, Transaction>();
  localResults.forEach((tx) => allResultsMap.set(tx.reference, tx));
  firestoreResults.forEach((tx) => allResultsMap.set(tx.reference, tx));
  const results = Array.from(allResultsMap.values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1E40AF] border border-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Track Your Order</h3>
            <p className="text-xs text-slate-500">Search by Transaction Reference or Phone Number</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="e.g. DABG-M1X2-AB3C or 08031234567"
              className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isSearchingFirestore}
              className="absolute inset-y-1.5 right-1.5 px-4 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSearchingFirestore ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Track</span>
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {results.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                No transaction found matching &quot;{query}&quot;. Please verify the reference or phone number.
              </div>
            ) : (
              results.map((tx) => {
                const isSuccess = tx.status === 'successful' || tx.status === 'SUCCESS';
                const isFailed = tx.status === 'failed' || tx.status === 'FAILED';

                return (
                  <div
                    key={tx.reference}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#1E40AF] font-bold">{tx.reference}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] flex items-center gap-1 border ${
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
                        {tx.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200">
                      <p>Network: <strong className="text-slate-900">{tx.networkName || tx.network}</strong></p>
                      <p>Phone: <strong className="text-slate-900 font-mono">{tx.phoneNumber || tx.phone}</strong></p>
                      <p>Bundle: <strong className="text-slate-900">{tx.planSize || tx.planName}</strong></p>
                      <p>Amount: <strong className="text-[#1E40AF]">{formatCurrency(tx.amount || tx.amountPaid || 0)}</strong></p>
                    </div>

                    {tx.statusMessage && (
                      <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
                        Note: {tx.statusMessage}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
