'use client';

import React from 'react';
import { Smartphone, Building2, CreditCard, Terminal, ArrowRight, CheckCircle2, Cpu, ExternalLink } from 'lucide-react';

interface WaysToStartSectionProps {
  onOpenSettings?: () => void;
}

export function WaysToStartSection({ onOpenSettings }: WaysToStartSectionProps) {
  const scrollToPurchase = () => {
    const el = document.getElementById('data-purchase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="ways-to-fund" className="w-full py-16 sm:py-24 bg-slate-900/40 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clueso-style Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              <span className="text-slate-400 font-normal">Fund however you like,</span>
              <br />
              get active data in seconds.
            </h2>
          </div>
          <div className="max-w-md text-slate-400 text-sm sm:text-base">
            <p>
              Whether you prefer direct 0-fee bank transfers to Payment Service Banks, debit cards, or automated API endpoints, DataAbeg processes and delivers your mobile data automatically.
            </p>
          </div>
        </div>

        {/* 2x2 Clueso Grid with Center Divider */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/70 backdrop-blur-xl">
          <div className="relative grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Card 1: MoMo PSB (671) */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 hover:bg-slate-900/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    Bank Code 671 • 0% Fee
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Direct MoMo PSB Virtual Account
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Transfer directly from Kuda, OPay, Palmpay, GTBank, or Zenith to your designated MoMo PSB account (Bank Code: 671). Instant credit without third-party card charges.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Supported Telecom</span>
                  <span className="text-white font-semibold">MTN, Airtel, Glo, 9mobile</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Transfer Fee</span>
                  <span className="text-emerald-400 font-semibold">₦0 (Free Deposit)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Smartcash PSB */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 hover:bg-slate-900/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                    Airtel Smartcash • Instant
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Smartcash PSB Auto-Funding
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Leverage Airtel Smartcash payment service bank infrastructure for sub-second wallet topups and automated SIM data dispatch.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Delivery Speed</span>
                  <span className="text-sky-400 font-semibold">Under 5 Seconds</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Availability</span>
                  <span className="text-emerald-400 font-semibold">24/7 Automated</span>
                </div>
              </div>
            </div>

            {/* Card 3: Card & Bank Checkout */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 border-t border-slate-800 hover:bg-slate-900/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-950 text-sky-300 border border-blue-800">
                    Paystack &amp; Monnify
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Debit Card &amp; Instant Bank Checkout
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Pay directly on checkout using your debit card (Mastercard, Visa, Verve) or dedicated dynamic bank transfer. Downloadable digital PDF/PNG receipt upon delivery.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> 256-Bit SSL
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Instant SMS Alerts
                </span>
              </div>
            </div>

            {/* Card 4: Developer VTU API */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 border-t border-slate-800 hover:bg-slate-900/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                    SMEPlug REST API
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Developer API &amp; Reseller Automation
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Connect your own mobile app, Telegram vending bot, WhatsApp reselling store, or e-commerce website directly to our SMEPlug gateway. Full webhooks supported.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-white transition-colors self-start"
              >
                <span>Configure API Key &amp; Webhook</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clueso-style MCP / Script Integration Callout */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-950 border border-blue-900/40 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E40AF]/30 border border-blue-700/50 flex items-center justify-center text-sky-400 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white">
                Run DataAbeg from your own scripts, AI tools, or bots
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Full REST API compatibility: query balance, purchase SME bundles, and receive instant delivery callbacks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenSettings}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg transition-colors"
            >
              <span>Explore Developer API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToPurchase}
              className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
            >
              Buy Data Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
