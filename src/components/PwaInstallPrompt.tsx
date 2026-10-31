'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Share2, PlusSquare, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA service worker registration notice:', err);
      });
    }

    // 2. Check if already installed / standalone
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isInStandaloneMode);
    if (isInStandaloneMode) return;

    // Check if dismissed recently
    const dismissedTime = localStorage.getItem('dataabeg_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 3. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show prompt after 5 seconds
    let iosTimer: NodeJS.Timeout;
    if (isIosDevice && !isInStandaloneMode) {
      iosTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch {
      // Ignored
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('dataabeg_pwa_dismissed', String(Date.now()));
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-800 backdrop-blur-md flex items-start gap-3.5 relative">
        {/* App Icon */}
        <div className="w-11 h-11 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center font-black font-space text-lg shrink-0 shadow-md">
          DA
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-white font-space">Install DataAbeg App</h4>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Fast 5-Sec
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {isIos
              ? 'Tap Share ⎋ below then select "Add to Home Screen" to install DataAbeg.'
              : 'Add DataAbeg to your home screen for instant 1-tap data recharges without opening browser.'}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {!isIos && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4f46e5] hover:bg-indigo-600 text-white transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            )}

            {isIos && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
                <span className="text-slate-400">➔</span>
                <PlusSquare className="w-3.5 h-3.5" />
                <span>Add to Home Screen</span>
              </div>
            )}

            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

