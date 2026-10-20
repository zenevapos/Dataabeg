'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { formatCurrency, generateTxReference } from '@/lib/utils';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Wallet,
  Zap,
  ArrowRight,
  ShieldCheck,
  Phone,
  RefreshCw
} from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DataPlan | null;
  phoneNumber: string;
  network: NetworkInfo | null;
  onOrderCompleted?: (tx: Transaction) => void;
  customApiKey?: string;
}

export function PurchaseModal({
  isOpen,
  onClose,
  plan,
  phoneNumber,
  network,
  onOrderCompleted,
  customApiKey
}: PurchaseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'guest'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  if (!isOpen || !plan || !network) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep('Connecting to SMEPlug VTU Engine...');

    const txRef = generateTxReference('DABG');

    try {
      // Step progress simulated delay for crisp UI feedback
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Authorizing payment and locking wholesale bundle...');
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(`Dispensing ${plan.size} to ${phoneNumber}...`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customApiKey) {
        headers['x-smeplug-key'] = customApiKey;
      }

      const res = await fetch('/api/smeplug/purchase', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          network_id: plan.networkId,
          plan_id: plan.planId,
          phone: phoneNumber,
          customer_reference: txRef
        })
      });

      const data = await res.json();

      if (res.ok && data.status) {
        setIsSuccess(true);
        const newTx: Transaction = {
          id: txRef,
          reference: txRef,
          smeplugReference: data.data?.reference || `SIM_${Date.now()}`,
          network: plan.networkName,
          phone: phoneNumber,
          planName: plan.name,
          planSize: plan.size,
          amount: plan.sellingPrice,
          status: 'successful',
          statusMessage: data.data?.msg || 'Transaction completed successfully.',
          paymentMethod,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };

        setCompletedTx(newTx);
        if (onOrderCompleted) {
          onOrderCompleted(newTx);
        }

        // Trigger joyful confetti blast
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore in environments without canvas
        }
      } else {
        setErrorMessage(data.msg || 'Transaction could not be processed by SMEPlug gateway. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Purchase error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReference = () => {
    if (completedTx) {
      navigator.clipboard.writeText(completedTx.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setErrorMessage(null);
    setCompletedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content State: SUCCESS */}
        {isSuccess && completedTx ? (
          <div className="text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-white">Data Dispensed Successfully!</h3>
            <p className="text-sm text-slate-300 mt-1">
              <span className="text-emerald-400 font-bold">{plan.size}</span> has been credited to{' '}
              <span className="text-white font-mono font-bold">{phoneNumber}</span>.
            </p>

            {/* Receipt Card */}
            <div className="mt-6 rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Transaction Ref:</span>
                <button
                  onClick={handleCopyReference}
                  className="font-mono text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  {completedTx.reference}
                  {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mobile Network:</span>
                <span className="font-semibold text-white">{network.displayName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bundle Package:</span>
                <span className="font-semibold text-white">{plan.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Validity:</span>
                <span className="font-semibold text-amber-400">{plan.validity}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {formatCurrency(plan.sellingPrice)}
                </span>
              </div>
            </div>

            {/* How to check balance callout */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
              <div className="text-left">
                <p className="font-bold">Check Balance on {network.name}:</p>
                <p className="font-mono mt-0.5 text-white">{network.ussdCheckCode}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(network.ussdCheckCode)}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-semibold text-amber-200"
              >
                Copy USSD
              </button>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20"
            >
              Buy Another Bundle
            </button>
          </div>
        ) : (
          /* Content State: ORDER REVIEW & CHECKOUT */
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md"
                style={{ backgroundColor: network.color, color: network.name === 'MTN' ? '#000' : '#fff' }}
              >
                {network.name}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Confirm Data Purchase</h3>
                <p className="text-xs text-slate-400">Instant 5-second automated top-up</p>
              </div>
            </div>

            {/* Order Details Summary */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 mb-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Recipient Phone:</span>
                <span className="font-mono font-bold text-white text-base flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  {phoneNumber}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Data Plan:</span>
                <span className="font-bold text-white">{plan.name}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Validity:</span>
                <span className="font-semibold text-emerald-400">{plan.validity}</span>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800 text-base">
                <span className="font-medium text-slate-300">Total Price:</span>
                <div className="text-right">
                  <span className="font-black text-emerald-400 text-xl">
                    {formatCurrency(plan.sellingPrice)}
                  </span>
                  <span className="ml-2 text-xs text-slate-500 line-through">
                    {formatCurrency(plan.retailPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Card / USSD</p>
                    <p className="text-[10px] text-slate-400">Instant Pay</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Wallet</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">Bal: ₦25,400</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Transaction Failed</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              id="confirm-pay-now-btn"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{processingStep}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>Pay {formatCurrency(plan.sellingPrice)} & Dispense</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Automated VTU engine powered by SMEPlug.ng
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
