import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { DataAbegLogo } from '@/components/DataAbegLogo';

export const metadata = {
  title: 'Privacy Policy | DataAbeg',
  description: 'Privacy Policy and Data Protection standards for DataAbeg users and customers.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <DataAbegLogo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Google Play Compliant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last updated: October 23, 2026 • Effective immediately
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> 1. Overview
            </h2>
            <p>
              Welcome to <strong>DataAbeg</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), accessible via{' '}
              <a href="https://dataabeg.vercel.app" className="text-amber-400 hover:underline">
                https://dataabeg.vercel.app
              </a>{' '}
              and our Android application. DataAbeg is dedicated to providing ultra-affordable mobile data bundles, airtime recharges, electricity token payments, and cable TV subscriptions.
            </p>
            <p>
              This Privacy Policy explains what information we collect, how it is utilized to process your telecom and utility orders, and our strict commitment to safeguarding your privacy under the Nigeria Data Protection Act (NDPA) and Google Play Developer Program Policies.
            </p>
          </section>

          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" /> 2. Information We Collect
            </h2>
            <p>To fulfill automated vending services, we collect minimal and necessary information:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Phone Numbers:</strong> Required to credit mobile data and airtime directly via telecom gateways (MTN, Airtel, Glo, 9mobile).
              </li>
              <li>
                <strong>Account Details:</strong> When you register an account, we store your name, email address, and wallet identifiers via secure Firebase Authentication.
              </li>
              <li>
                <strong>Utility Identifiers:</strong> Electricity meter numbers and Cable TV smartcard (IUC) numbers for bill validation and token issuance.
              </li>
              <li>
                <strong>Transaction History:</strong> Reference codes, purchase amounts, timestamps, and receipt records for order tracking and customer support.
              </li>
            </ul>
          </section>

          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> 3. How We Use & Share Information
            </h2>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data. Your data is used strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>Immediate automated delivery of data bundles, airtime, and utility tokens.</li>
              <li>Maintaining your DataAbeg wallet balance and generating verifiable receipts.</li>
              <li>Resolving customer inquiries via our 24/7 support desk.</li>
            </ul>
            <p>
              Data is transmitted securely to licensed upstream telecom infrastructure providers (such as Glad Tidings Data and SMEPlug) solely to complete the requested digital recharge.
            </p>
          </section>

          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" /> 4. Security & Data Protection
            </h2>
            <p>
              All interactions between your device and our servers use 256-bit Transport Layer Security (TLS 1.3) encryption. Your database records are safeguarded by Cloud Firestore security rules with granular access controls.
            </p>
          </section>

          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" /> 5. User Rights & Account Deletion
            </h2>
            <p>
              You have the right to inspect, update, or request the permanent deletion of your DataAbeg account and associated transaction history. To request complete data erasure, contact us at{' '}
              <a href="mailto:kokoroowoabdulsalam@gmail.com" className="text-amber-400 hover:underline">
                kokoroowoabdulsalam@gmail.com
              </a>{' '}
              or via WhatsApp at{' '}
              <a href="https://wa.me/2348154276838" className="text-amber-400 hover:underline">
                +234 815 427 6838
              </a>
              .
            </p>
          </section>

          <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">6. Contact Us</h2>
            <p>
              For any questions regarding this Privacy Policy or your account data, please reach out to:
            </p>
            <div className="text-slate-300 text-sm space-y-1">
              <div><strong>DataAbeg VTU Ventures</strong></div>
              <div>Email: <a href="mailto:kokoroowoabdulsalam@gmail.com" className="text-amber-400">kokoroowoabdulsalam@gmail.com</a></div>
              <div>Phone / WhatsApp: <a href="tel:08154276838" className="text-amber-400">+234 815 427 6838</a></div>
              <div>Website: <a href="https://dataabeg.vercel.app" className="text-amber-400">https://dataabeg.vercel.app</a></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
