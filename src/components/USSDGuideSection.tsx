'use client';

import React, { useState } from 'react';
import { NETWORKS } from '@/lib/constants';
import { Copy, Check, HelpCircle, Radio } from 'lucide-react';

export function USSDGuideSection() {
  const [copiedNetwork, setCopiedNetwork] = useState<string | null>(null);

  const handleCopy = (netName: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedNetwork(netName);
    setTimeout(() => setCopiedNetwork(null), 2000);
  };

  return (
    <section id="ussd-check-codes" className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-sky-300 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Quick USSD Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          How to Check Your Data Balance
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          After purchasing on DataAbeg, your data bundle arrives instantly. Dial the official codes below or check the automated SMS notification from your network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {NETWORKS.map((network) => (
          <div
            key={network.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: network.color,
                    color: network.name === 'MTN' ? '#000' : '#fff'
                  }}
                >
                  {network.name}
                </span>
                <Radio className="w-4 h-4 text-slate-500" />
              </div>

              <h4 className="text-base font-bold text-white">{network.displayName}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{network.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                USSD Dial Code
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-sky-400">
                <span>{network.ussdCheckCode}</span>
                <button
                  onClick={() => handleCopy(network.name, network.ussdCheckCode)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Copy Code"
                >
                  {copiedNetwork === network.name ? (
                    <Check className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {network.smsCheckCode && (
                <p className="mt-2 text-[10px] text-slate-400">
                  SMS Option: <span className="text-slate-300 font-medium">{network.smsCheckCode}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
