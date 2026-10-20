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
  { id: '1', network: 'MTN', size: '1.0 GB', price: 290, badge: 'Save 71%', category: 'SME Super Cheap', color: '#f59e0b' },
  { id: '2', network: 'AIRTEL', size: '1.0 GB', price: 295, badge: 'Popular', category: 'Corporate Gifting', color: '#ef4444' },
  { id: '3', network: 'GLO', size: '1.5 GB', price: 450, badge: 'Best Value', category: 'Direct Gifting', color: '#10b981' },
  { id: '4', network: '9MOBILE', size: '1.5 GB', price: 380, badge: 'Fast 4G', category: 'Corporate Gifting', color: '#84cc16' },
  { id: '5', network: 'MTN', size: '2.0 GB', price: 580, badge: 'Save 70%', category: 'SME Super Cheap', color: '#f59e0b' },
  { id: '6', network: 'AIRTEL', size: '2.0 GB', price: 590, badge: 'Trending', category: 'Corporate Gifting', color: '#ef4444' },
  { id: '7', network: 'MTN', size: '3.0 GB', price: 870, badge: 'Wholesale', category: 'SME Super Cheap', color: '#f59e0b' },
  { id: '8', network: 'GLO', size: '3.0 GB', price: 900, badge: '30 Days', category: 'Corporate Gifting', color: '#10b981' },
];

const ROW_TWO_BUNDLES: MarqueeBundle[] = [
  { id: '9', network: 'MTN', size: '5.0 GB', price: 1450, badge: 'Heavy Streamer', category: 'SME Super Cheap', color: '#f59e0b' },
  { id: '10', network: 'AIRTEL', size: '5.0 GB', price: 1475, badge: 'Top Seller', category: 'Corporate Gifting', color: '#ef4444' },
  { id: '11', network: 'GLO', size: '5.0 GB', price: 1500, badge: 'Big Data', category: 'Direct Gifting', color: '#10b981' },
  { id: '12', network: 'MTN', size: '10.0 GB', price: 2900, badge: 'Maximum Value', category: 'SME Super Cheap', color: '#f59e0b' },
  { id: '13', network: '9MOBILE', size: '3.0 GB', price: 760, badge: 'Superfast', category: 'Corporate Gifting', color: '#84cc16' },
  { id: '14', network: 'AIRTEL', size: '10.0 GB', price: 2950, badge: 'Office Pack', category: 'Corporate Gifting', color: '#ef4444' },
  { id: '15', network: 'GLO', size: '10.0 GB', price: 3000, badge: 'Night & Day', category: 'Direct Gifting', color: '#10b981' },
  { id: '16', network: 'MTN', size: '20.0 GB', price: 5800, badge: 'Reseller Pack', category: 'SME Super Cheap', color: '#f59e0b' },
];

export function ShowreelMarquee() {
  const scrollToPurchase = () => {
    const el = document.getElementById('data-purchase-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Get any kind of mobile data <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                instantly with DataAbeg
              </span>
            </h2>
          </div>
          <div className="max-w-md text-slate-400 text-sm sm:text-base">
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
              className="group relative shrink-0 w-64 sm:w-72 p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-600 transition-all text-left shadow-lg hover:shadow-blue-900/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black uppercase px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.network}
                </span>
                <span className="text-[10px] font-bold text-sky-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-900">
                  {item.badge}
                </span>
              </div>
              <p className="text-xl font-black text-white">{item.size}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">{item.category}</span>
                <span className="text-sm font-extrabold text-white">₦{item.price.toLocaleString()}</span>
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
              className="group relative shrink-0 w-64 sm:w-72 p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-600 transition-all text-left shadow-lg hover:shadow-blue-900/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black uppercase px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.network}
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-900/60">
                  {item.badge}
                </span>
              </div>
              <p className="text-xl font-black text-white">{item.size}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">{item.category}</span>
                <span className="text-sm font-extrabold text-white">₦{item.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Clueso-style Split Case Study / Value Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/80 backdrop-blur-xl">
          <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between gap-6 hover:bg-slate-900/40 transition-colors">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                <Zap className="w-4 h-4 text-sky-400" />
                Price Disruption
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                From ₦1,000 to ₦290 per GB
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Nigerian students, remote software engineers, and small teams scale their monthly downloads while cutting mobile data costs by over 71%. No 24-hour midnight expiry traps.
              </p>
            </div>
            <button
              onClick={scrollToPurchase}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-white transition-colors self-start"
            >
              <span>Explore Wholesale Rates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-10 flex flex-col justify-between gap-6 bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Telecom Switch Automation
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                3× faster automated delivery
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Direct telecom switch routing delivers mobile data in 5 seconds without network delays. Automated fallbacks ensure high delivery success even during peak traffic hours.
              </p>
            </div>
            <button
              onClick={scrollToPurchase}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-white transition-colors self-start"
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
