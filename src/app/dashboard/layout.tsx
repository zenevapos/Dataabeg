'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DataAbegLogo } from '@/components/DataAbegLogo';
import {
  LayoutDashboard,
  Smartphone,
  PhoneCall,
  Zap,
  Tv,
  Wallet,
  Grid,
  Clock,
  Code,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Edit2,
  MessageCircle,
  User,
  RefreshCw
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
    (user?.email ? user.email.split('@')[0] : 'Bello Imam');

  const userInitials =
    userFullName
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'BI';

  const userDisplayPhone =
    profile?.phoneNumber ||
    user?.phoneNumber ||
    customPhone ||
    (user?.email ? user.email.split('@')[0] : '08154276838');

  // Page title resolution based on current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/data')) return 'Buy Mobile Data';
    if (pathname.startsWith('/dashboard/airtime')) return 'Airtime Topup';
    if (pathname.startsWith('/dashboard/electricity')) return 'Electricity Bills';
    if (pathname.startsWith('/dashboard/cable')) return 'Cable TV Renewal';
    if (pathname.startsWith('/dashboard/wallet')) return 'Fund Wallet';
    if (pathname.startsWith('/dashboard/bulk-data')) return 'Sell Bulk Data';
    if (pathname.startsWith('/dashboard/transactions')) return 'Transactions';
    if (pathname.startsWith('/dashboard/api-docs')) return 'API Docs & Plan IDs';
    return 'Dashboard';
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Buy Data', href: '/dashboard/data', icon: Smartphone },
    { label: 'Airtime Topup', href: '/dashboard/airtime', icon: PhoneCall },
    { label: 'Electricity Bills', href: '/dashboard/electricity', icon: Zap },
    { label: 'Cable TV', href: '/dashboard/cable', icon: Tv },
    { label: 'Fund Wallet', href: '/dashboard/wallet', icon: Wallet },
    { label: 'Sell Bulk Data', href: '/dashboard/bulk-data', icon: Grid },
    { label: 'Transactions', href: '/dashboard/transactions', icon: Clock },
    { label: 'API Docs & IDs', href: '/dashboard/api-docs', icon: Code },
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1e40af]" />
          <span>Opening your DataAbeg dashboard...</span>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-white text-slate-700">
      <div className="p-4 sm:p-5">
        {/* Brand / Logo Area matching Distinction */}
        <div className="flex items-center gap-2.5 pb-6 pt-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <DataAbegLogo size={32} showText={true} />
          </Link>
        </div>

        {/* Clean Distinction Navigation Items */}
        <nav className="space-y-1 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-50/80 text-[#1d4ed8] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1d4ed8]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin-salam"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer text-left font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Distinction-style primary button & user profile */}
      <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3">
        <Link
          href="/dashboard/data"
          className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white py-2.5 px-4 rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>New Purchase</span>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              setCustomPhone(userDisplayPhone);
              setIsEditPhoneOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left"
            title="Update phone number"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] font-medium text-slate-600 truncate max-w-[110px]">
              {userDisplayPhone}
            </div>
          </button>

          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-shrink-0 flex-col justify-between min-h-screen z-30 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* ================= MOBILE OFF-CANVAS DRAWER ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white flex flex-col justify-between z-10 shadow-2xl h-full border-r border-slate-200">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-100">
              <DataAbegLogo size={28} showText={true} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
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
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb matching Distinction: (←) Dashboard */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Back to dashboard home"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <span className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right section: Bell icon, Plan pill, and User profile capsule */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs space-y-3">
                  <div className="font-bold text-slate-900 flex justify-between items-center">
                    <span>Notifications</span>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                    <div className="font-bold text-blue-900">Glad Tidings VTU Live</div>
                    <div className="text-slate-600 text-[11px]">
                      Instant 5-second carrier delivery active across MTN, Airtel, Glo &amp; 9mobile.
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

            {/* Plan Badge Pill */}
            <Link
              href="/dashboard/wallet"
              className="hidden sm:inline-flex items-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
            >
              Basic Plan
            </Link>

            {/* Distinction User Avatar Capsule: BI initials + Name + Role + Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 pl-1 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-[#bfdbfe] text-[#1e40af] font-bold text-xs flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {userFullName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? 'Administrator' : 'Student'}
                  </span>
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
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Wallet (₦{(profile?.walletBalance || 0).toFixed(2)})</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      setCustomPhone(userDisplayPhone);
                      setIsEditPhoneOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Update Phone Number</span>
                  </button>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
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

        {/* Dynamic Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Floating Action / Support Button matching Distinction */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/2348154276838?text=Hello%20DataAbeg%20Support"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          title="Chat with Support"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      {/* ================= MODAL: EDIT PHONE NUMBER ================= */}
      {isEditPhoneOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Update Your Phone Number</h3>
              <button
                onClick={() => setIsEditPhoneOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
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
              className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Save Phone Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
