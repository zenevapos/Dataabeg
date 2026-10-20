'use client';

import React from 'react';
import { Zap, Wifi, ShieldCheck, Settings, HelpCircle, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenTracker: () => void;
  onOpenUSSD: () => void;
  isSMEPlugConnected: boolean;
}

export function Navbar({ onOpenSettings, onOpenTracker, onOpenUSSD, isSMEPlugConnected }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080d1a]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with #1E40AF Brand Color */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E40AF] to-blue-500 text-white font-black shadow-lg shadow-blue-900/40">
            <Zap className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Data<span className="text-[#38bdf8]">Abeg</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                MoMo &amp; Smartcash Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Automated 24/7 VTU Engine</p>
          </div>
        </div>

        {/* Live Network & PSB Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <Wifi className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Gateways &amp; PSBs:</span>
          <span className="font-semibold text-sky-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> 100% Operational
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenTracker}
            id="nav-track-order-btn"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Track Order
          </button>

          <button
            onClick={onOpenUSSD}
            id="nav-check-codes-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Check</span> Codes
          </button>

          <button
            onClick={onOpenSettings}
            id="nav-admin-settings-btn"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSMEPlugConnected
                ? 'bg-blue-900/40 text-blue-300 border border-blue-700 hover:bg-blue-900/60'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gateway</span> API
            <span className={`w-2 h-2 rounded-full ${isSMEPlugConnected ? 'bg-sky-400' : 'bg-amber-400 animate-ping'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
