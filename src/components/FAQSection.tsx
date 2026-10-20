'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS_WITH_PSB = [
  {
    question: 'How fast is data delivery after payment?',
    answer: 'Data delivery is 100% automated and arrives in under 5 to 15 seconds directly on the recipient SIM line.'
  },
  {
    question: 'Can I pay with MoMo PSB or Smartcash PSB?',
    answer: 'Yes! DataAbeg supports automated payments and virtual account funding through MTN MoMo PSB (Bank Code 671) and Airtel Smartcash PSB. Transfers from any Nigerian bank app, USSD, or mobile money wallet are credited instantly.'
  },
  {
    question: 'Why are DataAbeg data prices so much cheaper than my bank or PalmPay?',
    answer: 'Banks and fintech apps sell official retail packages with short 1-day or 2-day validity and high markups. DataAbeg leverages wholesale Telecom SME and Corporate Gifting pools via SMEPlug, delivering full 30-day validity at rock-bottom bulk rates.'
  },
  {
    question: 'How do I check my data balance after buying?',
    answer: 'For MTN SME dial *323*4# or *461*4#. For Airtel dial *323# or *140#. For Glo dial *323# or *127*0#. For 9mobile dial *323# or *228#. You will also receive an instant confirmation SMS directly from your telecom operator.'
  },
  {
    question: 'Can I resell data to my own friends and customers using DataAbeg?',
    answer: 'Yes! Anyone can resell data by buying at our ultra-cheap wholesale rates and charging their own customers whatever price they choose.'
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-sky-300 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Got Questions? We&apos;ve Got Answers.
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Everything you need to know about purchasing, MoMo/Smartcash PSB, and reselling data on DataAbeg.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS_WITH_PSB.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-sky-400 transition-colors"
              >
                <span className="text-sm sm:text-base">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-sky-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
