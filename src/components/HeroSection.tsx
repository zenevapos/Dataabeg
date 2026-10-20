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
    <section className="relative overflow-hidden pt-10 pb-8 sm:pt-16 sm:pb-12 text-center isolate">
      {/* Clueso Hero Ambient Aura Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-[#1E40AF]/30 via-sky-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Clueso-style Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Save up to 71% • Direct MoMo PSB (671) &amp; Smartcash Virtual Funding</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Clueso Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          <span>Agentic VTU data platform </span>
          <span className="text-slate-400 font-normal">for every Nigerian.</span>
        </h1>

        {/* Clueso Subtitle */}
        <p className="mt-5 sm:mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From marketing teams, students, and remote workers to SME data gifting and automated reselling. DataAbeg delivers cheap mobile data in <span className="text-white font-semibold underline decoration-sky-500 decoration-2 underline-offset-4">5 seconds flat</span>.
        </p>

        {/* Clueso Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={scrollToWidget}
            className="inline-flex items-center justify-center gap-2 font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#1E40AF] via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.35),0_6px_20px_rgba(30,64,175,0.45)] px-6 sm:px-7 py-3 rounded-lg transition-all duration-150 transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Buy Data from ₦290</span>
          </button>

          <button
            onClick={scrollToMoMo}
            className="inline-flex items-center justify-center gap-2 font-medium text-sm sm:text-base text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-5 sm:px-6 py-3 rounded-lg transition-all shadow-sm"
          >
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>MoMo PSB &amp; Smartcash Guide</span>
          </button>
        </div>

        {/* Clueso Trust Bar with Rating & Network Logos Grid */}
        <div className="mt-14 pt-8 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-left">
            <p className="text-sm sm:text-base text-slate-300">
              Trusted by thousands of <span className="text-white font-semibold">fast-growing startups, students</span> and <span className="text-white font-semibold">data resellers</span>
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <span>Rated 4.9</span>
              <div className="flex text-amber-400">
                {'★'.repeat(5)}
              </div>
              <span>on Google &amp; Trustpilot</span>
            </div>
          </div>

          {/* 4 Partner / Telecom Grid Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center p-4 border-r border-b sm:border-b-0 border-slate-800/80 hover:bg-slate-900/40 transition-colors">
              <span className="text-xs font-black text-amber-400 tracking-wider">MTN NIGERIA</span>
              <span className="text-[11px] text-slate-400 mt-1">SME &amp; Corporate Gifting</span>
              <span className="text-[10px] text-sky-400 font-semibold mt-0.5">From ₦290/GB</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border-r border-b sm:border-b-0 border-slate-800/80 hover:bg-slate-900/40 transition-colors">
              <span className="text-xs font-black text-rose-400 tracking-wider">AIRTEL NIGERIA</span>
              <span className="text-[11px] text-slate-400 mt-1">Smartcash PSB (0% Fee)</span>
              <span className="text-[10px] text-sky-400 font-semibold mt-0.5">From ₦295/GB</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border-r border-slate-800/80 hover:bg-slate-900/40 transition-colors">
              <span className="text-xs font-black text-emerald-400 tracking-wider">GLO NIGERIA</span>
              <span className="text-[11px] text-slate-400 mt-1">Direct &amp; CG Gifting</span>
              <span className="text-[10px] text-sky-400 font-semibold mt-0.5">From ₦300/GB</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 hover:bg-slate-900/40 transition-colors">
              <span className="text-xs font-black text-lime-400 tracking-wider">9MOBILE NIGERIA</span>
              <span className="text-[11px] text-slate-400 mt-1">Superfast 4G / 5G VTU</span>
              <span className="text-[10px] text-sky-400 font-semibold mt-0.5">From ₦285/GB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

