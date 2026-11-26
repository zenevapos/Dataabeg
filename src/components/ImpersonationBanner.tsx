'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ImpersonationBanner() {
  const router = useRouter();
  const { isAdmin, impersonatedUser, stopImpersonation } = useAuth();

  if (!isAdmin || !impersonatedUser) return null;

  const handleExit = () => {
    stopImpersonation();
    router.push('/admin-salam');
  };

  return (
    <div className="sticky top-0 z-[9998] w-full bg-amber-500 text-slate-950 border-b border-amber-600/30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 shrink-0" />
          <span className="truncate">
            Viewing as{' '}
            <strong className="underline underline-offset-2">
              {impersonatedUser.displayName || impersonatedUser.email}
            </strong>{' '}
            ({impersonatedUser.email}) · Wallet: ₦
            {Number(impersonatedUser.walletBalance || 0).toLocaleString('en-NG', {
              minimumFractionDigits: 2
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin-salam"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin</span>
          </Link>
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
