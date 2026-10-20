'use client';

import React, { useState } from 'react';
import { X, Search, ShieldCheck, CheckCircle2, Clock, Phone, Hash } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export function TrackOrderModal({ isOpen, onClose, transactions }: TrackOrderModalProps) {
  const [query, setQuery] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);

  if (!isOpen) return null;

  const results = transactions.filter((tx) => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return (
      tx.reference.toLowerCase().includes(q) ||
      tx.phone.includes(q) ||
      (tx.smeplugReference && tx.smeplugReference.toLowerCase().includes(q))
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Track Your Order</h3>
            <p className="text-xs text-slate-400">Search by Transaction Reference or Phone Number</p>
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
              className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute inset-y-1 right-1 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Track
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
                No transaction found matching &quot;{query}&quot;. Please verify the reference or phone number.
              </div>
            ) : (
              results.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold">{tx.reference}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {tx.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-slate-800/80">
                    <p>Network: <strong className="text-white">{tx.network}</strong></p>
                    <p>Phone: <strong className="text-white font-mono">{tx.phone}</strong></p>
                    <p>Bundle: <strong className="text-white">{tx.planSize}</strong></p>
                    <p>Amount: <strong className="text-emerald-400">{formatCurrency(tx.amount)}</strong></p>
                  </div>

                  {tx.smeplugReference && (
                    <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      SMEPlug Gateway Ref: <span className="font-mono text-slate-400">{tx.smeplugReference}</span>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!searched && transactions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Orders on this Device ({transactions.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {transactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setQuery(tx.reference);
                    setSearched(true);
                  }}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/40 border border-slate-800 cursor-pointer text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-white">{tx.network} {tx.planSize} to {tx.phone}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">{tx.reference}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">Click to view</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
