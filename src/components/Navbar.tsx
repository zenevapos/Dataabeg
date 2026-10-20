'use client';

import React, { useState } from 'react';
import { Zap, Wifi, ShieldCheck, Settings, HelpCircle, ArrowRight, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenTracker: () => void;
  onOpenUSSD: () => void;
  isSMEPlugConnected: boolean;
}

export function Navbar({ onOpenSettings, onOpenTracker, onOpenUSSD, isSMEPlugConnected }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Clueso-style Top Announcement Bar */}
      <aside aria-label="Announcement" className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800/70 text-slate-300">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex min-h-10 items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600/30 text-blue-400">
              <Sparkles className="w-3 h-3 text-sky-400" />
            </span>
            <span className="font-medium text-slate-300">
              Direct <span className="text-white font-semibold">MoMo PSB (671)</span> &amp; <span className="text-white font-semibold">Smartcash</span> virtual funding live! Save up to{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">71% off</span> on MTN, Airtel, Glo &amp; 9mobile this week.
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
              24/7 VTU Switch 100% Operational
            </span>
            <button
              onClick={() => scrollToSection('ways-to-fund')}
              className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Learn about MoMo
            </button>
          </div>
        </div>
      </aside>

      {/* Main Sticky Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-[#080d1a]/90 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo with #1E40AF Brand Color */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E40AF] via-blue-600 to-sky-400 text-white font-black shadow-lg shadow-blue-900/40 transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 fill-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Data<span className="text-sky-400">Abeg</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-blue-800">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">Automated Mobile Data Platform</p>
            </div>
          </a>

          {/* Clueso-style Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Buy Data
            </button>
            <button
              onClick={() => scrollToSection('ways-to-fund')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              MoMo &amp; Smartcash
            </button>
            <button
              onClick={() => scrollToSection('price-comparison')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Rates &amp; Savings
            </button>
            <button
              onClick={() => scrollToSection('feature-tour')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('customer-stories')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenTracker}
              id="nav-track-order-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Track Order
            </button>

            <button
              onClick={onOpenUSSD}
              id="nav-check-codes-btn"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-sm transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              USSD Codes
            </button>

            <button
              onClick={onOpenSettings}
              id="nav-admin-settings-btn"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSMEPlugConnected
                  ? 'bg-blue-950/70 text-sky-300 border border-blue-800 hover:bg-blue-900/60'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Configure SMEPlug VTU API Key & Webhook"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gateway</span> API
              <span className={`w-1.5 h-1.5 rounded-full ${isSMEPlugConnected ? 'bg-sky-400' : 'bg-amber-400 animate-ping'}`} />
            </button>

            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap text-xs font-bold text-white bg-gradient-to-r from-[#1E40AF] via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.3),0_4px_14px_rgba(30,64,175,0.4)] px-4 py-2 rounded-lg transition-all duration-150"
            >
              ⚡ Buy Data
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#080d1a] px-4 pt-3 pb-6 flex flex-col gap-2">
            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Buy Data Instantly
            </button>
            <button
              onClick={() => scrollToSection('ways-to-fund')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              MoMo PSB (671) &amp; Smartcash Funding
            </button>
            <button
              onClick={() => scrollToSection('price-comparison')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Price Rates &amp; Savings
            </button>
            <button
              onClick={() => scrollToSection('feature-tour')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Feature Tour
            </button>
            <button
              onClick={() => scrollToSection('customer-stories')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Customer Reviews
            </button>
            <button
              onClick={onOpenTracker}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg flex items-center justify-between"
            >
              <span>Track Existing Order</span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={onOpenUSSD}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg flex items-center justify-between"
            >
              <span>Check USSD Codes</span>
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

