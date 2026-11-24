'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Trash2, CheckCircle2, AlertTriangle, Mail, Phone, Info } from 'lucide-react';
import { DataAbegLogo } from '@/components/DataAbegLogo';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('Please acknowledge that account deletion is permanent.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, reason }),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit request. Please contact support directly.');
      }
    } catch (err: any) {
      setError('Network error. Please email your request to belloimam431@gmail.com.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <DataAbegLogo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {/* Title & Badge */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Google Play Policy Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Account &amp; User Data Deletion Request
          </h1>
          <p className="text-sm text-slate-400">
            App: <strong className="text-white">DataAbeg - Cheap Data &amp; Bills</strong> (com.dataabeg.app) • Developer:{' '}
            <strong className="text-white">Bimex Group</strong>
          </p>
        </div>

        {/* Overview Box */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" /> About Account &amp; Data Deletion
          </h2>
          <p>
            In compliance with the <strong>Google Play User Data Account Deletion Requirement</strong> and the Nigeria Data Protection Act (NDPA),{' '}
            <strong>DataAbeg</strong> provided by <strong>Bimex Group</strong> allows users to delete their account and associated personal data both from within the mobile app and through this web portal without needing to reinstall the app.
          </p>
        </section>

        {/* Submission Form */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Deletion Request Received</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your request to delete your account associated with <strong className="text-white">{email}</strong> has been logged. Our administrative team will process your personal data erasure within <strong>48 to 72 hours</strong>.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-400" /> Web-Based Deletion Request Form
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submit your details below to request permanent deletion of your DataAbeg user account.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Reason for Deletion (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Let us know why you wish to delete your account..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <input
                    type="checkbox"
                    id="confirm-delete"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="confirm-delete" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                    I understand that deleting my account permanently erases my profile, phone number, login credentials, and any remaining wallet balance. This action cannot be reversed.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting Request...' : 'Submit Account Deletion Request'}
              </button>
            </form>
          )}
        </section>

        {/* Data Retention & Deletion Policy Details */}
        <section className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What Data is Permanently Deleted
            </h3>
            <p>Upon processing an account deletion request, the following data is permanently erased:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>Your full name, display name, and avatar.</li>
              <li>Your registered email address and primary telephone number.</li>
              <li>Your authentication credentials, password hashes, and Firebase Auth records.</li>
              <li>Your wallet access tokens, saved beneficiaries, and session data.</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> What Data is Retained &amp; Why
            </h3>
            <p>
              In accordance with financial regulatory laws, anti-money laundering (AML) directives, and the Central Bank of Nigeria (CBN) regulations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>Completed Transaction Receipts &amp; Logs:</strong> Records of payment transaction references (Paystack payment IDs, amounts, and dates) and VTU fulfillment confirmation logs are retained for statutory financial reporting and dispute resolution for a period of up to 6 years, after which they are automatically purged.
              </li>
              <li>These archived records are disassociated from active user profiles and are strictly stored for accounting audit compliance.</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm sm:text-base">
              Deletion Timeline &amp; Contact Information
            </h3>
            <p>
              Account deletion requests are processed within <strong>48 to 72 hours</strong>. If you experience any issues or have questions, you may also contact our support team directly:
            </p>
            <div className="space-y-1 text-slate-300">
              <div><strong>Entity:</strong> Bimex Group (Developers of DataAbeg)</div>
              <div>
                <strong>Email:</strong>{' '}
                <a href="mailto:belloimam431@gmail.com" className="text-amber-400 hover:underline">
                  belloimam431@gmail.com
                </a>{' '}
                or{' '}
                <a href="mailto:kokoroowoabdulsalam@gmail.com" className="text-amber-400 hover:underline">
                  kokoroowoabdulsalam@gmail.com
                </a>
              </div>
              <div>
                <strong>WhatsApp Support:</strong>{' '}
                <a href="https://wa.me/2348154276838" className="text-amber-400 hover:underline">
                  +234 815 427 6838
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

