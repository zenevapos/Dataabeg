'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Menu,
  X,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Users,
  Building,
  Mail,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  Plus,
  Phone,
  Clock,
  Tv,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Smartphone,
  Send,
  Wallet,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { detectNetworkFromPhone } from '@/lib/utils';
import { NETWORKS } from '@/lib/constants';
import { ScrollDeck, DeckCard } from '@/components/ScrollDeck';
import { IconFolder } from '@/components/IconFolder';
import { SplitFooter } from '@/components/SplitFooter';
import { GooglePlayBadge, PLAY_STORE_URL } from '@/components/GooglePlayBadge';

export default function HomePage() {
  const router = useRouter();
  // Navigation Mega-menu active dropdown
  const [activeDropdown, setActiveDropdown] = useState<'services' | 'pricing' | 'ussd' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion state (first one open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Hero Simulator state
  const [simPhone, setSimPhone] = useState('0803 123 4567');
  const [simPlan, setSimPlan] = useState('mtn-1gb');
  const [copiedRef, setCopiedRef] = useState(false);

  // Auto detect network for demo simulator
  const detectedNet = detectNetworkFromPhone(simPhone) || NETWORKS[0];

  const deckCards: DeckCard[] = [
    {
      name: 'MTN SME',
      caption: 'from ₦290 / 1GB',
      icon: <Smartphone />,
      colors: ['#eab308', '#a16207'],
    },
    {
      name: 'Airtel CG',
      caption: '30-day data',
      icon: <Zap />,
      colors: ['#ef4444', '#991b1b'],
    },
    {
      name: 'Glo Mega',
      caption: 'instant cg',
      icon: <Globe />,
      colors: ['#10b981', '#065f46'],
    },
    {
      name: '9mobile',
      caption: 'fast 4g/5g',
      icon: <Database />,
      colors: ['#65a30d', '#365314'],
    },
    {
      name: 'Electricity',
      caption: 'meter tokens',
      icon: <Zap />,
      colors: ['#f97316', '#9a3412'],
    },
    {
      name: 'Cable TV',
      caption: 'dstv & gotv',
      icon: <Tv />,
      colors: ['#6366f1', '#312e81'],
    },
    {
      name: 'Wallet',
      caption: 'bank & opay',
      icon: <Wallet />,
      colors: ['#2563eb', '#1e3a8a'],
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCopyRef = () => {
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const faqs = [
    {
      q: 'What is DataAbeg and how is the data so cheap?',
      a: 'DataAbeg purchases SME and Corporate Gifting (CG) data bundles directly from telecom operators in massive wholesale volumes. This allows us to pass true wholesale discounts to you — offering 1GB for as low as ₦290 instead of the standard ₦1,000 retail bank rate.'
    },
    {
      q: 'How fast is the data delivery?',
      a: 'Data delivery is 100% automated and powered by direct telecom SIM server queues. Once payment or wallet deduction is confirmed, data arrives on your phone within 3 to 5 seconds.'
    },
    {
      q: 'What is the validity period of the data bundles?',
      a: 'All our SME and Corporate Gifting bundles on MTN, Airtel, Glo, and 9mobile come with a full 30-day validity period. You will never be caught in 1-day or 2-day expiry traps.'
    },
    {
      q: 'How do I check my data balance on my SIM card?',
      a: 'You can check your balance anytime by dialing: MTN: *323*4# or *461*4# | Airtel: *323# or *140# | Glo: *323# or *127*0# | 9mobile: *323# or *228#.'
    },
    {
      q: 'How do I fund my wallet without charges?',
      a: 'Every registered DataAbeg account receives dedicated automated virtual bank accounts (MoMo PSB and SmartCash PSB). Any bank transfer you make to your dedicated account funds your DataAbeg wallet instantly with 0% hidden fees.'
    },
    {
      q: 'Can I recharge electricity tokens and renew Cable TV on DataAbeg?',
      a: 'Yes! DataAbeg includes a multi-utility hub where you can recharge prepaid and postpaid electricity meter tokens (IKEDC, EKEDC, AEDC, IBEDC, etc.) with instant meter name verification, as well as renew DStv, GOtv, and StarTimes decoder packages.'
    },
    {
      q: 'Can I start a data reselling business with DataAbeg?',
      a: 'Absolutely. Thousands of students and entrepreneurs use DataAbeg to buy data at wholesale ₦290/GB and resell to coursemates and customers at ₦350 - ₦400/GB, pocketing daily profits effortlessly.'
    },
    {
      q: 'What networks and payment options are supported?',
      a: 'We support all major Nigerian networks: MTN, Airtel, Glo, and 9mobile. Payments can be completed using your DataAbeg wallet, direct bank transfer to Moniepoint/OPay, or automated virtual account numbers.'
    },
    {
      q: 'What should I do if a transaction delays or fails?',
      a: 'Our platform maintains a 99.8% delivery rate. In the rare event of telco network downtime, our system automatically retries or refunds your wallet immediately. You can also contact our 24/7 live WhatsApp support at 08154276838.'
    },
    {
      q: 'Does DataAbeg provide a developer API for integration?',
      a: 'Yes. We offer high-speed, well-documented REST APIs for developers and fintech applications looking to vend Nigerian mobile data, airtime, and utility tokens programmatically.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1e2022] font-jakarta selection:bg-[#1E40AF] selection:text-white antialiased overflow-x-clip">
      {/* =========================================================================
          1. NAVIGATION (FLOATING GLASS HEADER)
      ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-3 bg-transparent transition-all">
        <div className="max-w-[1440px] mx-auto">
          <nav className="relative flex items-center justify-between h-[64px] px-5 sm:px-6 bg-white/80 backdrop-blur-md rounded-2xl border border-[rgba(15,27,45,0.06)] shadow-[0_1px_2px_rgba(15,27,45,0.04),0_8px_24px_-12px_rgba(15,27,45,0.14)]">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
                <div className="w-9 h-9 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-black shadow-md shadow-blue-900/25">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-space">
                  Data<span className="text-[#1E40AF]">Abeg</span>
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1">
                {/* Services Mega Menu Trigger */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('services')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeDropdown === 'services' ? 'text-[#1E40AF] bg-blue-50/60' : 'text-[#1e2022] hover:text-[#1E40AF]'
                    }`}
                  >
                    <span>Services</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'services' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mega Menu Dropdown */}
                  {activeDropdown === 'services' && (
                    <div className="absolute top-full left-0 pt-2 w-[780px] -translate-x-12 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl grid grid-cols-3 gap-6">
                        {/* Column 1: Mobile Data */}
                        <div className="space-y-3">
                          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Data</span>
                          <Link href="#services" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-amber-200 transition-colors">
                              <Smartphone className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                MTN SME Data
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">1GB from ₦290 with 30-day validity</p>
                            </div>
                          </Link>
                          <Link href="#services" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-red-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-red-200 transition-colors">
                              <Smartphone className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                Airtel Corporate Gifting
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">1GB from ₦295 nationwide 4G/5G</p>
                            </div>
                          </Link>
                          <Link href="#services" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-emerald-200 transition-colors">
                              <Smartphone className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                Glo Mega Bundles
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">1GB from ₦285 for heavy streaming</p>
                            </div>
                          </Link>
                        </div>

                        {/* Column 2: Bills & Utilities */}
                        <div className="space-y-3">
                          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Utilities & Bills</span>
                          <Link href="#services" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-amber-200 transition-colors">
                              <Zap className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                Electricity Tokens
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">Instant tokens for Ikeja, Eko, Abuja, etc.</p>
                            </div>
                          </Link>
                          <Link href="#services" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-indigo-200 transition-colors">
                              <Tv className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                Cable TV Renewal
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">DStv, GOtv, StarTimes instant bouquet</p>
                            </div>
                          </Link>
                        </div>

                        {/* Column 3: Resellers & Wallet */}
                        <div className="space-y-3">
                          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider block">Fintech & Reselling</span>
                          <Link href="/dashboard/wallet" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-blue-200 transition-colors">
                              <Wallet className="w-5 h-5 text-[#1E40AF]" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                0% Fee Virtual Account
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">Auto-funding via MoMo & SmartCash</p>
                            </div>
                          </Link>
                          <Link href="/dashboard/api-docs" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBF5FF] transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 border border-slate-200 transition-colors">
                              <Database className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-[#1E40AF] flex items-center gap-1">
                                Reseller VTU API
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-slate-500 leading-snug mt-0.5">High-speed endpoints for app developers</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Networks & Pricing Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('pricing')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeDropdown === 'pricing' ? 'text-[#1E40AF] bg-blue-50/60' : 'text-[#1e2022] hover:text-[#1E40AF]'
                    }`}
                  >
                    <span>Wholesale Prices</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'pricing' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'pricing' && (
                    <div className="absolute top-full left-0 pt-2 w-[480px] -translate-x-12 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xl grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                          <span className="text-xs font-bold text-amber-700 uppercase">MTN Nigeria</span>
                          <p className="text-lg font-extrabold text-slate-900 mt-1">₦290 <span className="text-xs font-normal text-slate-500">/ 1GB SME</span></p>
                          <span className="text-[11px] text-emerald-600 font-semibold">Save 71% vs Banks</span>
                        </div>
                        <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/60">
                          <span className="text-xs font-bold text-red-700 uppercase">Airtel Nigeria</span>
                          <p className="text-lg font-extrabold text-slate-900 mt-1">₦295 <span className="text-xs font-normal text-slate-500">/ 1GB CG</span></p>
                          <span className="text-[11px] text-emerald-600 font-semibold">30-day validity</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                          <span className="text-xs font-bold text-emerald-700 uppercase">Glo Nigeria</span>
                          <p className="text-lg font-extrabold text-slate-900 mt-1">₦285 <span className="text-xs font-normal text-slate-500">/ 1GB CG</span></p>
                          <span className="text-[11px] text-emerald-600 font-semibold">Instant credit</span>
                        </div>
                        <div className="p-3 rounded-xl bg-lime-50/60 border border-lime-200/60">
                          <span className="text-xs font-bold text-lime-800 uppercase">9mobile</span>
                          <p className="text-lg font-extrabold text-slate-900 mt-1">₦260 <span className="text-xs font-normal text-slate-500">/ 1GB SME</span></p>
                          <span className="text-[11px] text-emerald-600 font-semibold">Fast browsing</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* USSD Check Codes Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('ussd')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeDropdown === 'ussd' ? 'text-[#1E40AF] bg-blue-50/60' : 'text-[#1e2022] hover:text-[#1E40AF]'
                    }`}
                  >
                    <span>USSD Balance Codes</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'ussd' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'ussd' && (
                    <div className="absolute top-full left-0 pt-2 w-[520px] -translate-x-20 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xl grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-700 block">MTN SME & CG Balance</span>
                          <code className="text-sm font-mono font-bold text-[#1E40AF] block mt-1">*323*4# or *461*4#</code>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-700 block">Airtel CG Balance</span>
                          <code className="text-sm font-mono font-bold text-red-600 block mt-1">*323# or *140#</code>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-700 block">Glo Data Balance</span>
                          <code className="text-sm font-mono font-bold text-emerald-600 block mt-1">*323# or *127*0#</code>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-xs font-bold text-slate-700 block">9mobile Data Balance</span>
                          <code className="text-sm font-mono font-bold text-lime-700 block mt-1">*323# or *228#</code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="#faq"
                  className="px-3 py-2 text-sm font-semibold text-[#1e2022] hover:text-[#1E40AF] rounded-lg transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center gap-2.5">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>Get Android App</span>
              </a>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-[#1E40AF] bg-white hover:bg-blue-50/50 border border-[#D0DFFB] rounded-lg transition-all shadow-xs"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-blue-800 rounded-lg shadow-sm transition-all"
              >
                Create Account
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-[#1E40AF] text-[#1E40AF] hover:bg-blue-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <Link href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 rounded-lg">Mobile Data Bundles</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 rounded-lg">Wholesale Pricing</Link>
              <Link href="#ussd" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 rounded-lg">USSD Balance Codes</Link>
              <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50 rounded-lg">FAQ</Link>
            </div>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#1E40AF]" />
                <span>Download on Google Play</span>
              </a>
              <Link href="/login" className="w-full text-center py-2.5 text-sm font-semibold text-[#1E40AF] border border-[#D0DFFB] rounded-lg">Sign in</Link>
              <Link href="/register" className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#1E40AF] rounded-lg">Create Free Account</Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. SCROLL DECK HERO (3D SCRUBBED CARD DECK)
      ========================================================================= */}
      <ScrollDeck
        scroll="page"
        length={2.6}
        theme="light"
        className="pt-16"
        cards={deckCards}
        intro="DataAbeg."
        introNote={
          <div className="flex flex-col items-center gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-xs sm:text-sm font-bold text-slate-900 transition-all"
            >
              <Download className="w-4 h-4 text-[#1E40AF]" />
              <span>Live on Google Play · Download Android App →</span>
            </a>
            <span className="text-xs font-medium text-slate-500">
              Scroll to explore · From ₦290/GB · 5-second delivery
            </span>
          </div>
        }
        headline={['~Cheap~ Nigerian data', '~delivered~ in 5 seconds.']}
        subtitle="Buy MTN, Airtel, Glo & 9mobile 30-day bundles, Airtime, Cable TV, and Electricity from one fast wallet."
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#1E40AF] hover:bg-blue-800 rounded-xl shadow-sm transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all"
            >
              <Wallet className="w-4 h-4 text-[#1E40AF]" />
              <span>Open Dashboard</span>
            </Link>
            <GooglePlayBadge href={PLAY_STORE_URL} />
          </div>
        }
      />

      {/* =========================================================================
          2A. INTERACTIVE LIVE DISPENSER SIMULATOR
      ========================================================================= */}
      <section className="relative overflow-hidden py-14 sm:py-20 bg-gradient-to-b from-[#faf9f7] to-white border-b border-slate-200/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1E40AF] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>Save Up To 71% On Telecom Retail Rates</span>
              </div>
              <h2 className="font-space text-3xl sm:text-4xl lg:text-[46px] font-semibold text-[#0F1B2D] leading-[1.1] tracking-tight">
                Wholesale Mobile Data.<br />
                Instant 5-Sec Delivery.
              </h2>
              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-[540px]">
                Buy MTN, Airtel, Glo &amp; 9mobile 30-day data bundles from ₦290/GB. Pay seamlessly with your wallet, Paystack Bank Transfer, OPay, USSD, or Debit Card.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <GooglePlayBadge href={PLAY_STORE_URL} />
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-blue-800 rounded-xl shadow-sm transition-all"
                >
                  Buy Data Now — From ₦290
                </Link>
              </div>
              <div className="pt-4 flex flex-wrap items-center gap-2.5 font-space text-xs font-bold text-slate-700">
                <span className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 shadow-2xs">MTN SME &amp; CG</span>
                <span className="px-3 py-1.5 rounded-lg bg-red-600 text-white shadow-2xs">Airtel CG</span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs">Glo Mega</span>
                <span className="px-3 py-1.5 rounded-lg bg-lime-600 text-white shadow-2xs">9mobile SME</span>
              </div>
            </div>

            {/* Right Column: High-Fidelity Product UI Mockup / Dispenser Card */}
            <div className="lg:col-span-6 relative">
              {/* Floating ambient glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400/20 to-emerald-400/15 rounded-3xl blur-2xl -z-10 pointer-events-none" />

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,27,45,0.12)] overflow-hidden">
                {/* Mockup Header bar */}
                <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs font-semibold text-slate-500 ml-2">DataAbeg — Automated SIM Queue</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>5-Second Automated Dispatch</span>
                  </div>
                </div>

                {/* Mockup Form / Dispenser Simulator */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Recipient Phone Number
                      </label>
                      <input
                        type="text"
                        value={simPhone}
                        onChange={(e) => setSimPhone(e.target.value)}
                        placeholder="0803 123 4567"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 outline-none focus:border-[#1E40AF] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Select Bundle Plan
                      </label>
                      <select
                        value={simPlan}
                        onChange={(e) => setSimPlan(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50/50 outline-none focus:border-[#1E40AF] focus:bg-white cursor-pointer"
                      >
                        <option value="mtn-1gb">MTN 1.0GB SME (30 Days) — ₦290</option>
                        <option value="mtn-2gb">MTN 2.0GB SME (30 Days) — ₦580</option>
                        <option value="airtel-1gb">Airtel 1.0GB CG (30 Days) — ₦295</option>
                        <option value="glo-1gb">Glo 1.0GB CG (30 Days) — ₦285</option>
                        <option value="9mobile-1gb">9mobile 1.0GB SME (30 Days) — ₦260</option>
                      </select>
                    </div>
                  </div>

                  {/* Verified Top-Up Result Card */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full text-slate-900 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm ${detectedNet.badgeBg}`}>
                          {detectedNet.name}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>Recipient: {simPhone}</span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Delivered in 3.4s
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{detectedNet.displayName} 4G/5G Network Route</p>
                        </div>
                      </div>

                      <button
                        onClick={handleCopyRef}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Copy Transaction Reference"
                      >
                        {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Price Comparison / Savings Pill */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 text-slate-800 font-mono font-medium">
                        <Zap className="w-4 h-4 text-[#1E40AF] shrink-0" />
                        <span>DataAbeg: <strong>₦290</strong></span>
                        <span className="text-slate-400 line-through text-[11px]">Bank: ₦1,000</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        You Saved ₦710 (71%)
                      </span>
                    </div>

                    {/* Meta info strip */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
                      <div>
                        <span className="block text-slate-400 font-medium">Plan Validity</span>
                        <strong className="text-slate-800">30 Full Days</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">SIM Server</span>
                        <strong className="text-slate-800">Online / Instant</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Balance Check</span>
                        <strong className="text-slate-800">{detectedNet.ussdCheckCode.split(' ')[0]}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions in Mockup */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Instant recharge with receipt generation
                    </span>
                    <Link
                      href="/register"
                      className="px-3.5 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-blue-800 transition-colors"
                    >
                      <span>Create Account & Dispense</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      
      {/* =========================================================================
          2B. QUICK SERVICES HUB (FRONT & CENTER FOR ALL USERS)
      ========================================================================= */}
      <section id="services-hub" className="relative z-20 py-12 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-space">
                  Choose a Service
                </h2>
                <span className="text-[10px] font-bold text-[#1E40AF] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
                  Instant Dispense
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap any telecom or utility service to proceed directly
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E40AF] hover:underline"
            >
              <span>Go to Full Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Buy Data */}
            <Link
              href="/dashboard/data"
              className="group p-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white hover:from-blue-50 hover:to-blue-100/40 border border-blue-200/80 hover:border-[#1E40AF] hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1E40AF] text-white flex items-center justify-center mb-2.5 shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1E40AF]">Buy Data</span>
              <span className="text-[11px] text-slate-500 mt-0.5">MTN, Airtel, Glo, 9mobile</span>
              <span className="mt-2 text-[10px] font-bold text-[#1E40AF] bg-blue-100/60 px-2 py-0.5 rounded-md">From ₦260</span>
            </Link>

            {/* 2. Buy Airtime */}
            <Link
              href="/dashboard/airtime"
              className="group p-4 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white hover:from-emerald-50 hover:to-emerald-100/40 border border-emerald-200/80 hover:border-emerald-600 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700">Buy Airtime</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Instant Top-up</span>
              <span className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">2% Bonus</span>
            </Link>

            {/* 3. Cable TV */}
            <Link
              href="/dashboard/cable"
              className="group p-4 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white hover:from-indigo-50 hover:to-indigo-100/40 border border-indigo-200/80 hover:border-indigo-600 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Tv className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-700">Cable TV</span>
              <span className="text-[11px] text-slate-500 mt-0.5">DStv, GOtv, StarTimes</span>
              <span className="mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">Instant Bouquet</span>
            </Link>

            {/* 4. Electricity */}
            <Link
              href="/dashboard/electricity"
              className="group p-4 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white hover:from-amber-50 hover:to-amber-100/40 border border-amber-200/80 hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-700">Electricity</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Prepaid Meter Tokens</span>
              <span className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">Token SMS/Copy</span>
            </Link>

            {/* 5. Fund Wallet */}
            <Link
              href="/dashboard/wallet"
              className="group p-4 rounded-2xl bg-gradient-to-b from-purple-50/50 to-white hover:from-purple-50 hover:to-purple-100/40 border border-purple-200/80 hover:border-purple-600 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700">Fund Wallet</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Automated Accounts</span>
              <span className="mt-2 text-[10px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md">Paystack & Bank</span>
            </Link>

            {/* 6. Bulk Data */}
            <Link
              href="/dashboard/bulk-data"
              className="group p-4 rounded-2xl bg-gradient-to-b from-sky-50/50 to-white hover:from-sky-50 hover:to-sky-100/40 border border-sky-200/80 hover:border-sky-600 hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-sky-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-700">Bulk Data</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Reseller Vending</span>
              <span className="mt-2 text-[10px] font-bold text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md">Batch Dispatch</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2C. INTERACTIVE ICON FOLDER SHOWCASE (DARK GLASS FOLDERS)
      ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#070d1d] text-white border-y border-slate-800/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              All-in-One Utility Suite
            </span>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              Everything you need, neatly packed.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Hover or tap any folder below to inspect every network, utility biller, and instant funding rail inside DataAbeg.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8 justify-items-center">
            <IconFolder
              title="All 4 Networks"
              theme="dark"
              spread={64}
              icons={[
                { src: '/networks/mtn.svg', label: 'MTN SME · ₦290' },
                { src: '/networks/airtel.svg', label: 'Airtel CG · ₦295' },
                { src: '/networks/glo.svg', label: 'Glo Mega · ₦285' },
                { src: '/networks/9mobile.svg', label: '9mobile · ₦260' },
              ]}
            />
            <IconFolder
              title="Bills & Utilities"
              theme="dark"
              spread={64}
              icons={[
                {
                  node: <Zap className="w-10 h-10 text-amber-300" />,
                  background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                  label: 'Electricity Tokens',
                },
                {
                  node: <Tv className="w-10 h-10 text-indigo-200" />,
                  background: 'linear-gradient(135deg, #6366f1, #3730a3)',
                  label: 'DStv · GOtv · StarTimes',
                },
                {
                  node: <Send className="w-10 h-10 text-emerald-200" />,
                  background: 'linear-gradient(135deg, #10b981, #065f46)',
                  label: 'Airtime 2% Bonus',
                },
                {
                  node: <Users className="w-10 h-10 text-sky-200" />,
                  background: 'linear-gradient(135deg, #0284c7, #075985)',
                  label: 'Bulk Reseller Dispatch',
                },
              ]}
            />
            <IconFolder
              title="Instant Funding"
              theme="dark"
              spread={64}
              icons={[
                {
                  node: <Building className="w-10 h-10 text-blue-200" />,
                  background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
                  label: 'Bank Transfer',
                },
                {
                  node: <Smartphone className="w-10 h-10 text-emerald-200" />,
                  background: 'linear-gradient(135deg, #059669, #064e3b)',
                  label: 'Pay with OPay',
                },
                {
                  node: <Wallet className="w-10 h-10 text-violet-200" />,
                  background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                  label: 'DataAbeg Wallet Pass',
                },
                {
                  node: <ShieldCheck className="w-10 h-10 text-cyan-200" />,
                  background: 'linear-gradient(135deg, #0891b2, #164e63)',
                  label: 'Auto-Refund Protection',
                },
              ]}
            />
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GooglePlayBadge href={PLAY_STORE_URL} variant="light" />
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-bold text-white transition-all"
            >
              Explore Web Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STATS SECTION (Engineered for speed. Built for maximum savings.)
      ========================================================================= */}
      <section className="py-12 sm:py-16 border-y border-[rgba(15,27,45,0.06)] bg-[#faf9f7]/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-space text-2xl sm:text-3xl font-semibold text-[#0F1B2D] text-center mb-10 sm:mb-14">
            Engineered for speed. Built for maximum savings.
          </h2>

          <div className="bg-white rounded-2xl border border-[rgba(15,27,45,0.08)] shadow-xs p-6 sm:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="text-center pt-4 sm:pt-0">
                <p className="font-space text-4xl sm:text-5xl font-bold text-[#1E40AF] tracking-tight">₦290</p>
                <p className="text-xs sm:text-sm font-medium text-[#475569] mt-2">MTN 1GB Wholesale SME Price</p>
              </div>
              <div className="text-center pt-4 sm:pt-0 sm:pl-6">
                <p className="font-space text-4xl sm:text-5xl font-bold text-[#0F1B2D] tracking-tight">3.2s</p>
                <p className="text-xs sm:text-sm font-medium text-[#475569] mt-2">Average delivery dispatch speed</p>
              </div>
              <div className="text-center pt-4 sm:pt-0 sm:pl-6">
                <p className="font-space text-4xl sm:text-5xl font-bold text-[#0F1B2D] tracking-tight text-emerald-600">99.8%</p>
                <p className="text-xs sm:text-sm font-medium text-[#475569] mt-2">Automated success rate</p>
              </div>
              <div className="text-center pt-4 sm:pt-0 sm:pl-6">
                <p className="font-space text-4xl sm:text-5xl font-bold text-[#0F1B2D] tracking-tight">50,000+</p>
                <p className="text-xs sm:text-sm font-medium text-[#475569] mt-2">Happy customers & resellers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. TESTIMONIALS SECTION (Loved by students, remote workers...)
      ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-space text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F1B2D] text-center mb-12 sm:mb-16">
            Loved by students, remote workers, and data resellers.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0.5l2.35 4.76 5.25 0.77-3.8 3.7 0.9 5.24L8 12.4l-4.7 2.57 0.9-5.24-3.8-3.7 5.25-0.77Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#1e2022] leading-relaxed">
                  "DataAbeg has saved me over ₦15,000 every single month on data subscriptions. MTN 1GB for just ₦290 delivers in literally 3 seconds. I do not buy data from banks anymore."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1E40AF] font-bold text-sm flex items-center justify-center shrink-0">
                  TA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tunde Adebayo</h4>
                  <p className="text-xs text-slate-500">Freelance Software Engineer, Lagos</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0.5l2.35 4.76 5.25 0.77-3.8 3.7 0.9 5.24L8 12.4l-4.7 2.57 0.9-5.24-3.8-3.7 5.25-0.77Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#1e2022] leading-relaxed">
                  "As a university student attending online classes, cheap data is absolute survival. 5GB lasts me all month without expiring in 2 days like normal telecom daily plans."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                  AB
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Amina Bello</h4>
                  <p className="text-xs text-slate-500">University Student, Unilorin</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0.5l2.35 4.76 5.25 0.77-3.8 3.7 0.9 5.24L8 12.4l-4.7 2.57 0.9-5.24-3.8-3.7 5.25-0.77Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#1e2022] leading-relaxed">
                  "I resell data to my coursemates and office colleagues. The automated wallet funding with MoMo virtual accounts is instant, and customer care on WhatsApp is always active."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center shrink-0">
                  EO
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Emeka Okonkwo</h4>
                  <p className="text-xs text-slate-500">Data Reseller & Marketer, Abuja</p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0.5l2.35 4.76 5.25 0.77-3.8 3.7 0.9 5.24L8 12.4l-4.7 2.57 0.9-5.24-3.8-3.7 5.25-0.77Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#1e2022] leading-relaxed">
                  "I recharged my prepaid meter token at 11 PM and got the token immediately on my screen. Electricity and cable TV subscriptions are so smooth and effortless on DataAbeg."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold text-sm flex items-center justify-center shrink-0">
                  FO
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Folake Olawale</h4>
                  <p className="text-xs text-slate-500">Business Owner, Ibadan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregated Rating Bar */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-1 text-[#f59e0b]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0.5l2.35 4.76 5.25 0.77-3.8 3.7 0.9 5.24L8 12.4l-4.7 2.57 0.9-5.24-3.8-3.7 5.25-0.77Z" />
                </svg>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#475569]">
              <strong className="text-slate-900 font-bold text-base">4.9</strong>
              <span>average rating across 12,000+ customer top-ups in Nigeria.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FAQ SECTION (Frequently asked questions)
      ========================================================================= */}
      <section id="faq" className="py-16 sm:py-24 bg-[#faf9f7]/50 border-t border-slate-200/70">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-space text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F1B2D] text-center mb-10 sm:mb-14">
            Frequently asked questions about DataAbeg
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="font-space text-base sm:text-lg font-medium text-slate-900">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 p-1 rounded-full text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1E40AF]' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-slate-500 mt-10">
            Have more questions? Chat with our customer support on{' '}
            <a
              href="https://wa.me/2348154276838?text=Hello%20DataAbeg%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E40AF] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 inline" />
              WhatsApp (08154276838)
            </a>
            .
          </p>
        </div>
      </section>

      {/* =========================================================================
          6. FINAL CTA BANNER (Start saving on data today)
      ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 text-center overflow-hidden border border-slate-200/80 bg-gradient-to-b from-[#f8faff] via-white to-[#f0f6ff]">
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 bg-radial from-blue-100/50 via-transparent to-transparent -z-10 pointer-events-none" />

            <div className="max-w-[680px] mx-auto space-y-4">
              <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F1B2D] tracking-tight">
                Start saving up to 71% on mobile data today
              </h2>
              <p className="text-base sm:text-lg text-[#475569]">
                Instant automated delivery in 5 seconds. Zero hidden fees. Dedicated virtual accounts.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <GooglePlayBadge href={PLAY_STORE_URL} />
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#1E40AF] hover:bg-blue-800 rounded-xl shadow-sm transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-[#1a1a1a] bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all"
                >
                  Log In to Dashboard
                </Link>
              </div>

              {/* Stars badge */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="flex items-center gap-0.5 text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0.5l2.35 4.76 5.25 0.77-3.8 3.7 0.9 5.24L8 12.4l-4.7 2.57 0.9-5.24-3.8-3.7 5.25-0.77Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  4.9 rating · Over 50,000 active users nationwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. SPLIT FOOTER
      ========================================================================= */}
      <SplitFooter
        brand="DataAbeg"
        tagline={['Cheap data.', '5-second delivery.']}
        panel="#071029"
        accent="#2563eb"
        palette={['#1e3a8a', '#3b82f6', '#dbeafe']}
        socials={[
          { label: 'DataAbeg on X', href: 'https://x.com', icon: 'x' },
        ]}
        groups={[
          {
            title: 'Services',
            links: [
              { label: 'Buy Data', href: '/dashboard/data' },
              { label: 'Buy Airtime', href: '/dashboard/airtime' },
              { label: 'Electricity', href: '/dashboard/electricity' },
              { label: 'Cable TV', href: '/dashboard/cable' },
              { label: 'Bulk Vending', href: '/dashboard/bulk-data' },
            ],
          },
          {
            title: 'Download & Account',
            links: [
              { label: 'Google Play App', href: PLAY_STORE_URL },
              { label: 'User Dashboard', href: '/dashboard' },
              { label: 'Fund Wallet', href: '/dashboard/wallet' },
              { label: 'Create Account', href: '/register' },
              { label: 'Sign In', href: '/login' },
            ],
          },
          {
            title: 'Legal & Support',
            links: [
              { label: 'WhatsApp Support', href: 'https://wa.me/2348154276838' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Delete Account', href: '/delete-account' },
              { label: 'Merchant Admin', href: '/admin-salam' },
            ],
          },
        ]}
      />
    </div>
  );
}
