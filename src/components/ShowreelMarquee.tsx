'use client';

import React from 'react';
import { Sparkles, ArrowRight, TrendingDown, Zap, ShieldCheck } from 'lucide-react';

interface MarqueeBundle {
  id: string;
  network: string;
  size: string;
  price: number;
  badge: string;
  category: string;
  color: string;
}

const ROW_ONE_BUNDLES: MarqueeBundle[] = [
  { id: '1', network: 'MTN', size: '1.0 GB', price: 290, badge: 'Save 71%', category: 'SME Super Cheap', color: '#d97706' },
  { id: '2', network: 'AIRTEL', size: '1.0 GB', price: 295, badge: 'Popular', category: 'Corporate Gifting', color: '#dc2626' },
  { id: '3', network: 'GLO', size: '1.5 GB', price: 450, badge: 'Best Value', category: 'Direct Gifting', color: '#059669' },
  { id: '4', network: '9MOBILE', size: '1.5 GB', price: 380, badge: 'Fast 4G', category: 'Corporate Gifting', color: '#65a30d' },
  { id: '5', network: 'MTN', size: '2.0 GB', price: 580, badge: 'Save 70%', category: 'SME Super Cheap', color: '#d97706' },
  { id: '6', network: 'AIRTEL', size: '2.0 GB', price: 590, badge: 'Trending', category: 'Corporate Gifting', color: '#dc2626' },
  { id: '7', network: 'MTN', size: '3.0 GB', price: 870, badge: 'Wholesale', category: 'SME Super Cheap', color: '#d97706' },
  { id: '8', network: 'GLO', size: '3.0 GB', price: 900, badge: '30 Days', category: 'Corporate Gifting', color: '#059669' },
];

const ROW_TWO_BUNDLES: MarqueeBundle[] = [
  { id: '9', network: 'MTN', size: '5.0 GB', price: 1450, badge: 'Heavy Streamer', category: 'SME Super Cheap', color: '#d97706' },
  { id: '10', network: 'AIRTEL', size: '5.0 GB', price: 1475, badge: 'Top Seller', category: 'Corporate Gifting', color: '#dc2626' },
  { id: '11', network: 'GLO', size: '5.0 GB', price: 1500, badge: 'Big Data', category: 'Direct Gifting', color: '#059669' },
  { id: '12', network: 'MTN', size: '10.0 GB', price: 2900, badge: 'Maximum Value', category: 'SME Super Cheap', color: '#d97706' },
  { id: '13', network: '9MOBILE', size: '3.0 GB', price: 760, badge: 'Superfast', category: 'Corporate Gifting', color: '#65a30d' },
  { id: '14', network: 'AIRTEL', size: '10.0 GB', price: 2950, badge: 'Office Pack', category: 'Corporate Gifting', color: '#dc2626' },
  { id: '15', network: 'GLO', size: '10.0 GB', price: 3000, badge: 'Night & Day', category: 'Direct Gifting', color: '#059669' },
  { id: '16', network: 'MTN', size: '20.0 GB', price: 5800, badge: 'Reseller Pack', category: 'SME Super Cheap', color: '#d97706' },
];

export function ShowreelMarquee() {
  const scrollToPurchase = () => {
    const el = document.getElementById('data-purchase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full py-16 sm:py-24 border-t border-slate-200 bg-slate-50/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
              Get any kind of mobile data <br />
              <span className="text-[#1E40AF]">
                instantly with DataAbeg
              </span>
            </h2>
          </div>
          <div className="max-w-md text-slate-600 text-sm sm:text-base">
            <p>
              SME super cheap bundles, Corporate Gifting (CG), direct gifting, and airtime VTU. Full 30 days validity across MTN, Airtel, Glo &amp; 9mobile with zero hidden fees.
            </p>
          </div>
        </div>
      </div>

      {/* Marquee Row 1 - Forward Moving */}
      <div className="w-full overflow-hidden py-2 relative select-none">
        <div className="animate-marquee flex gap-4 pr-4">
          {[...ROW_ONE_BUNDLES, ...ROW_ONE_BUNDLES].map((item, idx) => (
            <button
              key={`row1-${item.id}-${idx}`}
              type="button"
              onClick={scrollToPurchase}
              className="group relative shrink-0 w-64 sm:w-72 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1E40AF] transition-all text-left shadow-2xs hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black uppercase px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  {item.network}
                </span>
                <span className="text-[10px] font-bold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {item.badge}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 font-heading">{item.size}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">{item.category}</span>
                <span className="text-sm font-extrabold text-[#1E40AF]">₦{item.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 - Reverse Moving */}
      <div className="w-full overflow-hidden py-2 mt-2 relative select-none">
        <div className="animate-marquee-reverse flex gap-4 pr-4">
          {[...ROW_TWO_BUNDLES, ...ROW_TWO_BUNDLES].map((item, idx) => (
            <button
              key={`row2-${item.id}-${idx}`}
              type="button"
              onClick={scrollToPurchase}
              className="group relative shrink-0 w-64 sm:w-72 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1E40AF] transition-all text-left shadow-2xs hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black uppercase px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  {item.network}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {item.badge}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 font-heading">{item.size}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">{item.category}</span>
                <span className="text-sm font-extrabold text-[#1E40AF]">₦{item.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Split Case Study / Value Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between gap-6 hover:bg-slate-50/60 transition-colors">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-3">
                <Zap className="w-4 h-4 text-[#1E40AF]" />
                Price Disruption
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 font-heading">
                From ₦1,000 to ₦290 per GB
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Nigerian students, remote software engineers, and small teams scale their monthly downloads while cutting mobile data costs by over 71%. No 24-hour midnight expiry traps.
              </p>
            </div>
            <button
              onClick={scrollToPurchase}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] hover:text-blue-800 transition-colors self-start cursor-pointer"
            >
              <span>Explore Wholesale Rates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 bg-slate-50/40 hover:bg-slate-50/80 transition-colors">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Telecom Switch Automation
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 font-heading">
                3× faster automated delivery
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Direct telecom switch routing delivers mobile data in 5 seconds without network delays. Automated fallbacks ensure high delivery success even during peak traffic hours.
              </p>
            </div>
            <button
              onClick={scrollToPurchase}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] hover:text-blue-800 transition-colors self-start cursor-pointer"
            >
              <span>Verify Delivery Speed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
