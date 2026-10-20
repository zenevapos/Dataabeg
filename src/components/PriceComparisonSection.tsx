'use client';

import React from 'react';
import { COMPARISON_TABLE } from '@/lib/constants';
import { CheckCircle2, XCircle, ArrowUpRight, TrendingDown } from 'lucide-react';

export function PriceComparisonSection() {
  return (
    <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Smart Price Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Why Pay Full Price at the Bank?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Banks & mainstream fintechs only sell official retail bundles that expire in 1 or 2 days. On DataAbeg, you get <strong className="text-emerald-400">full 30-day validity</strong> for a fraction of the cost.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Data Plan Size</th>
                <th className="py-3 px-4">Standard Bank / Fintech</th>
                <th className="py-3 px-4 text-emerald-400">DataAbeg Price</th>
                <th className="py-3 px-4 text-right">Your Net Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {COMPARISON_TABLE.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {row.plan}
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-mono">
                    <span className="line-through">{row.banksAndFintech}</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-black text-emerald-400 text-base">
                    {row.dataAbegPrice}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-amber-300">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs inline-flex items-center gap-1">
                      {row.savings}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature comparison pills */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <p className="text-xs text-slate-400">Validity Period</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">Full 30 Days Standard</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <p className="text-xs text-slate-400">Delivery Method</p>
            <p className="text-sm font-bold text-white mt-1">Direct Telco Automated Push</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <p className="text-xs text-slate-400">Reseller Support</p>
            <p className="text-sm font-bold text-amber-400 mt-1">100% Whitelist Reseller Ready</p>
          </div>
        </div>
      </div>
    </section>
  );
}
