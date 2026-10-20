'use client';

import React, { useState } from 'react';
import { Star, Quote, ArrowRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  highlight: string;
  network: string;
  avatarBg: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'tech-remote',
    name: 'Tunde Adebayo',
    role: 'Senior Frontend Engineer',
    location: 'Lagos, Nigeria',
    quote:
      'Working remotely requires over 80GB of data monthly for Zoom calls and GitHub builds. DataAbeg cut my monthly data bill from ₦38,000 on commercial bank apps to under ₦14,000.',
    highlight: 'cut my monthly data bill from ₦38,000 to under ₦14,000 with 5-second delivery',
    network: 'MTN SME 10GB',
    avatarBg: 'bg-[#1E40AF]'
  },
  {
    id: 'unilag-student',
    name: 'Chioma Okonkwo',
    role: 'Biochemistry Student (UNILAG)',
    location: 'Akoka, Lagos',
    quote:
      'Buying 1GB on my bank app used to cost ₦1,000 and it often failed during midnight project submissions. On DataAbeg, 1GB is ₦290 and it drops in my SIM before I even switch apps.',
    highlight: '1GB for ₦290 with full 30 days validity instead of ₦1,000 bank rates',
    network: 'Airtel CG 2GB',
    avatarBg: 'bg-rose-600'
  },
  {
    id: 'campus-reseller',
    name: 'Ibrahim Danladi',
    role: 'Campus VTU Reseller & Rep',
    location: 'Ibadan, Oyo State',
    quote:
      'I dispense data to over 300 students in my hostel daily. The automated switch is rock solid, and having MoMo PSB (671) with zero deposit fees makes my profit margins unbeatable.',
    highlight: 'dispenses to 300+ students daily with 0% MoMo PSB transfer fees',
    network: 'MTN & Airtel Wholesale',
    avatarBg: 'bg-amber-600'
  },
  {
    id: 'freelance-designer',
    name: 'Blessing Udoh',
    role: 'Product Designer & Creator',
    location: 'Abuja, FCT',
    quote:
      'I love that there are no 24-hour midnight expiry traps. Every single bundle lasts for a full 30 days. The USSD balance check codes right on the site make verification instant.',
    highlight: 'no 24-hour expiry traps, all bundles last a full 30 days',
    network: 'Glo Data 5GB',
    avatarBg: 'bg-emerald-600'
  },
  {
    id: 'sme-owner',
    name: 'Emeka Nwosu',
    role: 'Operations Director, Logistics Hub',
    location: 'Port Harcourt, Rivers',
    quote:
      'We run field dispatch riders who rely heavily on Google Maps. We fund all their lines via DataAbeg Corporate Gifting and get automated digital receipts for company accounting.',
    highlight: 'automated digital receipts and corporate gifting for field riders',
    network: '9mobile & MTN Fleet',
    avatarBg: 'bg-indigo-600'
  }
];

export function TestimonialsSection() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const current = TESTIMONIALS[selectedIdx];

  const scrollToPurchase = () => {
    const el = document.getElementById('data-purchase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="customer-stories" className="w-full py-16 sm:py-24 border-t border-slate-200 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
              Hear it from our customers
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Overall Rating:</span>
            <div className="flex text-amber-500">{'★'.repeat(5)}</div>
            <span className="font-bold text-slate-900">4.9 / 5</span>
          </div>
        </div>

        {/* Tabbed Testimonial Card */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xl">
          {/* Horizontal Tab Buttons */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/80 scrollbar-none">
            {TESTIMONIALS.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`px-5 py-4 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-[#1E40AF] text-[#1E40AF] bg-white font-bold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#1E40AF]' : 'bg-slate-300'}`} />
                  {item.name.split(' ')[0]} ({item.role.split(' ')[0]})
                </button>
              );
            })}
          </div>

          {/* Testimonial Content Panel */}
          <div className="p-6 sm:p-12 flex flex-col justify-between gap-8 min-h-[300px]">
            <div>
              <div className="flex items-center gap-2 text-amber-500 text-xs mb-4">
                <Quote className="w-5 h-5 opacity-70" />
                <span className="text-slate-500 font-mono text-[11px] font-bold">VERIFIED DATA PURCHASE • {current.network}</span>
              </div>

              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-900 leading-relaxed">
                &ldquo;{current.quote.replace(current.highlight, '')}
                <mark className="bg-blue-100 text-[#1E40AF] font-bold px-1.5 py-0.5 rounded border-b-2 border-[#1E40AF]">
                  {current.highlight}
                </mark>
                .&rdquo;
              </blockquote>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${current.avatarBg} text-white font-black flex items-center justify-center text-sm shadow-xs`}>
                  {current.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 font-heading">{current.name}</p>
                  <p className="text-xs text-slate-500">
                    {current.role} • <span className="text-slate-700 font-medium">{current.location}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={scrollToPurchase}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1E40AF] hover:text-blue-800 transition-colors cursor-pointer"
              >
                <span>Join 50,000+ Happy Buyers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
