'use client';

import React, { useState } from 'react';
import { Zap, Building2, Smartphone, ShieldCheck, Clock, HelpCircle, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface TourFeature {
  id: string;
  title: string;
  shortDesc: string;
  badge: string;
  color: string;
  details: {
    heading: string;
    description: string;
    highlight: string;
    bullets: string[];
  };
}

const TOUR_FEATURES: TourFeature[] = [
  {
    id: 'speed',
    title: '5-Second Delivery',
    shortDesc: 'Automated telecom switch dispenses mobile data directly to SIM.',
    badge: '100% Automated',
    color: '#38bdf8',
    details: {
      heading: 'Instant SIM crediting with 0 human intervention',
      description:
        'Our direct integration with SMEPlug and telecom switches ensures your line receives data bundles within 5 seconds of payment confirmation.',
      highlight: 'Average delivery speed: 4.8 seconds',
      bullets: [
        'Direct switch API integration with MTN, Airtel, Glo & 9mobile',
        'Automatic retry mechanisms in case of network fluctuations',
        'Live SMS confirmation delivered straight from telecom carrier'
      ]
    }
  },
  {
    id: 'momo',
    title: 'MoMo PSB (671) Virtual Funding',
    shortDesc: 'Direct zero-fee bank transfer to MTN MoMo Payment Service Bank.',
    badge: '0% Transfer Fee',
    color: '#f59e0b',
    details: {
      heading: 'Save on bank transfer charges with MoMo PSB',
      description:
        'Transfer from any Nigerian banking app (OPay, Kuda, GTB, Zenith, Palmpay) to MoMo PSB (Bank Code: 671). Instant automated crediting with zero transfer deductions.',
      highlight: 'Licensed by the Central Bank of Nigeria (CBN)',
      bullets: [
        'Dedicated virtual account for every user/reseller',
        'Sub-second payment recognition and automatic checkout',
        'Zero card processing fees or hidden charges'
      ]
    }
  },
  {
    id: 'smartcash',
    title: 'Smartcash PSB Auto-Topup',
    shortDesc: 'Airtel digital banking network for friction-free payment.',
    badge: 'Airtel Powered',
    color: '#ef4444',
    details: {
      heading: 'Airtel Smartcash instant wallet funding',
      description:
        'Powered by Airtel Smartcash payment service bank, experience high-speed transaction confirmation and zero payment bottlenecks.',
      highlight: 'Instant receipt generation',
      bullets: [
        'Direct Airtel virtual account generation',
        'Optimized for rapid bundle reselling',
        'Works seamlessly on mobile web and desktop'
      ]
    }
  },
  {
    id: 'validity',
    title: '30 Days Validity Guarantee',
    shortDesc: 'Full 30-day lifespan on all SME & CG bundles. No 24-hr traps.',
    badge: 'No 1-Day Traps',
    color: '#10b981',
    details: {
      heading: 'Never lose your mobile data to midnight expiry',
      description:
        'Unlike commercial banks that sell expensive 1-day or 2-day emergency bundles, every standard DataAbeg bundle comes with full 30 days validity.',
      highlight: 'Rolls over when you top up before expiry',
      bullets: [
        'Full calendar month validity on all networks',
        'Data rollover supported on regular SME plans',
        'Check anytime with official USSD dialer codes'
      ]
    }
  },
  {
    id: 'dnd',
    title: 'DND SIM Bypass Technology',
    shortDesc: 'Delivery works smoothly on corporate and DND-restricted lines.',
    badge: 'Universal Delivery',
    color: '#a855f7',
    details: {
      heading: 'Reliable delivery regardless of Do-Not-Disturb status',
      description:
        'Many VTU services fail when sending data to lines with active DND (Do-Not-Disturb) filters. DataAbeg routes traffic through white-listed telecom channels to ensure delivery.',
      highlight: '99.98% successful first-time delivery rate',
      bullets: [
        'Corporate CUG lines fully supported',
        'DND active lines receive bundles without blockage',
        'Automatic number sanitization and network prefix verification'
      ]
    }
  },
  {
    id: 'tracker',
    title: 'Real-Time Order Tracker',
    shortDesc: 'Verify order status and download transaction proof anytime.',
    badge: 'Live Audit Trail',
    color: '#3b82f6',
    details: {
      heading: 'Complete transparency with live transaction tracking',
      description:
        'Search any past transaction using your phone number or unique order reference. Access timestamps, gateway response codes, and downloadable receipts.',
      highlight: 'Instant digital PDF/PNG receipt generation',
      bullets: [
        'Public order lookup by 11-digit phone number',
        'Unique cryptographic order reference for every transaction',
        'Direct WhatsApp support escalation with prefilled order details'
      ]
    }
  }
];

export function FeatureTourSection() {
  const [activeTabId, setActiveTabId] = useState<string>('speed');

  const activeFeature = TOUR_FEATURES.find((f) => f.id === activeTabId) || TOUR_FEATURES[0];

  const scrollToPurchase = () => {
    const el = document.getElementById('data-purchase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="feature-tour" className="w-full py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              <span className="text-slate-400 font-normal">Let the engine deliver.</span>
              <br />
              Take control if you want.
            </h2>
          </div>
          <div className="max-w-md text-slate-400 text-sm sm:text-base">
            <p>
              Everything you need for cheap, stress-free mobile data. Instant switch dispensing, zero-fee PSB funding, and transparent verification tools.
            </p>
          </div>
        </div>

        {/* Clueso Tour Layout: Left Sticky Tab Rail + Right Preview Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Feature Tab Rail */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {TOUR_FEATURES.map((feature, idx) => {
              const isActive = feature.id === activeTabId;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActiveTabId(feature.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative ${
                    isActive
                      ? 'bg-slate-900 border-blue-600 shadow-lg shadow-blue-950/50'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold"
                        style={{
                          backgroundColor: isActive ? feature.color : 'rgba(255,255,255,0.06)',
                          color: isActive ? '#000' : '#fff'
                        }}
                      >
                        0{idx + 1}
                      </span>
                      <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {feature.title}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: `${feature.color}40`,
                        color: feature.color,
                        backgroundColor: `${feature.color}10`
                      }}
                    >
                      {feature.badge}
                    </span>
                  </div>
                  {isActive && (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-9">
                      {feature.shortDesc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Visual Stage with Dynamic Colors and Deep Details */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
              {/* Top ambient badge */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${activeFeature.color}15`,
                    borderColor: `${activeFeature.color}50`,
                    color: activeFeature.color
                  }}
                >
                  {activeFeature.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Module 0{TOUR_FEATURES.findIndex((f) => f.id === activeTabId) + 1} of 06
                </span>
              </div>

              {/* Main Content */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  {activeFeature.details.heading}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                  {activeFeature.details.description}
                </p>

                {/* Highlight Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold text-white flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{activeFeature.details.highlight}</span>
                </div>

                {/* Bullets */}
                <div className="space-y-2.5">
                  {activeFeature.details.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to test our delivery engine?
                </span>
                <button
                  onClick={scrollToPurchase}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Buy Data from ₦290</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
