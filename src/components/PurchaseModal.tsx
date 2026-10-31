'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { formatCurrency, generateTxReference } from '@/lib/utils';
import {
  saveOrderToFirestore,
  getAdminSettings,
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
  debitUserWallet,
  refundUserWallet
} from '@/lib/firebaseDb';
import { useAuth } from '@/context/AuthContext';
import { getPaystackPublicKey } from '@/lib/paystack';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Wallet,
  Zap,
  Building2,
  ShieldCheck,
  Phone,
  RefreshCw,
  Smartphone,
  Tv,
  Receipt
} from 'lucide-react';

export interface ElectricityCheckoutDetails {
  discoId: number;
  discoName: string;
  meterNumber: string;
  meterType: 'Prepaid' | 'Postpaid';
  customerName?: string;
  customerAddress?: string;
  amount: number;
  phone: string;
}

export interface CableCheckoutDetails {
  cableId: number;
  cableName: string;
  cablePlanId: number;
  cablePlanName: string;
  smartCardNumber: string;
  customerName?: string;
  amount: number;
  phone: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: DataPlan | null;
  phoneNumber?: string;
  network?: NetworkInfo | null;
  serviceType?: 'data' | 'airtime' | 'electricity' | 'cable';
  electricityDetails?: ElectricityCheckoutDetails | null;
  cableDetails?: CableCheckoutDetails | null;
  onOrderCompleted?: (tx: Transaction) => void;
  customApiKey?: string;
}

function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).PaystackPop) return resolve(true);
    const existing = document.getElementById('paystack-inline-js');
    if (existing) return resolve(true);
    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PurchaseModal({
  isOpen,
  onClose,
  plan,
  phoneNumber = '',
  network,
  serviceType = 'data',
  electricityDetails,
  cableDetails,
  onOrderCompleted,
  customApiKey
}: PurchaseModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Compute checkout amount and titles based on service
  const checkoutAmount =
    serviceType === 'electricity'
      ? electricityDetails?.amount || 0
      : serviceType === 'cable'
      ? cableDetails?.amount || 0
      : plan?.sellingPrice || 0;

  const userBalance = profile?.walletBalance || 0;
  const hasSufficientWallet = userBalance >= checkoutAmount && checkoutAmount > 0;

  useEffect(() => {
    if (isOpen) {
      getAdminSettings()
        .then((s) => setAdminSettings(s))
        .catch((err) => console.warn('Admin settings fetch warning:', err));

      const balance = profile?.walletBalance || 0;
      if (balance >= checkoutAmount && checkoutAmount > 0) {
        setPaymentMethod('wallet');
      } else {
        setPaymentMethod('card');
      }
    }
  }, [isOpen, checkoutAmount, profile?.walletBalance]);

  if (!isOpen) return null;

  const recipientIdentifier =
    serviceType === 'electricity'
      ? `Meter: ${electricityDetails?.meterNumber}`
      : serviceType === 'cable'
      ? `IUC/SmartCard: ${cableDetails?.smartCardNumber}`
      : phoneNumber;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep('Connecting to Glad Tidings Automated Gateway...');

    const txRef = generateTxReference(
      serviceType === 'electricity'
        ? 'ELEC'
        : serviceType === 'cable'
        ? 'CABL'
        : serviceType === 'airtime'
        ? 'AIR'
        : 'DABG'
    );

    try {
      if (paymentMethod === 'card') {
        setProcessingStep('Connecting to Paystack Secure Checkout...');
        const customerEmail =
          user?.email ||
          (phoneNumber ? `${phoneNumber.replace(/\D/g, '')}@dataabeg.com` : 'customer@dataabeg.com');

        const publicKey = adminSettings.paystackPublicKey || getPaystackPublicKey();

        const metadata = {
          type: 'service_purchase',
          serviceType,
          uid: user?.uid || '',
          userEmail: user?.email || customerEmail,
          amount: checkoutAmount,
          phone: phoneNumber || electricityDetails?.phone || cableDetails?.phone,
          networkId: plan?.networkId || network?.id,
          networkName: network?.displayName || network?.name || electricityDetails?.discoName || cableDetails?.cableName,
          planId: plan?.planId,
          planName:
            serviceType === 'electricity'
              ? `${electricityDetails?.discoName} (${electricityDetails?.meterType})`
              : serviceType === 'cable'
              ? `${cableDetails?.cableName} - ${cableDetails?.cablePlanName}`
              : plan?.name,
          planSize:
            serviceType === 'electricity'
              ? `Meter: ${electricityDetails?.meterNumber}`
              : serviceType === 'cable'
              ? `IUC: ${cableDetails?.smartCardNumber}`
              : plan?.size,
          discoId: electricityDetails?.discoId,
          meterNumber: electricityDetails?.meterNumber,
          meterType: electricityDetails?.meterType,
          customerName: electricityDetails?.customerName || cableDetails?.customerName,
          customerAddress: electricityDetails?.customerAddress,
          cableId: cableDetails?.cableId,
          cablePlanId: cableDetails?.cablePlanId,
          smartCardNumber: cableDetails?.smartCardNumber,
          cableName: cableDetails?.cableName,
          cablePlanName: cableDetails?.cablePlanName
        };

        const handlePaystackSuccess = async (ref: string) => {
          setProcessingStep('Payment approved! Dispensing order...');
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: ref })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.status) {
              setIsSuccess(true);
              const verifiedTx = (verifyData.data || {}) as Transaction;
              if (user) {
                verifiedTx.userId = user.uid;
                verifiedTx.userEmail = user.email || customerEmail;
              }
              setCompletedTx(verifiedTx);
              if (onOrderCompleted) onOrderCompleted(verifiedTx);
              saveOrderToFirestore(verifiedTx);
              try {
                confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
              } catch {}
            } else {
              setErrorMessage(verifyData.message || 'Payment received, but service dispatch is pending confirmation.');
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Network error verifying payment.');
          } finally {
            setIsProcessing(false);
          }
        };

        let popupOpened = false;

        try {
          const hasScript = await loadPaystackScript();
          if (hasScript && (window as any).PaystackPop && typeof (window as any).PaystackPop.setup === 'function') {
            const handler = (window as any).PaystackPop.setup({
              key: publicKey,
              email: customerEmail,
              amount: Math.round(checkoutAmount * 100),
              ref: txRef,
              metadata,
              callback: function (response: { reference: string }) {
                handlePaystackSuccess(response.reference);
              },
              onClose: function () {
                setIsProcessing(false);
              }
            });
            if (handler && typeof handler.openIframe === 'function') {
              handler.openIframe();
              popupOpened = true;
            }
          }
        } catch (popupErr: any) {
          console.warn('Paystack inline popup setup failed, falling back to redirect:', popupErr);
        }

        if (!popupOpened) {
          // Fallback: Initialize on server and redirect to Paystack authorization_url
          const initRes = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: checkoutAmount,
              email: customerEmail,
              reference: txRef,
              metadata,
              callback_url: window.location.href
            })
          });
          const initData = await initRes.json();
          if (initRes.ok && initData.data?.authorization_url) {
            window.location.href = initData.data.authorization_url;
            return;
          } else {
            throw new Error(initData.message || 'Could not launch Paystack checkout.');
          }
        }
        return;
      }

      // User Wallet Payment Method
      if (paymentMethod === 'wallet') {
        if (!user) {
          setErrorMessage('Please login to pay with your DataAbeg wallet, or select Paystack Instant to pay with Card or Transfer.');
          setIsProcessing(false);
          return;
        }

        if (userBalance < checkoutAmount) {
          setErrorMessage(
            `Insufficient wallet balance. You have ₦${userBalance.toLocaleString()} but need ${formatCurrency(checkoutAmount)}. Please switch to Paystack Instant or fund your wallet.`
          );
          setIsProcessing(false);
          return;
        }

        setProcessingStep('Authorizing secure wallet debit...');
        const debitResult = await debitUserWallet(
          user.uid,
          checkoutAmount,
          txRef,
          `${serviceType.toUpperCase()} purchase for ${recipientIdentifier}`
        );

        if (!debitResult.success) {
          setErrorMessage(debitResult.error || 'Failed to debit wallet balance.');
          setIsProcessing(false);
          return;
        }

        await refreshProfile();
      }

      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep('Connecting to Glad Tidings Automated Cloud Gateway...');
      await new Promise((r) => setTimeout(r, 500));

      let endpoint = '/api/smeplug/purchase';
      let payload: Record<string, any> = {};

      if (serviceType === 'electricity' && electricityDetails) {
        setProcessingStep(`Generating token for ${electricityDetails.meterNumber}...`);
        endpoint = '/api/gladtidings/electricity/recharge';
        payload = {
          disco_id: electricityDetails.discoId,
          amount: electricityDetails.amount,
          meter_number: electricityDetails.meterNumber,
          meter_type: electricityDetails.meterType,
          customer_phone: electricityDetails.phone,
          customer_name: electricityDetails.customerName,
          customer_address: electricityDetails.customerAddress,
          customer_reference: txRef
        };
      } else if (serviceType === 'cable' && cableDetails) {
        setProcessingStep(`Renewing ${cableDetails.cableName} subscription...`);
        endpoint = '/api/gladtidings/cable/subscribe';
        payload = {
          cable_id: cableDetails.cableId,
          cable_plan_id: cableDetails.cablePlanId,
          smart_card_number: cableDetails.smartCardNumber,
          customer_reference: txRef
        };
      } else {
        const isAirtime = serviceType === 'airtime' || String(plan?.id).startsWith('airtime-') || plan?.planId === 0;
        endpoint = isAirtime ? '/api/smeplug/airtime' : '/api/smeplug/purchase';

        if (isAirtime) {
          setProcessingStep(`Recharging ${formatCurrency(plan?.retailPrice || 0)} airtime to ${phoneNumber}...`);
          payload = {
            network_id: plan?.networkId || network?.id,
            phone: phoneNumber,
            amount: plan?.retailPrice || plan?.sellingPrice,
            customer_reference: txRef
          };
        } else {
          setProcessingStep(`Dispensing ${plan?.size || 'data'} to ${phoneNumber}...`);
          payload = {
            network_id: plan?.networkId || network?.id,
            plan_id: plan?.planId,
            phone: phoneNumber,
            customer_reference: txRef
          };
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customApiKey) {
        headers['x-gladtidings-key'] = customApiKey;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.status) {
        setIsSuccess(true);
        const generatedToken = data.token || data.data?.token || '';

        const newTx: Transaction = {
          id: txRef,
          reference: txRef,
          userId: user?.uid || '',
          userEmail: user?.email || '',
          smeplugReference: data.data?.reference || data.data?.ident || `GT_${Date.now()}`,
          network: network?.name || electricityDetails?.discoName || cableDetails?.cableName || 'VTU',
          networkName: network?.displayName || electricityDetails?.discoName || cableDetails?.cableName || 'VTU',
          phone: phoneNumber || electricityDetails?.phone || cableDetails?.phone || '',
          phoneNumber: phoneNumber || electricityDetails?.phone || cableDetails?.phone || '',
          planName:
            serviceType === 'electricity'
              ? `${electricityDetails?.discoName} (${electricityDetails?.meterType})`
              : serviceType === 'cable'
              ? `${cableDetails?.cableName} - ${cableDetails?.cablePlanName}`
              : plan?.name || 'Mobile Top-Up',
          planSize:
            serviceType === 'electricity'
              ? `Meter: ${electricityDetails?.meterNumber}`
              : serviceType === 'cable'
              ? `IUC: ${cableDetails?.smartCardNumber}`
              : plan?.size || '',
          amount: checkoutAmount,
          amountPaid: checkoutAmount,
          status: 'successful',
          statusMessage: data.msg || data.data?.msg || 'Transaction completed successfully.',
          paymentMethod: paymentMethod === 'wallet' ? 'WALLET' : paymentMethod === 'transfer' ? 'BANK_TRANSFER' : 'DEBIT_CARD',
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          serviceType,
          meterToken: generatedToken,
          meterNumber: electricityDetails?.meterNumber,
          customerName: electricityDetails?.customerName || cableDetails?.customerName,
          smartCardNumber: cableDetails?.smartCardNumber,
          cableName: cableDetails?.cableName,
          cablePlanName: cableDetails?.cablePlanName
        };

        setCompletedTx(newTx);
        if (onOrderCompleted) {
          onOrderCompleted(newTx);
        }

        // Save order directly to Firestore
        saveOrderToFirestore(newTx);

        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
        // Refresh user profile wallet balance after successful purchase
        if (paymentMethod === 'wallet') {
          refreshProfile().catch(() => {});
        }
      } else {
        // Automatic refund if wallet was debited but gateway failed
        if (paymentMethod === 'wallet' && user) {
          try {
            await refundUserWallet(user.uid, checkoutAmount, txRef, 'Dispense failure auto-refund');
            await refreshProfile();
          } catch (refundErr) {
            console.error('Wallet auto-refund error:', refundErr);
          }
        }

        const raw = data.msg ?? data.data?.msg ?? data.error ?? data.message ?? data.detail ?? '';
        const rawMsg = typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
          ? raw.map((item: any) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item))).join(', ')
          : typeof raw === 'object' && raw !== null
          ? ((raw as any).detail || (raw as any).message || (raw as any).error || (raw as any).msg || JSON.stringify(raw))
          : String(raw || '');

        let friendlyMsg = rawMsg;
        const lowerMsg = rawMsg.toLowerCase();
        if (
          lowerMsg.includes('insufficient') ||
          lowerMsg.includes('wallet') ||
          lowerMsg.includes('balance') ||
          lowerMsg.includes('fund')
        ) {
          friendlyMsg = 'Gateway Notice: Insufficient wallet balance on merchant account. Please fund your balance on gladtidingsdata.com to dispense.';
        }
        setErrorMessage(friendlyMsg || 'Transaction could not be processed by gateway. Please verify your details and try again.');
      }
    } catch (err: unknown) {
      // Automatic refund if wallet was debited but an exception was thrown
      if (paymentMethod === 'wallet' && user) {
        try {
          await refundUserWallet(user.uid, checkoutAmount, txRef, 'Dispense failure exception auto-refund');
          await refreshProfile();
        } catch (refundErr) {
          console.error('Wallet auto-refund error:', refundErr);
        }
      }
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

  const handleCopyToken = () => {
    if (completedTx?.meterToken) {
      navigator.clipboard.writeText(completedTx.meterToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900 overflow-hidden">
        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content State: SUCCESS */}
        {isSuccess && completedTx ? (
          <div className="text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 font-heading">
              {serviceType === 'electricity'
                ? '⚡ Electricity Token Generated!'
                : serviceType === 'cable'
                ? '📺 Cable TV Renewed!'
                : serviceType === 'airtime'
                ? '📞 Airtime Sent Successfully!'
                : 'Data Dispensed Successfully!'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Your transaction for{' '}
              <span className="text-[#1E40AF] font-bold">{recipientIdentifier}</span> has been processed.
            </p>

            {/* If Electricity, display prominent Token Box */}
            {completedTx.meterToken && (
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Your Prepaid Meter Token</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xl sm:text-2xl font-black text-slate-950 tracking-wider">
                    {completedTx.meterToken}
                  </span>
                  <button
                    onClick={handleCopyToken}
                    className="p-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm text-xs"
                  >
                    {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-900/80 mt-1.5">
                  Type this token code on your CIU / Meter Keypad and press Enter (blue button).
                </p>
              </div>
            )}

            {/* Receipt Card */}
            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Transaction Ref:</span>
                <button
                  onClick={handleCopyReference}
                  className="font-mono text-[#1E40AF] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {completedTx.reference}
                  {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {serviceType === 'electricity' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Disco Operator:</span>
                    <span className="font-semibold text-slate-900">{electricityDetails?.discoName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Meter Number:</span>
                    <span className="font-mono font-bold text-slate-900">{electricityDetails?.meterNumber}</span>
                  </div>
                  {electricityDetails?.customerName && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Customer Name:</span>
                      <span className="font-semibold text-slate-900">{electricityDetails.customerName}</span>
                    </div>
                  )}
                </>
              ) : serviceType === 'cable' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Provider:</span>
                    <span className="font-semibold text-slate-900">{cableDetails?.cableName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Package / Bouquet:</span>
                    <span className="font-semibold text-slate-900">{cableDetails?.cablePlanName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">SmartCard Number:</span>
                    <span className="font-mono font-bold text-slate-900">{cableDetails?.smartCardNumber}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mobile Network:</span>
                    <span className="font-semibold text-slate-900">{network?.displayName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Package:</span>
                    <span className="font-semibold text-slate-900">{plan?.name}</span>
                  </div>
                  {plan?.validity && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Validity:</span>
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {plan.validity}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {formatCurrency(checkoutAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-[#1E40AF] text-white font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-900/20"
            >
              Done / Buy Another Service
            </button>
          </div>
        ) : (
          /* Content State: CHECKOUT & PAYMENT SELECTION */
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-blue-50 text-[#1E40AF]">
                {serviceType === 'electricity' ? (
                  <Zap className="w-6 h-6" />
                ) : serviceType === 'cable' ? (
                  <Tv className="w-6 h-6" />
                ) : serviceType === 'airtime' ? (
                  <Phone className="w-6 h-6" />
                ) : (
                  <Smartphone className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading">
                  {serviceType === 'electricity'
                    ? 'Electricity Bill Recharge'
                    : serviceType === 'cable'
                    ? 'Cable TV Subscription'
                    : serviceType === 'airtime'
                    ? 'Airtime Top-Up Checkout'
                    : 'Confirm Data Bundle'}
                </h3>
                <p className="text-xs text-slate-500">Powered by Glad Tidings Automated Cloud Gateway</p>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">
                  {serviceType === 'electricity'
                    ? `${electricityDetails?.discoName} (${electricityDetails?.meterType})`
                    : serviceType === 'cable'
                    ? `${cableDetails?.cableName} - ${cableDetails?.cablePlanName}`
                    : plan?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Destination:</span>
                <span className="font-mono font-bold text-slate-900">{recipientIdentifier}</span>
              </div>
              {serviceType === 'electricity' && electricityDetails?.customerName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Account Name:</span>
                  <span className="font-bold text-slate-900">{electricityDetails.customerName}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-semibold text-sm">Total Amount:</span>
                <span className="font-black text-[#1E40AF] text-base">
                  {formatCurrency(checkoutAmount)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!hasSufficientWallet) {
                      setErrorMessage(
                        `Insufficient wallet balance (₦${userBalance.toLocaleString()}). You need ${formatCurrency(checkoutAmount)}. Please switch to Paystack Instant or top up your wallet.`
                      );
                    } else {
                      setErrorMessage(null);
                    }
                    setPaymentMethod('wallet');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    paymentMethod === 'wallet'
                      ? 'border-[#1E40AF] bg-blue-50/70 ring-2 ring-[#1E40AF]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Wallet className="w-5 h-5 text-[#1E40AF]" />
                    {hasSufficientWallet ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        Low
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-xs text-slate-900">User Wallet</p>
                  <p className="text-[11px] text-slate-500 font-medium font-space">
                    Bal: ₦{userBalance.toLocaleString()}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setPaymentMethod('card');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    paymentMethod === 'card'
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Auto
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900">Paystack Instant</p>
                  <p className="text-[11px] text-slate-500 font-medium">Card, Transfer, USSD, OPay</p>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                disabled={isProcessing || (paymentMethod === 'wallet' && !hasSufficientWallet)}
                className={`flex-2 py-3 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                  paymentMethod === 'card'
                    ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-900/20'
                    : paymentMethod === 'wallet' && !hasSufficientWallet
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none'
                    : 'bg-[#1E40AF] hover:bg-blue-700 text-white shadow-blue-900/20'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{processingStep || 'Processing...'}</span>
                  </>
                ) : paymentMethod === 'wallet' && !hasSufficientWallet ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Insufficient Wallet (Bal: ₦{userBalance.toLocaleString()})</span>
                  </>
                ) : paymentMethod === 'card' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatCurrency(checkoutAmount)} with Paystack</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay {formatCurrency(checkoutAmount)} from Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
