'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isValidNigerianPhone, normalizePhone, detectNetworkFromPhone } from '@/lib/utils';
import { subscribeToVerification } from '@/lib/whatsappVerification';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhone?: string;
  onSuccess?: (phone: string) => void;
}

interface VerificationChallenge {
  phone: string;
  intlPhone: string;
  code: string;
  whatsappUrl: string;
  expiresAt: number;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  initialPhone = '',
  onSuccess
}: PhoneVerificationModalProps) {
  const { user, profile, updateUserPhone, refreshProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [step, setStep] = useState<'input' | 'verifying' | 'success'>('input');
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstantVerifying, setIsInstantVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualCodeError, setManualCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const unsubListenerRef = useRef<(() => void) | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize phone when opened
  useEffect(() => {
    if (isOpen) {
      const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('dataabeg_phone') || '' : '';
      const defaultPhone =
        (initialPhone && initialPhone !== '08154276838' ? initialPhone : '') ||
        (profile?.phoneNumber && profile.phoneNumber !== '08154276838' ? profile.phoneNumber : '') ||
        (storedPhone !== '08154276838' ? storedPhone : '') ||
        '';
      setPhoneNumber(defaultPhone);
      setStep('input');
      setChallenge(null);
      setErrorMessage('');
      setManualCode('');
      setManualCodeError('');
    }
    return () => {
      cleanupListeners();
    };
  }, [isOpen, initialPhone, profile?.phoneNumber]);

  const cleanupListeners = () => {
    if (unsubListenerRef.current) {
      unsubListenerRef.current();
      unsubListenerRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const detectedNetwork = detectNetworkFromPhone(phoneNumber);

  /**
   * Finalize verification in Firebase & local cache
   */
  const handleFinalSuccess = async (cleanPhone: string) => {
    cleanupListeners();
    setIsLoading(true);
    try {
      await updateUserPhone(cleanPhone, true);
      await refreshProfile();
      setStep('success');
      if (onSuccess) onSuccess(cleanPhone);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.warn('Profile phone save warning:', err);
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 1800);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start WhatsApp Verification Challenge
   */
  const handleStartVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const clean = normalizePhone(phoneNumber);
    if (!isValidNigerianPhone(clean)) {
      setErrorMessage('Please enter a valid 11-digit Nigerian phone number (e.g. 08012345678)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', phone: clean })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not initiate phone verification.');
      }

      setChallenge({
        phone: data.phone,
        intlPhone: data.intlPhone,
        code: data.code,
        whatsappUrl: data.whatsappUrl,
        expiresAt: data.expiresAt
      });
      setStep('verifying');

      // 1. Real-time Firestore subscription
      cleanupListeners();
      unsubListenerRef.current = subscribeToVerification(clean, () => {
        handleFinalSuccess(clean);
      });

      // 2. Fallback Polling every 2.5s
      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch('/api/phone-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check', phone: clean })
          });
          const pollData = await pollRes.json();
          if (pollData.verified === true) {
            handleFinalSuccess(clean);
          }
        } catch (_) {}
      }, 2500);

    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start phone verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Instant 1-Click Verification Fallback
   */
  const handleInstantVerify = async () => {
    const clean = normalizePhone(phoneNumber);
    if (!isValidNigerianPhone(clean)) {
      setErrorMessage('Please enter a valid 11-digit Nigerian phone number first.');
      return;
    }

    setIsInstantVerifying(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'instant_verify', phone: clean })
      });
      const data = await res.json();
      if (data.success && data.verified) {
        await handleFinalSuccess(clean);
      } else {
        throw new Error(data.error || 'Instant verification failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify instantly. Please use WhatsApp.');
    } finally {
      setIsInstantVerifying(false);
    }
  };

  /**
   * Manual verification code submit
   */
  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setManualCodeError('Please enter the verification code.');
      return;
    }
    const clean = normalizePhone(challenge?.phone || phoneNumber);
    setIsLoading(true);
    setManualCodeError('');
    try {
      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone: clean,
          code: manualCode.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.verified) {
        await handleFinalSuccess(clean);
      } else {
        setManualCodeError(data.error || 'Invalid verification code.');
      }
    } catch (err: any) {
      setManualCodeError(err.message || 'Failed to verify code.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (challenge?.code) {
      navigator.clipboard.writeText(challenge.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= STEP 1: INPUT PHONE ================= */}
        {step === 'input' && (
          <form onSubmit={handleStartVerification} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0EFFF] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Update Phone Number</h3>
                <p className="text-xs text-slate-500">
                  Enter your number to receive automated order updates & receipts.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Nigerian Mobile Number</label>
                {detectedNetwork && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-[#4F46E5]">
                    {detectedNetwork.name}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-xs font-bold text-slate-400">
                  <span>🇳🇬</span>
                  <span>+234</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0801 234 5678"
                  autoFocus
                  className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Supported: MTN, Airtel, GLO, and 9mobile (11 digits)
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Verification...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Verify via WhatsApp (Free)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleInstantVerify}
                disabled={isInstantVerifying}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isInstantVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Verifying Instantly...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant Verify (One-Click)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: VERIFYING VIA WHATSAPP ================= */}
        {step === 'verifying' && challenge && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Verify via WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Number to verify:{' '}
                <span className="font-bold text-slate-800 font-mono">{challenge.phone}</span>
              </p>
            </div>

            {/* WhatsApp Deep Link Button */}
            <a
              href={challenge.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 text-center cursor-pointer group"
            >
              <MessageCircle className="w-5 h-5 fill-white shrink-0 group-hover:scale-110 transition-transform" />
              <span>Open WhatsApp to Send Code</span>
            </a>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Your Verification Code:</span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center font-mono font-black text-slate-900 text-lg tracking-wider">
                {challenge.code}
              </div>
              <p className="text-[10.5px] text-slate-500 text-center">
                Send this code from your WhatsApp account. We will detect it instantly.
              </p>
            </div>

            {/* Live listening pulse */}
            <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Waiting for your WhatsApp message...</span>
            </div>

            {/* Manual Code Input Form */}
            <form onSubmit={handleManualCodeSubmit} className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-600">Or enter code manually:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VERIFY-1234"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono uppercase focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                </button>
              </div>
              {manualCodeError && (
                <p className="text-[11px] text-red-600 font-medium">{manualCodeError}</p>
              )}
            </form>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                ← Change Number
              </button>

              <button
                type="button"
                onClick={handleInstantVerify}
                disabled={isInstantVerifying}
                className="text-xs font-bold text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
              >
                {isInstantVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                <span>Verify Instantly</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS ================= */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Phone Number Verified! 🎉</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your verified mobile number has been saved to your profile and order delivery services.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
