'use client';

import React from 'react';

interface DataAbegLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export function DataAbegLogo({
  className = '',
  size = 36,
  showText = true,
  textClassName = 'text-xl'
}: DataAbegLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Vector Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="dbgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="dbgBolt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="dbgGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Base Squircle */}
        <rect x="6" y="6" width="108" height="108" rx="28" fill="url(#dbgGrad)" />
        <rect x="6" y="6" width="108" height="108" rx="28" stroke="url(#dbgGlow)" strokeWidth="2.5" />

        {/* Data connectivity arcs */}
        <path d="M74 32 C85 38, 92 50, 92 64 C92 78, 85 90, 74 96" stroke="#60A5FA" strokeWidth="4.5" strokeLinecap="round" opacity="0.45" />
        <path d="M66 42 C74 47, 79 55, 79 64 C79 73, 74 81, 66 86" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" opacity="0.8" />

        {/* Sharp High-Speed Lightning Bolt */}
        <path d="M62 20 L36 62 L54 62 L48 100 L76 54 L58 54 Z" fill="url(#dbgBolt)" />

        {/* Node pulse dots */}
        <circle cx="82" cy="30" r="3" fill="#38BDF8" />
        <circle cx="94" cy="46" r="3.5" fill="#60A5FA" />
        <circle cx="96" cy="64" r="4" fill="#93C5FD" />
      </svg>

      {showText && (
        <span className={`font-black tracking-tight text-slate-900 ${textClassName}`}>
          Data<span className="text-[#1E40AF]">Abeg</span>
        </span>
      )}
    </div>
  );
}
