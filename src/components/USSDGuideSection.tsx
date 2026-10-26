'use client';

import React, { useState } from 'react';
import { NETWORKS } from '@/lib/constants';
import { Copy, Check, HelpCircle, Radio } from 'lucide-react';
import NetworkLogo from '@/components/NetworkLogo';

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1E40AF] text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Quick USSD Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
          How to Check Your Data Balance
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          After purchasing on DataAbeg, your data bundle arrives instantly. Dial the official codes below or check the automated SMS notification from your network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {NETWORKS.map((network) => (
          <div
            key={network.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <NetworkLogo network={network.name} size={36} roundedClassName="rounded-xl" />
                <Radio className="w-4 h-4 text-slate-400" />
              </div>

              <h4 className="text-base font-bold text-slate-900 font-heading">{network.displayName}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{network.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">
                USSD Dial Code
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[#1E40AF]">
                <span>{network.ussdCheckCode}</span>
                <button
                  onClick={() => handleCopy(network.name, network.ussdCheckCode)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedNetwork === network.name ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {network.smsCheckCode && (
                <p className="mt-2 text-[10px] text-slate-500">
                  SMS Option: <span className="text-slate-800 font-medium">{network.smsCheckCode}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
