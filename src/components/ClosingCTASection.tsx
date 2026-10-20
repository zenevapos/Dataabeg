'use client';

import React, { useState } from 'react';
import { Zap, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { isValidNigerianPhone, normalizePhone } from '@/lib/utils';

interface ClosingCTASectionProps {
  onQuickPhoneSubmit?: (phone: string) => void;
}

export function ClosingCTASection({ onQuickPhoneSubmit }: ClosingCTASectionProps) {
  const [quickPhone, setQuickPhone] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizePhone(quickPhone);
    if (!isValidNigerianPhone(clean)) {
      alert('Please enter a valid 11-digit phone number (e.g. 08031234567)');
      return;
    }

    if (onQuickPhoneSubmit) {
      onQuickPhoneSubmit(clean);
    } else {
      const el = document.getElementById('data-purchase-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16 sm:py-24 border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Closing Banner Box */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E40AF] via-blue-800 to-slate-900 border border-blue-700 p-8 sm:p-16 text-center shadow-xl text-white isolate">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-400/20 to-sky-300/15 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center gap-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-blue-950/70 text-sky-200 border border-blue-400/40">
              ⚡ Instant 5-Second Automated Dispensing
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-heading">
              Get cheap mobile data at the speed your phone moves
            </h2>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-xl">
              Stop paying ₦1,000 for 1GB to commercial banks. Enter your 11-digit Nigerian phone number and enjoy MTN, Airtel, Glo &amp; 9mobile data from ₦290 with full 30 days validity.
            </p>

            {/* Quick Phone Input Form */}
            <form onSubmit={handleQuickSubmit} className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 mt-2">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  placeholder="0803 123 4567"
                  maxLength={14}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-white text-sm placeholder-blue-200 border border-white/20 focus:bg-white/20 focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-extrabold text-[#1E40AF] bg-white hover:bg-blue-50 px-6 py-3 rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <span>⚡ Buy Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-blue-200 mt-2">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" /> MTN, Airtel, Glo, 9mobile
              </span>
              <span className="flex items-center gap-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" /> MoMo PSB (671) &amp; Smartcash
              </span>
              <span className="flex items-center gap-1.5 text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" /> 30-Day Expiry Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
