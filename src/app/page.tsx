'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { DataPurchaseWidget } from '@/components/DataPurchaseWidget';
import { ShowreelMarquee } from '@/components/ShowreelMarquee';
import { PriceComparisonSection } from '@/components/PriceComparisonSection';
import { USSDGuideSection } from '@/components/USSDGuideSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { PurchaseModal } from '@/components/PurchaseModal';
import { AdminDrawer } from '@/components/AdminDrawer';
import { TrackOrderModal } from '@/components/TrackOrderModal';
import { DataPlan, NetworkInfo, Transaction } from '@/lib/types';
import { CURATED_DATA_PLANS } from '@/lib/constants';

export default function Home() {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const [checkoutPlan, setCheckoutPlan] = useState<DataPlan | null>(null);
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutNetwork, setCheckoutNetwork] = useState<NetworkInfo | null>(null);

  const [apiKey, setApiKey] = useState<string>('');
  const [isSMEPlugConnected, setIsSMEPlugConnected] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load saved API key & past orders from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('dataabeg_smeplug_key');
      if (savedKey) {
        setApiKey(savedKey);
      }

      const savedTx = localStorage.getItem('dataabeg_orders');
      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      }
    } catch {
      // storage unavailable
    }

    // Check server environment configuration status
    fetch('/api/smeplug/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.isConfigured) {
          setIsSMEPlugConnected(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem('dataabeg_smeplug_key', key);
    } catch {
      // ignore
    }
    if (key.trim().length > 5) {
      setIsSMEPlugConnected(true);
    }
  };

  const handleSelectPlanForCheckout = (plan: DataPlan, phone: string, network: NetworkInfo) => {
    setCheckoutPlan(plan);
    setCheckoutPhone(phone);
    setCheckoutNetwork(network);
    setIsPurchaseModalOpen(true);
  };

  const handleOrderCompleted = (newTx: Transaction) => {
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem('dataabeg_orders', JSON.stringify(updated.slice(0, 50)));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const scrollToUSSD = () => {
    const el = document.getElementById('ussd-check-codes');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#1E40AF] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsAdminDrawerOpen(true)}
        onOpenTracker={() => setIsTrackModalOpen(true)}
        onOpenUSSD={scrollToUSSD}
        isSMEPlugConnected={isSMEPlugConnected}
      />

      {/* Hero Section */}
      <HeroSection onLearnMoMo={() => {
        const el = document.getElementById('data-purchase-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* Main Interactive Purchasing Engine */}
      <div className="hero-aura my-4 sm:my-6">
        <DataPurchaseWidget
          onSelectPlanForCheckout={handleSelectPlanForCheckout}
          plans={CURATED_DATA_PLANS}
        />
      </div>

      {/* Fast Live Moving Bundles Marquee */}
      <ShowreelMarquee />

      {/* Commercial Banks vs DataAbeg Price Comparison */}
      <PriceComparisonSection />

      {/* USSD Check Codes Section */}
      <USSDGuideSection />

      {/* Split-Column FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer
        onOpenSettings={() => setIsAdminDrawerOpen(true)}
        onOpenTracker={() => setIsTrackModalOpen(true)}
        onOpenUSSD={scrollToUSSD}
      />

      {/* Purchase & Checkout Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        plan={checkoutPlan}
        phoneNumber={checkoutPhone}
        network={checkoutNetwork}
        onOrderCompleted={handleOrderCompleted}
        customApiKey={apiKey}
      />

      {/* Settings / API Drawer */}
      <AdminDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        transactions={transactions}
      />

      {/* Order Tracker Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        transactions={transactions}
      />
    </main>
  );
}
