'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  FileText,
  Receipt,
  Home,
  Gift,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  Bell,
  LogOut,
  Edit2,
  MessageCircle,
  User,
  RefreshCw,
  MoreHorizontal,
  ShieldCheck,
  Smartphone,
  Clock
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isAdmin, logout, loading: authLoading } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);
  const [customPhone, setCustomPhone] = useState('');

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const userFullName =
    profile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Imamshaffy Bello');

  const userFirstName = userFullName.split(' ')[0] || 'Tobi';

  const userInitials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'IB';

  const userDisplayPhone =
    profile?.phoneNumber ||
    user?.phoneNumber ||
    customPhone ||
    (user?.email ? user.email.split('@')[0] : '08154276838');

  // Page title resolution based on current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/data')) return 'Payments & Data';
    if (pathname.startsWith('/dashboard/airtime')) return 'Airtime Recharge';
    if (pathname.startsWith('/dashboard/electricity')) return 'Pay Bills';
    if (pathname.startsWith('/dashboard/cable')) return 'Cable TV Renewal';
    if (pathname.startsWith('/dashboard/wallet')) return 'Cards & Accounts';
    if (pathname.startsWith('/dashboard/bulk-data')) return 'Rewards & Bulk';
    if (pathname.startsWith('/dashboard/transactions')) return 'Transactions';
    if (pathname.startsWith('/dashboard/api-docs')) return 'Perks & API';
    return 'Dashboard';
  };

  // Nav Items exactly matching Raenest (Image 1) in label, order, icon & style
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
    { label: 'Cards', href: '/dashboard/wallet', icon: CreditCard },
    { label: 'Payments', href: '/dashboard/data', icon: Wallet, hasChevron: true },
    { label: 'Pay bills', href: '/dashboard/electricity', icon: FileText },
    { label: 'Invoices', href: '/dashboard/transactions', icon: Receipt },
    { label: 'Accounts', href: '/dashboard/wallet', icon: Home },
    { label: 'Rewards', href: '/dashboard/bulk-data', icon: Gift },
    { label: 'Perks', href: '/dashboard/api-docs', icon: Sparkles },
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-[#4f46e5]" />
          <span>Opening your DataAbeg dashboard...</span>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-white text-slate-700">
      <div>
        {/* Brand / Logo Area exactly matching Raenest (Image 1) */}
        <div className="flex items-center gap-2.5 pt-8 pb-8 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            {/* Raenest-style open ring glyph */}
            <svg className="w-7 h-7 text-[#4f46e5] group-hover:scale-105 transition-transform" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3.5C8.201 3.5 3.5 8.201 3.5 14C3.5 19.799 8.201 24.5 14 24.5C19.799 24.5 24.5 19.799 24.5 14C24.5 11.2 23.4 8.65 21.6 6.75"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[22px] font-black tracking-tight text-[#4f46e5] font-heading lowercase">
              dataabeg
            </span>
          </Link>
        </div>

        {/* Raenest-style Navigation Items with airy vertical spacing (Image 1) */}
        <nav className="px-4 space-y-3.5 text-[14px] font-medium">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#F0EFFF] text-[#4F46E5] font-semibold'
                    : 'text-[#64748b] hover:text-slate-900 hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#4F46E5] stroke-[1.8]' : 'text-[#94a3b8] stroke-[1.5]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.hasChevron && (
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-[#94a3b8]'}`} />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin-salam"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-amber-700 bg-amber-50/70 hover:bg-amber-100 transition-colors cursor-pointer text-left font-semibold mt-4"
            >
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-[18px] h-[18px] text-amber-600 shrink-0 stroke-[1.6]" />
                <span>Admin Console</span>
              </div>
            </Link>
          )}
        </nav>
      </div>

      {/* Raenest-style bottom user profile floating capsule matching Image 1 */}
      <div className="p-4 pb-6 mt-auto">
        <div className="bg-[#f8f9fa] border border-[#f1f3f5] rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">
                {userFullName}
              </div>
              <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                Individual
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Account menu"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    setCustomPhone(userDisplayPhone);
                    setIsEditPhoneOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Update Phone</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex font-sans antialiased">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-[240px] bg-white border-r border-[#f1f3f5] flex-shrink-0 flex-col justify-between min-h-screen z-30 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* ================= MOBILE OFF-CANVAS DRAWER ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white flex flex-col justify-between z-10 shadow-2xl h-full border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6 text-[#4f46e5]" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M14 3.5C8.201 3.5 3.5 8.201 3.5 14C3.5 19.799 8.201 24.5 14 24.5C19.799 24.5 24.5 19.799 24.5 14C24.5 11.2 23.4 8.65 21.6 6.75"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xl font-black text-[#4f46e5] lowercase font-heading">dataabeg</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT CANVAS ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Distinction Clean Top Bar */}
        <header className="h-16 bg-white border-b border-[#f1f3f5] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Greeting / Desktop Breadcrumb */}
            <div className="flex items-center gap-2.5">
              <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Hi, {userFirstName}</span>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                {pathname !== '/dashboard' && (
                  <Link
                    href="/dashboard"
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    title="Back to dashboard home"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                )}
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {getPageTitle()}
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Balance capsule, Bell icon, and User profile */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Quick Wallet Balance Pill */}
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
            >
              <span className="text-slate-400 font-normal">Bal:</span>
              <span className="text-[#4f46e5]">₦{(profile?.walletBalance || 0).toLocaleString()}</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#4f46e5] rounded-full"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs space-y-3">
                  <div className="font-bold text-slate-900 flex justify-between items-center">
                    <span>Notifications</span>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                    <div className="font-bold text-indigo-900">Instant Automated VTU Live</div>
                    <div className="text-slate-600 text-[11px]">
                      5-second direct carrier dispense across MTN, Airtel, Glo &amp; 9mobile.
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900">Virtual Bank Accounts</div>
                    <div className="text-slate-600 text-[11px]">
                      Automated 30-sec wallet funding via dedicated Moniepoint &amp; OPay accounts.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Capsule */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-[#f0efff] text-[#4f46e5] font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                  {userInitials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{userFullName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
                  </div>
                  <Link
                    href="/dashboard/wallet"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#4f46e5]" />
                    <span>Wallet (₦{(profile?.walletBalance || 0).toFixed(2)})</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setCustomPhone(userDisplayPhone);
                      setIsEditPhoneOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Update Phone Number</span>
                  </button>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content with mobile-safe padding bottom for bottom bar */}
        <div className="flex-1 pb-24 lg:pb-8">
          {children}
        </div>
      </div>

      {/* ================= NATIVE MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#f1f3f5] px-2 py-2 flex items-center justify-around shadow-xl">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            pathname === '/dashboard' ? 'text-[#4f46e5]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/dashboard/transactions"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            pathname.startsWith('/dashboard/transactions') ? 'text-[#4f46e5]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span>History</span>
        </Link>

        {/* Elevated Center Action: Buy Data */}
        <Link
          href="/dashboard/data"
          className="flex flex-col items-center -mt-5 group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Smartphone className="w-5 h-5 fill-white" />
          </div>
          <span className="text-[10px] font-extrabold text-[#4f46e5] mt-1">Dispense</span>
        </Link>

        <Link
          href="/dashboard/wallet"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            pathname.startsWith('/dashboard/wallet') ? 'text-[#4f46e5]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Cards</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* Floating Action / Support Button (Offset on mobile so it doesn't block the nav) */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30">
        <a
          href="https://wa.me/2348154276838?text=Hello%20DataAbeg%20Support"
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      </div>

      {/* ================= MODAL: EDIT PHONE NUMBER ================= */}
      {isEditPhoneOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Update Your Phone Number</h3>
              <button
                onClick={() => setIsEditPhoneOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Enter your primary mobile number for orders and receipts:
            </p>
            <input
              type="tel"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#4f46e5]"
            />
            <button
              onClick={() => {
                if (customPhone.trim().length >= 10) {
                  localStorage.setItem('dataabeg_phone', customPhone.trim());
                  setIsEditPhoneOpen(false);
                } else {
                  alert('Please enter a valid phone number.');
                }
              }}
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
            >
              Save Phone Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
