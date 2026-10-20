'use client';

import React from 'react';
import { ShieldCheck, Server, Headphones, Zap, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

export function EnterpriseSection() {
  return (
    <section className="w-full py-16 sm:py-24 bg-slate-900/30 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Enterprise &amp; Reseller ready from day one
          </h2>
        </div>

        {/* Top 3 Cards Grid (Clueso style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-800 rounded-t-2xl overflow-hidden bg-slate-950/70 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <article className="p-6 sm:p-8 flex flex-col gap-4 hover:bg-slate-900/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-sky-400 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Telecom Security &amp; Encryption</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                TLS 1.3 cryptographic security, zero stored debit card details, and licensed CBN Payment Service Bank settlement via MoMo PSB (671) &amp; Smartcash.
              </p>
            </div>
          </article>

          <article className="p-6 sm:p-8 flex flex-col gap-4 hover:bg-slate-900/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">99.98% Gateway Switch Uptime</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Dual-redundant telco gateway routing powered by SMEPlug ensures your SIM receives data bundles without delay, even during midnight traffic spikes.
              </p>
            </div>
          </article>

          <article className="p-6 sm:p-8 flex flex-col gap-4 hover:bg-slate-900/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 Priority Human Support</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Direct WhatsApp and phone assistance (08154276838) with real human operators ready to resolve wrong-number top-ups and network issues in minutes.
              </p>
            </div>
          </article>
        </div>

        {/* Bottom 4 Key Stats (Clueso style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-x border-b border-slate-800 rounded-b-2xl overflow-hidden bg-slate-900/40 divide-y sm:divide-y-0 divide-x divide-slate-800 text-left">
          <div className="p-6 sm:p-8 flex flex-col">
            <span className="text-3xl sm:text-5xl font-black text-sky-400 font-mono tracking-tight">4.8s</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-2">Delivery Speed</span>
            <span className="text-xs text-slate-400 mt-1">Average time from payment confirmation to SIM crediting.</span>
          </div>

          <div className="p-6 sm:p-8 flex flex-col">
            <span className="text-3xl sm:text-5xl font-black text-sky-400 font-mono tracking-tight">71%</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-2">Cost Savings</span>
            <span className="text-xs text-slate-400 mt-1">Compared to commercial bank apps (₦290 vs ₦1,000/GB).</span>
          </div>

          <div className="p-6 sm:p-8 flex flex-col">
            <span className="text-3xl sm:text-5xl font-black text-sky-400 font-mono tracking-tight">30 Days</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-2">Standard Validity</span>
            <span className="text-xs text-slate-400 mt-1">No 24-hour midnight expiry traps on any standard bundle.</span>
          </div>

          <div className="p-6 sm:p-8 flex flex-col">
            <span className="text-3xl sm:text-5xl font-black text-sky-400 font-mono tracking-tight">₦0 Fee</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-2">MoMo &amp; Smartcash</span>
            <span className="text-xs text-slate-400 mt-1">Zero bank transfer charges on virtual account deposits.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
