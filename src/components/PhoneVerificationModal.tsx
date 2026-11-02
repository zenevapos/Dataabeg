'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isValidNigerianPhone, normalizePhone, detectNetworkFromPhone } from '@/lib/utils';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhone?: string;
  onSuccess?: (phone: string) => void;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  initialPhone = '',
  onSuccess
}: PhoneVerificationModalProps) {
  const { profile, updateUserPhone, refreshProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, initialPhone, profile?.phoneNumber]);

  if (!isOpen) return null;

  const detectedNetwork = detectNetworkFromPhone(phoneNumber);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const clean = normalizePhone(phoneNumber);
    if (!isValidNigerianPhone(clean)) {
      setErrorMessage('Please enter a valid 11-digit Nigerian phone number (e.g. 08012345678)');
      return;
    }

    setIsLoading(true);
    try {
      await updateUserPhone(clean, true);
      await refreshProfile();
      if (typeof window !== 'undefined') {
        localStorage.setItem('dataabeg_phone', clean);
      }
      setIsSuccess(true);
      if (onSuccess) onSuccess(clean);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Phone Number Updated!</h3>
            <p className="text-xs text-slate-500">Your phone number has been saved successfully.</p>
          </div>
        ) : (
          <>
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Update Phone Number</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your active Nigerian phone number for receipts, transaction alerts, and quick top-ups.
              </p>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0803 123 4567"
                    disabled={isLoading}
                    className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 outline-none focus:bg-white focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                  {detectedNetwork && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      {detectedNetwork.name}
                    </span>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-indigo-700 shadow-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Phone Number</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}