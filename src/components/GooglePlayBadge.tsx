'use client';

import React from 'react';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.dataabeg.app';

export function GooglePlayBadge({
  href = PLAY_STORE_URL,
  variant = 'dark',
  size = 'md',
  className = '',
}: {
  href?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const isLight = variant === 'light';
  const padding = size === 'sm' ? 'px-3.5 py-2' : 'px-5 py-2.5';
  const iconSize = size === 'sm' ? 18 : 22;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-xl border transition-all shadow-sm hover:-translate-y-0.5 ${padding} ${
        isLight
          ? 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
          : 'bg-slate-950 text-white border-slate-800 hover:bg-slate-900'
      } ${className}`}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M3.61 1.814L13.793 12 3.61 22.186a1.75 1.75 0 0 1-.485-1.213V3.027c0-.476.185-.902.485-1.213z" />
        <path fill="#34A853" d="M17.207 8.586L13.793 12l3.414 3.414 3.854-2.198c.77-.44.77-1.992 0-2.432l-3.854-2.198z" />
        <path fill="#FBBC05" d="M13.793 12L3.61 1.814A1.73 1.73 0 0 1 5.38 1.6l11.827 6.986L13.793 12z" />
        <path fill="#EA4335" d="M17.207 15.414L5.38 22.4a1.73 1.73 0 0 1-1.77-.214L13.793 12l3.414 3.414z" />
      </svg>
      <span className="flex flex-col text-left leading-tight">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
          Get it on
        </span>
        <span className={size === 'sm' ? 'text-xs font-extrabold' : 'text-sm font-extrabold'}>
          Google Play
        </span>
      </span>
    </a>
  );
}

export default GooglePlayBadge;
