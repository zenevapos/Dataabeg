'use client';

import React from 'react';
import { Zap, Clock, ShieldCheck, Sparkles, TrendingDown, ArrowRight, Star, Building2, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onLearnMoMo?: () => void;
}

export function HeroSection({ onLearnMoMo }: HeroSectionProps) {
  const scrollToWidget = () => {
    const el = document.getElementById('data-purchase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMoMo = () => {
    if (onLearnMoMo) {
      onLearnMoMo();
      return;
    }
    const el = document.getElementById('ways-to-fund');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20 sm:pb-16 text-center isolate">
      {/* Light Theme Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-blue-100/70 via-sky-50/50 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium mb-6 shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-[#1E40AF] animate-pulse" />
          <span>Save up to 71% • Instant Automated Delivery on All Nigerian Networks</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto font-heading">
          <span>Cheap mobile data </span>
          <span className="text-slate-500 font-normal">for every Nigerian.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From students and remote workers to business owners and data resellers. DataAbeg delivers cheap SME &amp; gifting data in <span className="text-[#1E40AF] font-bold underline decoration-[#1E40AF]/40 decoration-2 underline-offset-4">5 seconds flat</span>.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={scrollToWidget}
            className="inline-flex items-center justify-center gap-2 font-bold text-sm sm:text-base text-white bg-[#1E40AF] hover:bg-blue-800 shadow-lg shadow-blue-900/20 px-6 sm:px-7 py-3.5 rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Buy Data from ₦290</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('price-comparison');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center gap-2 font-semibold text-sm sm:text-base text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-5 sm:px-6 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <TrendingDown className="w-4 h-4 text-[#1E40AF]" />
            <span>View Price Comparison</span>
          </button>
        </div>

        {/* Trust Bar with Rating & Network Logos Grid */}
        <div className="mt-14 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-left">
            <p className="text-sm sm:text-base text-slate-600">
              Trusted by thousands of <span className="text-slate-900 font-semibold">fast-growing startups, students</span> and <span className="text-slate-900 font-semibold">data resellers</span>
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <span className="font-bold text-slate-800">Rated 4.9</span>
              <div className="flex text-amber-500">
                {'★'.repeat(5)}
              </div>
              <span>on Google &amp; Trustpilot</span>
            </div>
          </div>

          {/* 4 Partner / Telecom Grid Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="flex flex-col items-center justify-center p-4 border-r border-b sm:border-b-0 border-slate-200 hover:bg-slate-50/80 transition-colors">
              <span className="text-xs font-black text-amber-600 tracking-wider">MTN NIGERIA</span>
              <span className="text-[11px] text-slate-500 mt-1">SME &amp; Corporate Gifting</span>
              <span className="text-[10px] text-[#1E40AF] font-bold mt-0.5">From ₦290/GB</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border-r border-b sm:border-b-0 border-slate-200 hover:bg-slate-50/80 transition-colors">
              <span className="text-xs font-black text-rose-600 tracking-wider">AIRTEL NIGERIA</span>
              <span className="text-[11px] text-slate-500 mt-1">Smartcash PSB (0% Fee)</span>
              <span className="text-[10px] text-[#1E40AF] font-bold mt-0.5">From ₦295/GB</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border-r border-slate-200 hover:bg-slate-50/80 transition-colors">
              <span className="text-xs font-black text-emerald-600 tracking-wider">GLO NIGERIA</span>
              <span className="text-[11px] text-slate-500 mt-1">Direct &amp; CG Gifting</span>
              <span className="text-[10px] text-[#1E40AF] font-bold mt-0.5">From ₦300/GB</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 hover:bg-slate-50/80 transition-colors">
              <span className="text-xs font-black text-emerald-800 tracking-wider">9MOBILE NIGERIA</span>
              <span className="text-[11px] text-slate-500 mt-1">Superfast 4G / 5G VTU</span>
              <span className="text-[10px] text-[#1E40AF] font-bold mt-0.5">From ₦285/GB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
