'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { formatCurrency, generateTxReference } from '@/lib/utils';
import { saveOrderToFirestore, getAdminSettings, AdminSettings, DEFAULT_ADMIN_SETTINGS } from '@/lib/firebaseDb';
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'wallet'>('wallet');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  useEffect(() => {
    if (isOpen) {
      getAdminSettings()
        .then((s) => setAdminSettings(s))
        .catch((err) => console.warn('Admin settings fetch warning:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute checkout amount and titles based on service
  const checkoutAmount =
    serviceType === 'electricity'
      ? electricityDetails?.amount || 0
      : serviceType === 'cable'
      ? cableDetails?.amount || 0
      : plan?.sellingPrice || 0;

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
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep('Authorizing secure transaction verification...');
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
      } else {
        const rawMsg = data.msg || data.data?.msg || data.error || data.message || '';
        let friendlyMsg = rawMsg;
        if (rawMsg.toLowerCase().includes('insufficient') || rawMsg.toLowerCase().includes('wallet')) {
          friendlyMsg = 'Gateway Notice: Insufficient wallet balance on merchant account. Please fund your balance on gladtidingsdata.com to dispense.';
        }
        setErrorMessage(friendlyMsg || 'Transaction could not be processed by gateway. Please verify your details and try again.');
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

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'border-[#1E40AF] bg-blue-50/60 ring-2 ring-[#1E40AF]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-[#1E40AF] mb-1" />
                  <p className="font-bold text-xs">User Wallet</p>
                  <p className="text-[10px] text-slate-500">Instant Debit</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'border-[#1E40AF] bg-blue-50/60 ring-2 ring-[#1E40AF]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-emerald-600 mb-1" />
                  <p className="font-bold text-xs">Bank Transfer</p>
                  <p className="text-[10px] text-slate-500">OPay / Moniepoint</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#1E40AF] bg-blue-50/60 ring-2 ring-[#1E40AF]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-600 mb-1" />
                  <p className="font-bold text-xs">Debit Card</p>
                  <p className="text-[10px] text-slate-500">Paystack / Card</p>
                </button>
              </div>

              {/* Bank Transfer Instructions */}
              {paymentMethod === 'transfer' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-950 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800">Bank Name:</span>
                    <span className="font-bold">{adminSettings.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800">Account Number:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(adminSettings.accountNumber);
                        setCopiedAccount(true);
                        setTimeout(() => setCopiedAccount(false), 2000);
                      }}
                      className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 hover:bg-amber-100"
                    >
                      {adminSettings.accountNumber}
                      {copiedAccount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800">Account Name:</span>
                    <span className="font-bold">{adminSettings.accountName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
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
                disabled={isProcessing}
                className="flex-2 py-3 px-6 rounded-2xl bg-[#1E40AF] text-white font-bold hover:bg-blue-700 text-sm transition-all shadow-lg shadow-blue-900/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{processingStep || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay {formatCurrency(checkoutAmount)} Now</span>
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
