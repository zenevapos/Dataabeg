'use client';

import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS_WITH_PSB = [
  {
    question: 'How fast is mobile data delivery after payment?',
    answer:
      'Data delivery is 100% automated via direct telecom switch APIs and arrives in under 4.8 to 15 seconds directly on the recipient SIM line across MTN, Airtel, Glo, and 9mobile.'
  },
  {
    question: 'How do I pay for my data purchase?',
    answer:
      'DataAbeg supports automated instant bank transfers (to your dedicated wallet account number) as well as debit card payments. Transfers from any Nigerian bank app (GTB, Kuda, OPay, Zenith, Palmpay, Access) are instantly credited with zero hidden deductions.'
  },
  {
    question: 'Why are DataAbeg prices so much cheaper than commercial bank apps?',
    answer:
      'Commercial banking apps sell retail packages with short 1-day or 2-day validity and high markups (up to ₦1,000 for 1GB). DataAbeg pools wholesale Telecom SME and Corporate Gifting quotas directly via Glad Tidings Automated Cloud Gateway, passing bulk savings directly to you with guaranteed 30-day validity.'
  },
  {
    question: 'How do I verify my data balance after buying?',
    answer:
      'For MTN SME dial *323*4# or *461*4#. For Airtel dial *323# or *140#. For Glo dial *323# or *127*0#. For 9mobile dial *323# or *228#. You will also receive an official confirmation SMS directly from your telecom operator.'
  },
  {
    question: 'Do these data bundles work on lines with Do-Not-Disturb (DND)?',
    answer:
      'Yes! We route all data through verified telecom corporate gifting and SME channels that bypass DND filters, ensuring full delivery even on restricted lines.'
  },
  {
    question: 'Can I resell data to my own campus students or WhatsApp clients?',
    answer:
      'Absolutely. Thousands of campus reps and entrepreneurs buy at our ₦290/GB wholesale rate and resell at ₦400 - ₦500/GB, pocketing reliable daily profit. You can also integrate our REST API into your own website or bot.'
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="w-full py-16 sm:py-24 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Title Column */}
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1E40AF] text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Everything you need to know about purchasing, bank funding, 30-day validity, and reseller automation on DataAbeg.
            </p>
          </div>

          {/* Right Accordion Column */}
          <div className="lg:col-span-8 divide-y divide-slate-200 border-t border-b border-slate-200">
            {FAQS_WITH_PSB.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 hover:text-[#1E40AF] transition-colors cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-heading">{faq.question}</span>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[#1E40AF] shrink-0">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-sm text-slate-600 leading-relaxed pr-8 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
