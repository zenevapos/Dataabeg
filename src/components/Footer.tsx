'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onOpenSettings: () => void;
  onOpenTracker: () => void;
  onOpenUSSD: () => void;
}

export function Footer({ onOpenSettings, onOpenTracker, onOpenUSSD }: FooterProps) {
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '08154276838';
  const whatsappUrl = `https://wa.me/234${supportPhone.replace(/^0/, '')}?text=Hello%20DataAbeg%20Support,%20I%20need%20help%20with%20data%20purchase.`;

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E40AF] text-white font-black shadow-xs">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 font-heading">
                Data<span className="text-[#1E40AF]">Abeg</span>
              </span>
            </div>

            <p className="text-slate-600 max-w-sm leading-relaxed">
              Nigeria&apos;s fastest automated mobile data vending portal. Empowering individuals and businesses to purchase MTN, Airtel, Glo &amp; 9mobile data at true wholesale rates with 30-day validity, backed by instant automated bank transfer and card checkout.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E40AF] border border-blue-200 font-bold transition-all text-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp 24/7 Support: {supportPhone}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#data-purchase-section" className="hover:text-[#1E40AF] transition-colors">
                  Buy MTN Data (from ₦290)
                </a>
              </li>
              <li>
                <a href="#data-purchase-section" className="hover:text-[#1E40AF] transition-colors">
                  Buy Airtel Data
                </a>
              </li>
              <li>
                <a href="#data-purchase-section" className="hover:text-[#1E40AF] transition-colors">
                  Buy Glo Data
                </a>
              </li>
              <li>
                <a href="#data-purchase-section" className="hover:text-[#1E40AF] transition-colors">
                  Buy 9mobile Data
                </a>
              </li>
              <li>
                <button onClick={onOpenUSSD} className="hover:text-[#1E40AF] transition-colors text-left cursor-pointer">
                  Check Balance USSD Codes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resellers & Devs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Reseller &amp; Admin
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin-salam" className="hover:text-blue-800 transition-colors font-bold text-[#1E40AF] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Salam Portal</span>
                </Link>
              </li>
              <li>
                <button onClick={onOpenSettings} className="hover:text-[#1E40AF] transition-colors text-left cursor-pointer">
                  Glad Tidings Gateway Drawer
                </button>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-[#1E40AF] transition-colors text-left cursor-pointer">
                  Track Delivery Status
                </button>
              </li>
              <li>
                <a
                  href="https://gladtidingsdata.com/documentation/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1E40AF] transition-colors"
                >
                  Glad Tidings API Portal
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-[#1E40AF] transition-colors">
                  VTU Reselling FAQs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-4">
            <p>© 2026 DataAbeg. All rights reserved.</p>
            <Link href="/privacy" className="text-slate-600 hover:text-[#1E40AF] underline">
              Privacy Policy
            </Link>
          </div>

          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-blue-600 fill-[#1E40AF]" /> for Nigerian Internet Users
          </p>
        </div>
      </div>
    </footer>
  );
}
