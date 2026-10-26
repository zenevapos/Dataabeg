'use client';

import React from 'react';
import Image from 'next/image';

interface NetworkLogoProps {
  network: string; // 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE' | '1' | '2' | '3' | '6'
  size?: number;
  className?: string;
  roundedClassName?: string;
}

export default function NetworkLogo({
  network,
  size = 40,
  className = '',
  roundedClassName = 'rounded-2xl'
}: NetworkLogoProps) {
  const norm = String(network || '').toUpperCase().trim();

  let src = '/networks/mtn.svg';
  let alt = 'MTN Nigeria';

  if (norm.includes('AIRTEL') || norm === '3') {
    src = '/networks/airtel.svg';
    alt = 'Airtel Nigeria';
  } else if (norm.includes('GLO') || norm === '2') {
    src = '/networks/glo.svg';
    alt = 'Glo Nigeria';
  } else if (norm.includes('9MOBILE') || norm.includes('ETISALAT') || norm === '6') {
    src = '/networks/9mobile.svg';
    alt = '9mobile Nigeria';
  } else {
    src = '/networks/mtn.svg';
    alt = 'MTN Nigeria';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-slate-100 ${roundedClassName} ${className}`}
      style={{ width: size, height: size }}
      title={alt}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}
