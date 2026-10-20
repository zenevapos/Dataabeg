'use client';

import React from 'react';
import { Zap, MessageCircle, Phone, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenSettings: () => void;
  onOpenTracker: () => void;
  onOpenUSSD: () => void;
}

export function Footer({ onOpenSettings, onOpenTracker, onOpenUSSD }: FooterProps) {
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '08154276838';
  const whatsappUrl = `https://wa.me/234${supportPhone.replace(/^0/, '')}?text=Hello%20DataAbeg%20Support,%20I%20need%20help%20with%20data%20purchase.`;

  return (
    <footer className="border-t border-slate-800 bg-[#060910] text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Data<span className="text-emerald-400">Abeg</span>
              </span>
            </div>

            <p className="text-slate-400 max-w-sm leading-relaxed">
              Nigeria&apos;s fastest automated mobile data vending portal. Empowering individuals and businesses to purchase MTN, Airtel, Glo &amp; 9mobile data at true wholesale rates with 30-day validity.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold transition-all text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp 24/7 Support: {supportPhone}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#data-purchase-section" className="hover:text-emerald-400 transition-colors">
                  Buy MTN Data (from ₦290)
                </a>
              </li>
              <li>
                <a href="#data-purchase-section" className="hover:text-emerald-400 transition-colors">
                  Buy Airtel Data
                </a>
              </li>
              <li>
                <a href="#data-purchase-section" className="hover:text-emerald-400 transition-colors">
                  Buy Glo Data
                </a>
              </li>
              <li>
                <a href="#data-purchase-section" className="hover:text-emerald-400 transition-colors">
                  Buy 9mobile Data
                </a>
              </li>
              <li>
                <button onClick={onOpenUSSD} className="hover:text-emerald-400 transition-colors text-left">
                  Check Balance USSD Codes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resellers & Devs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Reseller &amp; API
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenSettings} className="hover:text-emerald-400 transition-colors text-left">
                  SMEPlug API Setup
                </button>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-emerald-400 transition-colors text-left">
                  Track Delivery Status
                </button>
              </li>
              <li>
                <a
                  href="https://smeplug.ng/dashboard/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  SMEPlug Developer Portal
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-emerald-400 transition-colors">
                  VTU Reselling FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 DataAbeg. All rights reserved. Automated VTU Provider.</p>

          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Nigerian Internet Users
          </p>
        </div>
      </div>
    </footer>
  );
}
