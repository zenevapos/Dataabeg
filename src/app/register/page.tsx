'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL, isAuthorizedAdmin } from '@/lib/firebase';
import {
  Zap,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { isValidNigerianPhone, normalizePhone } from '@/lib/utils';
import { subscribeToVerification } from '@/lib/whatsappVerification';

interface VerificationChallenge {
  phone: string;
  intlPhone: string;
  code: string;
  whatsappUrl: string;
  expiresAt: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signUpWithEmail, loading: authLoading } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WhatsApp Reverse Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [showManualCodeInput, setShowManualCodeInput] = useState(false);
  const [manualCodeError, setManualCodeError] = useState('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const unsubListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (user) {
      if (isAuthorizedAdmin(user.email)) {
        router.push('/admin-salam');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (unsubListenerRef.current) unsubListenerRef.current();
    };
  }, []);

  const handleGoogleSignup = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const loggedIn = await signInWithGoogle();
      if (isAuthorizedAdmin(loggedIn.email)) {
        router.push('/admin-salam');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-up failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Finalize user registration after phone verification succeeds
   */
  const completeRegistration = async () => {
    const cleanPhone = normalizePhone(phone);
    try {
      setIsSubmitting(true);
      const newUser = await signUpWithEmail(email.trim(), password, name.trim(), cleanPhone);
      if (isAuthorizedAdmin(newUser.email)) {
        router.push('/admin-salam');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
      setIsVerified(false);
    }
  };

  /**
   * Initiates the WhatsApp Reverse Verification flow
   */
  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = normalizePhone(phone);
    if (!isValidNigerianPhone(cleanPhone)) {
      setErrorMsg('Please enter a valid 11-digit Nigerian phone number (e.g. 08031234567).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call server API to create verification challenge
      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', phone: cleanPhone })
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
      setShowVerifyModal(true);

      // 2. Set up real-time listener for instant verification detection
      if (unsubListenerRef.current) unsubListenerRef.current();
      unsubListenerRef.current = subscribeToVerification(cleanPhone, () => {
        handleVerificationSuccess();
      });

      // 3. Set up periodic polling fallback (every 2.5 seconds)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        await checkVerificationStatus(cleanPhone);
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start phone verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check verification status via API
   */
  const checkVerificationStatus = async (cleanPhone: string) => {
    try {
      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', phone: cleanPhone })
      });
      const data = await res.json();
      if (data.verified === true) {
        handleVerificationSuccess();
      }
    } catch {
      // Silent catch on background poll
    }
  };

  /**
   * Triggered when verification is confirmed
   */
  const handleVerificationSuccess = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (unsubListenerRef.current) {
      unsubListenerRef.current();
      unsubListenerRef.current = null;
    }

    setIsVerified(true);

    // Auto-proceed to account creation after 800ms celebratory feedback
    setTimeout(() => {
      completeRegistration();
    }, 800);
  };

  /**
   * Manual code verification fallback
   */
  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError('');
    if (!manualCodeInput.trim()) {
      setManualCodeError('Please enter the verification code.');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const cleanPhone = normalizePhone(phone);
      const res = await fetch('/api/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone: cleanPhone,
          code: manualCodeInput.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.verified) {
        handleVerificationSuccess();
      } else {
        setManualCodeError(data.error || 'Invalid code. Please try again or tap Open WhatsApp.');
      }
    } catch (err: any) {
      setManualCodeError(err.message || 'Failed to verify code.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (challenge?.code) {
      navigator.clipboard.writeText(challenge.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-black shadow-md shadow-blue-900/30 transition-transform group-hover:scale-105">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 font-heading">
            Data<span className="text-[#1E40AF]">Abeg</span>
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Create your account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Get dedicated virtual account numbers for 0% fee funding and cheap data dispensing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isSubmitting || authLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium">Or with Email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleInitiateVerification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tunde Adebayo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-emerald-600 font-bold lowercase tracking-normal flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> WhatsApp Verified
                </span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0803 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                You will confirm this number free via WhatsApp in the next step.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#1E40AF] hover:bg-blue-800 shadow-md shadow-blue-900/20 text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preparing Verification...</span>
                </>
              ) : (
                <>
                  <span>Continue to WhatsApp Verification</span>
                  <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1E40AF] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to DataAbeg Storefront
          </Link>
        </div>
      </div>

      {/* WHATSAPP REVERSE VERIFICATION MODAL */}
      {showVerifyModal && challenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            
            {/* Header Badge & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shadow-inner">
                {isVerified ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
                ) : (
                  <svg className="w-8 h-8 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.496 2 2 6.505 2 12.046c0 1.97.57 3.87 1.646 5.503L2.12 22l4.604-1.488a9.98 9.98 0 0 0 5.307 1.534h.004c5.535 0 10.031-4.505 10.031-10.046 0-2.684-1.046-5.207-2.943-7.104A10.004 10.004 0 0 0 12.031 2zm5.836 14.195c-.244.685-1.42 1.309-1.968 1.393-.526.082-1.214.116-3.483-.824-2.898-1.202-4.757-4.148-4.901-4.34-.144-.192-1.173-1.564-1.173-2.983 0-1.418.74-2.116 1.004-2.404.264-.288.577-.36.769-.36.192 0 .385.002.553.01.18.01.421-.068.658.502.245.592.836 2.042.909 2.19.072.148.12.322.024.514-.096.192-.144.312-.288.48-.144.168-.304.375-.434.503-.145.144-.297.3-.127.592.17.291.755 1.246 1.62 2.016 1.113.99 2.051 1.297 2.342 1.441.291.144.462.12.633-.072.17-.192.73-85.922 1.077.192.228.384.348.648.348.264 0 .528-.024.792-.048.264-.024.633-.105.965-.79.332-.685.332-1.272.233-1.416-.098-.144-.36-.228-.745-.42z"/>
                  </svg>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>100% Free WhatsApp Verification</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 font-heading">
                {isVerified ? 'Phone Verified! 🎉' : 'Verify via WhatsApp'}
              </h3>
              
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {isVerified
                  ? 'Your account is being created and funded with your dedicated accounts...'
                  : `Tap the button below to send your free verification code to DataAbeg on WhatsApp.`}
              </p>
            </div>

            {/* Verification Code Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Your Verification Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-black font-mono tracking-widest text-slate-900">
                  {challenge.code}
                </span>
                <button
                  type="button"
                  onClick={copyCodeToClipboard}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Registered Phone: <span className="font-semibold text-slate-700">{challenge.phone}</span>
              </p>
            </div>

            {/* Primary Action Button: Open WhatsApp */}
            {!isVerified && (
              <div className="space-y-3">
                <a
                  href={challenge.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all cursor-pointer group"
                >
                  <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.496 2 2 6.505 2 12.046c0 1.97.57 3.87 1.646 5.503L2.12 22l4.604-1.488a9.98 9.98 0 0 0 5.307 1.534h.004c5.535 0 10.031-4.505 10.031-10.046 0-2.684-1.046-5.207-2.943-7.104A10.004 10.004 0 0 0 12.031 2zm5.836 14.195c-.244.685-1.42 1.309-1.968 1.393-.526.082-1.214.116-3.483-.824-2.898-1.202-4.757-4.148-4.901-4.34-.144-.192-1.173-1.564-1.173-2.983 0-1.418.74-2.116 1.004-2.404.264-.288.577-.36.769-.36.192 0 .385.002.553.01.18.01.421-.068.658.502.245.592.836 2.042.909 2.19.072.148.12.322.024.514-.096.192-.144.312-.288.48-.144.168-.304.375-.434.503-.145.144-.297.3-.127.592.17.291.755 1.246 1.62 2.016 1.113.99 2.051 1.297 2.342 1.441.291.144.462.12.633-.072.17-.192.73-85.922 1.077.192.228.384.348.648.348.264 0 .528-.024.792-.048.264-.024.633-.105.965-.79.332-.685.332-1.272.233-1.416-.098-.144-.36-.228-.745-.42z"/>
                  </svg>
                  <span>Open WhatsApp & Send</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>

                {/* Live pulsing listening state */}
                <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-500">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Waiting for your message... Screen updates instantly!</span>
                </div>
              </div>
            )}

            {/* Success State */}
            {isVerified && (
              <div className="py-4 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-1">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <p className="text-sm font-bold text-emerald-800">Phone Verified Successfully!</p>
                <p className="text-xs text-slate-500">Signing you in and opening your dashboard...</p>
              </div>
            )}

            {/* Fallback & Manual Assistance Options */}
            {!isVerified && (
              <div className="pt-3 border-t border-slate-100 text-center space-y-3">
                <button
                  type="button"
                  onClick={() => checkVerificationStatus(challenge.phone)}
                  className="text-xs font-semibold text-[#1E40AF] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>I sent the message — Check now</span>
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowManualCodeInput(!showManualCodeInput)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showManualCodeInput ? 'Hide manual entry' : 'Can’t open WhatsApp? Confirm with code'}
                  </button>

                  {showManualCodeInput && (
                    <form onSubmit={handleManualVerify} className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualCodeInput}
                          onChange={(e) => setManualCodeInput(e.target.value)}
                          placeholder="e.g. VERIFY-4912"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase bg-slate-50 outline-none focus:bg-white focus:border-[#1E40AF]"
                        />
                        <button
                          type="submit"
                          disabled={isCheckingStatus}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                      {manualCodeError && (
                        <p className="text-[11px] text-rose-600">{manualCodeError}</p>
                      )}
                    </form>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyModal(false);
                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                      if (unsubListenerRef.current) unsubListenerRef.current();
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Edit Phone Number or Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
