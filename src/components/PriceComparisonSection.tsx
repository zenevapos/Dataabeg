'use client';

import React from 'react';
import { COMPARISON_TABLE } from '@/lib/constants';
import { CheckCircle2, TrendingDown } from 'lucide-react';

export function PriceComparisonSection() {
  return (
    <section id="price-comparison" className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Subtle decorative corner accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1E40AF] text-xs font-semibold mb-3">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Smart Price Comparison</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Why Pay Full Price at the Bank?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Banks &amp; mainstream fintechs only sell official retail bundles that expire in 1 or 2 days. On DataAbeg, you get <strong className="text-[#1E40AF]">full 30-day validity</strong> for a fraction of the cost.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Data Plan Size</th>
                <th className="py-3 px-4">Standard Bank / Fintech</th>
                <th className="py-3 px-4 text-[#1E40AF]">DataAbeg Price</th>
                <th className="py-3 px-4 text-right">Your Net Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {COMPARISON_TABLE.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1E40AF] shrink-0" />
                    {row.plan}
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-mono">
                    <span className="line-through">{row.banksAndFintech}</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-black text-[#1E40AF] text-base">
                    {row.dataAbegPrice}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-800">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs inline-flex items-center gap-1 font-bold">
                      {row.savings}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature comparison pills */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Validity Period</p>
            <p className="text-sm font-bold text-[#1E40AF] mt-1 font-heading">Full 30 Days Standard</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Delivery Method</p>
            <p className="text-sm font-bold text-slate-900 mt-1 font-heading">Direct Telco Automated Push</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">PSB Auto-Wallet</p>
            <p className="text-sm font-bold text-amber-700 mt-1 font-heading">MoMo PSB (671) &amp; Smartcash</p>
          </div>
        </div>
      </div>
    </section>
  );
}
