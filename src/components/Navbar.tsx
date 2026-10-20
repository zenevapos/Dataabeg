'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DataAbegLogo } from '@/components/DataAbegLogo';
import {
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Lock,
  LayoutDashboard,
  LogIn,
  UserPlus
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenTracker: () => void;
  onOpenUSSD: () => void;
  isSMEPlugConnected: boolean;
}

export function Navbar({ onOpenSettings, onOpenTracker, onOpenUSSD, isSMEPlugConnected }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full overflow-x-clip bg-white">
      {/* Top Announcement Bar */}
      <aside aria-label="Announcement" className="w-full bg-[#1E40AF] text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-8 sm:h-9 flex items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-400 text-blue-950 shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
            <span className="font-medium truncate">
              Instant 5-second mobile data delivery on <span className="font-bold text-yellow-300">MTN, Airtel, Glo &amp; 9mobile</span> from ₦290/GB!
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] shrink-0">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              VTU Switch Active
            </span>
            <button
              onClick={onOpenUSSD}
              className="text-blue-100 hover:text-white underline underline-offset-2 cursor-pointer"
            >
              Check USSD Codes
            </button>
          </div>
        </div>
      </aside>

      {/* Main Sticky Navbar */}
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <DataAbegLogo size={32} showText={true} textClassName="text-lg sm:text-xl font-heading" />
            <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1E40AF] border border-blue-200">
              v2.0
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => scrollToSection('data-purchase-section')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1E40AF] hover:bg-blue-50/60 transition-colors cursor-pointer"
            >
              Buy Data
            </button>
            <button
              onClick={() => scrollToSection('price-comparison')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1E40AF] hover:bg-blue-50/60 transition-colors cursor-pointer"
            >
              Price Comparison
            </button>
            <button
              onClick={() => scrollToSection('ussd-check-codes')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1E40AF] hover:bg-blue-50/60 transition-colors cursor-pointer"
            >
              USSD Balance Codes
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1E40AF] hover:bg-blue-50/60 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={onOpenTracker}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>Track Order</span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <Link
                    href="/admin-salam"
                    className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-300 hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-xs transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#1E40AF] hover:bg-blue-50/60 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button: Always visible on screens < lg */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2">
            {user ? (
              <div className="space-y-2 pb-2 border-b border-slate-100">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-white bg-[#1E40AF] rounded-lg shadow-xs"
                >
                  <span>Open User Dashboard</span>
                  <LayoutDashboard className="w-4 h-4" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin-salam"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-300 rounded-lg"
                  >
                    <span>Admin Console</span>
                    <Lock className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Nav list */}
            <div className="space-y-1 text-xs font-semibold text-slate-700">
              <button
                onClick={() => scrollToSection('data-purchase-section')}
                className="w-full text-left py-2 px-2 hover:bg-blue-50 hover:text-[#1E40AF] rounded-md transition-colors"
              >
                ⚡ Buy Data Instantly
              </button>
              <button
                onClick={() => scrollToSection('price-comparison')}
                className="w-full text-left py-2 px-2 hover:bg-blue-50 hover:text-[#1E40AF] rounded-md transition-colors"
              >
                📊 Price Comparison
              </button>
              <button
                onClick={() => scrollToSection('ussd-check-codes')}
                className="w-full text-left py-2 px-2 hover:bg-blue-50 hover:text-[#1E40AF] rounded-md transition-colors"
              >
                📱 USSD Balance Codes
              </button>
              <button
                onClick={() => scrollToSection('faq-section')}
                className="w-full text-left py-2 px-2 hover:bg-blue-50 hover:text-[#1E40AF] rounded-md transition-colors"
              >
                ❓ Frequently Asked Questions
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTracker();
                }}
                className="w-full text-left py-2 px-2 hover:bg-blue-50 hover:text-[#1E40AF] rounded-md transition-colors text-blue-700"
              >
                🔍 Track an Order
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
