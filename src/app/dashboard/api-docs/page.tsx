'use client';

import React, { useState } from 'react';
import { CURATED_DATA_PLANS, NETWORKS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Code, Copy, Check, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<number | 'ALL'>('ALL');

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const curlExample = `curl -X POST https://dataabeg.com/api/smeplug/purchase \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "network_id": 1,
    "plan_id": 7,
    "phone": "08012345678",
    "customer_reference": "REF_1729000000"
  }'`;

  const nodeExample = `const response = await fetch('https://dataabeg.com/api/smeplug/purchase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    network_id: 1, // 1=MTN, 2=Airtel, 3=Glo, 4=9mobile
    plan_id: 7,    // MTN SME 1GB
    phone: '08012345678',
    customer_reference: 'ORDER_' + Date.now()
  })
});

const result = await response.json();
console.log(result);`;

  const filteredPlans = CURATED_DATA_PLANS.filter((p) => {
    return selectedNetworkFilter === 'ALL' || p.networkId === selectedNetworkFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Developer API Documentation &amp; Plan IDs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Integrate direct automated mobile data, airtime, and utility dispensing into your web app, mobile app, or WhatsApp bot.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full">
          <Terminal className="w-3.5 h-3.5 text-blue-600" />
          <span>Glad Tidings REST API v1</span>
        </div>
      </div>

      {/* Integration Guide & Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* cURL Request */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">cURL HTTP POST Request</span>
            <button
              onClick={() => handleCopy(curlExample, 'curl')}
              className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedSnippet === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre">
            {curlExample}
          </pre>
        </div>

        {/* Node.js Request */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Node.js / TypeScript Example</span>
            <button
              onClick={() => handleCopy(nodeExample, 'node')}
              className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedSnippet === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === 'node' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre">
            {nodeExample}
          </pre>
        </div>
      </div>

      {/* Plan IDs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Plan ID Reference Table
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Use these integer Plan IDs when dispatching data via API
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedNetworkFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedNetworkFilter === 'ALL'
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Networks
            </button>
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNetworkFilter(n.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedNetworkFilter === n.id
                    ? 'bg-[#1e3a8a] text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {n.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Network</th>
                <th className="p-3">Network ID</th>
                <th className="p-3">Plan Name</th>
                <th className="p-3">Plan ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Validity</th>
                <th className="p-3">API Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{p.networkName}</td>
                  <td className="p-3 font-mono font-bold text-blue-700">{p.networkId}</td>
                  <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                  <td className="p-3 font-mono font-extrabold text-[#1e3a8a]">{p.planId}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {p.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{p.validity}</td>
                  <td className="p-3 font-bold text-slate-900">{formatCurrency(p.sellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
