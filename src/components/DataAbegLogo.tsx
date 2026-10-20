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
  size = 38,
  showText = true,
  textClassName = 'text-xl'
}: DataAbegLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision SVG Brand Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105 drop-shadow-xs"
      >
        <defs>
          <linearGradient id="dbLogoShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="dbLogoRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="dbLogoBolt" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#93C5FD" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="dbLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
        </defs>

        {/* Squircle base */}
        <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#dbLogoShield)" />
        <rect x="6" y="6" width="88" height="88" rx="24" stroke="url(#dbLogoRim)" strokeWidth="1.8" fill="none" />

        {/* 5G / Telecom waves */}
        <path
          d="M64 26 C75 32, 82 43, 82 55 C82 67, 75 78, 64 84"
          stroke="#60A5FA"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M57 34 C64 39, 69 47, 69 55 C69 63, 64 71, 57 76"
          stroke="#93C5FD"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Nodes */}
        <circle cx="73" cy="24" r="2.5" fill="#38BDF8" />
        <circle cx="83" cy="40" r="2.8" fill="#60A5FA" />
        <circle cx="84" cy="55" r="3" fill="#93C5FD" />

        {/* Dual-tone Bolt */}
        <path d="M52 16 L27 52 L43 52 L36 84 L67 46 L49 46 Z" fill="url(#dbLogoGold)" opacity="0.95" />
        <path d="M52 16 L31 52 L43 52 L38 84 L65 48 L49 48 Z" fill="url(#dbLogoBolt)" />
        <path
          d="M50 20 L35 50 L46 50 L40 76"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />
      </svg>

      {showText && (
        <span className={`font-black tracking-tight text-slate-900 ${textClassName}`}>
          Data<span className="text-[#1E40AF]">Abeg</span>
        </span>
      )}
    </div>
  );
}
