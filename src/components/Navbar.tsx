'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, Wifi, ShieldCheck, Settings, HelpCircle, ArrowRight, Menu, X, Sparkles, Lock } from 'lucide-react';

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
      {/* Top Announcement Bar (Light theme) */}
      <aside aria-label="Announcement" className="relative w-full overflow-hidden bg-blue-50/90 border-b border-blue-100 text-blue-950">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex min-h-10 items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-[#1E40AF]">
              <Sparkles className="w-3 h-3 text-[#1E40AF]" />
            </span>
            <span className="font-medium text-slate-700">
              Direct <span className="text-[#1E40AF] font-bold">MoMo PSB (671)</span> &amp; <span className="text-rose-700 font-bold">Smartcash</span> virtual funding live! Save up to{' '}
              <span className="font-bold text-[#1E40AF]">71% off</span> on MTN, Airtel, Glo &amp; 9mobile this week.
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              24/7 VTU Switch 100% Operational
            </span>
            <button
              onClick={() => scrollToSection('ways-to-fund')}
              className="text-slate-600 hover:text-[#1E40AF] transition-colors underline underline-offset-2 cursor-pointer"
            >
              Learn about MoMo
            </button>
          </div>
        </div>
      </aside>

      {/* Main Sticky Navbar (Light theme) */}
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo with #1E40AF Brand Color */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E40AF] via-blue-700 to-sky-500 text-white font-black shadow-md shadow-blue-900/30 transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 fill-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 font-heading">
                  Data<span className="text-[#1E40AF]">Abeg</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 tracking-wide">Automated Mobile Data Platform</p>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Buy Data
            </button>
            <button
              onClick={() => scrollToSection('ways-to-fund')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              MoMo &amp; Smartcash
            </button>
            <button
              onClick={() => scrollToSection('price-comparison')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Rates &amp; Savings
            </button>
            <button
              onClick={() => scrollToSection('feature-tour')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('customer-stories')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenTracker}
              id="nav-track-order-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF]" />
              Track Order
            </button>

            <button
              onClick={onOpenUSSD}
              id="nav-check-codes-btn"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              USSD Codes
            </button>

            {/* Admin Salam Link */}
            <Link
              href="/admin-salam"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#1E40AF] bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
              title="Admin Salam Portal"
            >
              <Lock className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span className="hidden sm:inline">Admin</span> Salam
            </Link>

            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap text-xs font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-md shadow-blue-900/20 px-4 py-2 rounded-lg transition-all duration-150"
            >
              ⚡ Buy Data
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Light theme) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 flex flex-col gap-2 shadow-lg">
            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Buy Data Instantly
            </button>
            <button
              onClick={() => scrollToSection('ways-to-fund')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              MoMo PSB (671) &amp; Smartcash Funding
            </button>
            <button
              onClick={() => scrollToSection('price-comparison')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Price Rates &amp; Savings
            </button>
            <button
              onClick={() => scrollToSection('feature-tour')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Feature Tour
            </button>
            <button
              onClick={() => scrollToSection('customer-stories')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Customer Reviews
            </button>
            <button
              onClick={onOpenTracker}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer"
            >
              <span>Track Existing Order</span>
              <ShieldCheck className="w-4 h-4 text-[#1E40AF]" />
            </button>
            <button
              onClick={onOpenUSSD}
              className="text-left px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer"
            >
              <span>Check USSD Codes</span>
              <HelpCircle className="w-4 h-4 text-amber-500" />
            </button>
            <Link
              href="/admin-salam"
              className="text-left px-3 py-2 text-sm font-bold text-[#1E40AF] bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-between cursor-pointer"
            >
              <span>Admin Salam Portal</span>
              <Lock className="w-4 h-4 text-[#1E40AF]" />
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}
