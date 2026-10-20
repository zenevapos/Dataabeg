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
    <section id="ways-to-fund" className="w-full py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
              <span className="text-slate-500 font-normal">Fund however you like,</span>
              <br />
              get active data in seconds.
            </h2>
          </div>
          <div className="max-w-md text-slate-600 text-sm sm:text-base">
            <p>
              Whether you prefer direct 0-fee bank transfers to Payment Service Banks, debit cards, or automated API endpoints, DataAbeg processes and delivers your mobile data automatically.
            </p>
          </div>
        </div>

        {/* 2x2 Grid with Center Divider */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 shadow-xs">
          <div className="relative grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Card 1: MoMo PSB (671) */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 hover:bg-white transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Bank Code 671 • 0% Fee
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-heading">
                  Direct MoMo PSB Virtual Account
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transfer directly from Kuda, OPay, Palmpay, GTBank, or Zenith to your designated MoMo PSB account (Bank Code: 671). Instant credit without third-party card charges.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Supported Telecom</span>
                  <span className="text-slate-900 font-semibold">MTN, Airtel, Glo, 9mobile</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Transfer Fee</span>
                  <span className="text-emerald-700 font-bold">₦0 (Free Deposit)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Smartcash PSB */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 hover:bg-white transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                    Airtel Smartcash • Instant
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-heading">
                  Smartcash PSB Auto-Funding
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Leverage Airtel Smartcash payment service bank infrastructure for sub-second wallet topups and automated SIM data dispatch.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex flex-col gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Delivery Speed</span>
                  <span className="text-[#1E40AF] font-bold">Under 5 Seconds</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Availability</span>
                  <span className="text-emerald-700 font-bold">24/7 Automated</span>
                </div>
              </div>
            </div>

            {/* Card 3: Card & Bank Checkout */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 border-t border-slate-200 hover:bg-white transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E40AF] flex items-center justify-center border border-blue-200">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                    Paystack &amp; Monnify
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-heading">
                  Debit Card &amp; Instant Bank Checkout
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pay directly on checkout using your debit card (Mastercard, Visa, Verve) or dedicated dynamic bank transfer. Downloadable digital PDF/PNG receipt upon delivery.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 text-slate-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF]" /> 256-Bit SSL
                </span>
                <span className="flex items-center gap-1 text-slate-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E40AF]" /> Instant SMS Alerts
                </span>
              </div>
            </div>

            {/* Card 4: Developer VTU API */}
            <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 border-t border-slate-200 hover:bg-white transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                    SMEPlug REST API
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-heading">
                  Developer API &amp; Reseller Automation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Connect your own mobile app, Telegram vending bot, WhatsApp reselling store, or e-commerce website directly to our SMEPlug gateway. Full webhooks supported.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] hover:text-blue-800 transition-colors self-start cursor-pointer"
              >
                <span>Configure API Key &amp; Webhook</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Integration Callout */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/70 border border-blue-200 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#1E40AF] shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Run DataAbeg from your own scripts, AI tools, or bots
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Full REST API compatibility: query balance, purchase SME bundles, and receive instant delivery callbacks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenSettings}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#1E40AF] hover:bg-blue-800 px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Explore Developer API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToPurchase}
              className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Buy Data Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
