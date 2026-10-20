'use client';

import React from 'react';
import { Zap, Clock, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 text-center">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Value pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Save up to 71% compared to Banking Apps & PalmPay</span>
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Main headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
          Stop Overpaying For Mobile Data.{' '}
          <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Buy Cheap SME & CG Data Instantly.
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Get <span className="text-amber-300 font-bold">MTN 1GB from ₦290</span>, plus cheapest rates on Airtel, Glo & 9mobile with <span className="text-emerald-400 font-semibold">full 30-day validity</span> delivered straight to your phone in under 5 seconds.
        </p>

        {/* Trust Badges Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">5-Second Delivery</p>
              <p className="text-[10px] text-slate-400">100% Automated</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">30 Days Validity</p>
              <p className="text-[10px] text-slate-400">No 1-day expiry traps</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Direct Telco Pool</p>
              <p className="text-[10px] text-slate-400">SME & CG Bundles</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Wholesale Rates</p>
              <p className="text-[10px] text-slate-400">Reseller Friendly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
