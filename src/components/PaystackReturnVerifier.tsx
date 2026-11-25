'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PaystackReturnVerifier() {
  const pathname = usePathname();
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Wallet page has its own dedicated verifier UI
    if (pathname?.startsWith('/dashboard/wallet')) return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref');
    if (!ref) return;

    window.history.replaceState({}, document.title, window.location.pathname);

    const run = async () => {
      setStatus('verifying');
      setMessage('Confirming your Paystack payment...');
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (user) {
          try {
            const idToken = await user.getIdToken();
            headers.Authorization = `Bearer ${idToken}`;
          } catch {}
        }

        const res = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers,
          body: JSON.stringify({ reference: ref })
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setStatus('success');
          setMessage(data.message || 'Payment confirmed and order processed!');
          refreshProfile().catch(() => {});
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment received, please check your Transactions tab.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Could not confirm payment. Please check Transactions.');
      }
    };

    run();
  }, [pathname, user]);

  if (status === 'idle') return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        className={`rounded-2xl border p-4 shadow-xl flex items-start gap-3 ${
          status === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : status === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}
      >
        {status === 'verifying' && <RefreshCw className="w-5 h-5 animate-spin shrink-0 mt-0.5 text-indigo-600" />}
        {status === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />}
        {status === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />}
        <div className="flex-1 text-xs font-semibold leading-relaxed">{message}</div>
        <button
          onClick={() => setStatus('idle')}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
