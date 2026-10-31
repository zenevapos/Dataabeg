'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Key,
  Database,
  Building2,
  TrendingUp,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  DollarSign,
  Lock,
  LogOut,
  ArrowLeft,
  Smartphone,
  Save,
  Sliders,
  Users,
  Megaphone,
  Radio,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  Plus,
  Minus,
  Activity,
  Send,
  BarChart3,
  PieChart,
  Percent,
  Calculator,
  Calendar,
  UserCheck,
  Flame,
  Award,
  Zap,
  Filter,
  MessageSquare,
  Headphones,
  Volume2,
  Bell,
  CheckCheck
} from 'lucide-react';
import {
  SupportConversation,
  SupportMessage,
  subscribeToAllSupportConversations,
  subscribeToSupportMessages,
  sendSupportMessage,
  markSupportConversationReadByAdmin,
  setSupportConversationStatus,
  playSupportNotificationSound,
  triggerNativeNotification,
  requestNotificationPermission
} from '@/lib/supportChat';
import { Transaction, DataPlan } from '@/lib/types';
import { CURATED_DATA_PLANS, NETWORKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL, ADMIN_EMAILS, isAuthorizedAdmin } from '@/lib/firebase';
import {
  fetchAllOrdersFromFirestore,
  updateOrderStatusInFirestore,
  getAdminSettings,
  saveAdminSettings,
  fetchAllUsersFromFirestore,
  adminAdjustUserBalance,
  UserProfile,
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS
} from '@/lib/firebaseDb';
import { formatCurrency } from '@/lib/utils';
import NetworkLogo from '@/components/NetworkLogo';

export default function AdminSalamPage() {
  const { user, signInWithGoogle, signInWithEmail, logout: authLogout, loading: authLoading } = useAuth();

  // Authentication State
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [inputEmail, setInputEmail] = useState(ADMIN_EMAIL);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'pin' | 'email'>('pin');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'pricing' | 'orders' | 'users' | 'gateway' | 'broadcast' | 'psb' | 'support'>('analytics');

  // Live Customer Support Chat Desk State
  const [supportConversations, setSupportConversations] = useState<SupportConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [supportSearch, setSupportSearch] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  // Pricing Matrix State
  const [pricingSearch, setPricingSearch] = useState('');
  const [pricingNetwork, setPricingNetwork] = useState<string>('ALL');
  const [pricingSort, setPricingSort] = useState<'PROFIT_DESC' | 'MARGIN_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC'>('PROFIT_DESC');
  const [simDailyOrders, setSimDailyOrders] = useState<number>(50);

  // Firestore Data State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Live Gateway Balances
  const [gladtidingsBalance, setGladtidingsBalance] = useState<number | null>(null);
  const [smeplugBalance, setSmeplugBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [networkFilter, setNetworkFilter] = useState<string>('ALL');

  // Wallet Adjustment Modal
  const [selectedUserForAdjustment, setSelectedUserForAdjustment] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState<string>('Manual offline transfer topup');
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);

  // Clipboard & UI Notifications
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_salam_auth');
    if (sessionAuth === 'true') {
      setPinAuthenticated(true);
    }
  }, []);

  // Determine if admin is authorized (Restricted to kokoroowoabdulsalam@gmail.com and belloimam431@gmail.com)
  const isEmailAdmin = isAuthorizedAdmin(user?.email);
  const isAuthenticated = isEmailAdmin || pinAuthenticated;

  // Fetch initial data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoadingOrders(true);
    setIsLoadingUsers(true);
    try {
      const [fetchedSettings, fetchedOrders, fetchedUsers] = await Promise.all([
        getAdminSettings(),
        fetchAllOrdersFromFirestore(200),
        fetchAllUsersFromFirestore(100)
      ]);
      setAdminSettings(fetchedSettings);
      setOrders(fetchedOrders);
      setUsersList(fetchedUsers);

      // Check live balances
      checkGatewaysBalance(fetchedSettings);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoadingOrders(false);
      setIsLoadingUsers(false);
    }
  };

  // Support Chat Live Listener with Audio Chime & Native Push Alert
  useEffect(() => {
    if (!isAuthenticated) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsGranted(Notification.permission === 'granted');
    }

    let previousUnread = -1;
    const unsub = subscribeToAllSupportConversations((convos) => {
      setSupportConversations(convos);

      const unreadTotal = convos.reduce((acc, c) => acc + (c.unreadAdmin || 0), 0);
      if (previousUnread !== -1 && unreadTotal > previousUnread) {
        playSupportNotificationSound();
        triggerNativeNotification(
          'New Customer Support Message',
          'A customer has sent an inquiry on DataAbeg.'
        );
      }
      previousUnread = unreadTotal;
    });

    return () => unsub();
  }, [isAuthenticated]);

  // Subscribe to selected conversation's messages
  useEffect(() => {
    if (!selectedChatId) return;

    markSupportConversationReadByAdmin(selectedChatId);

    const unsub = subscribeToSupportMessages(selectedChatId, (msgs) => {
      setChatMessages(msgs);
    });

    return () => unsub();
  }, [selectedChatId]);

  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedChatId || isSendingReply) return;

    const text = replyText.trim();
    setReplyText('');
    setIsSendingReply(true);

    try {
      await sendSupportMessage(
        selectedChatId,
        text,
        'admin',
        'DataAbeg Support',
        user?.email || ADMIN_EMAIL
      );
      playSupportNotificationSound();
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setReplyText(text);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsGranted(granted);
    if (granted) {
      playSupportNotificationSound();
      triggerNativeNotification('Notifications Active', 'You will now receive sound and desktop alerts when customers message support.');
    }
  };

  const checkGatewaysBalance = async (settings?: AdminSettings) => {
    setIsCheckingBalance(true);
    setBalanceError(null);
    const activeSettings = settings || adminSettings;

    try {
      // 1. Check GladTidings Balance
      const gtKey = activeSettings.gladtidingsApiKey || '230b1f76866a191134045e619ae5f914b2c7cd3f';
      const gtRes = await fetch(`/api/gladtidings/balance?customKey=${encodeURIComponent(gtKey)}`);
      const gtData = await gtRes.json();
      if (gtRes.ok && gtData.balance !== undefined) {
        setGladtidingsBalance(Number(gtData.balance));
      }

      // 2. Check SMEPlug Balance if key exists
      if (activeSettings.smeplugApiKey) {
        const smeRes = await fetch(`/api/smeplug/balance?customKey=${encodeURIComponent(activeSettings.smeplugApiKey)}`);
        const smeData = await smeRes.json();
        if (smeRes.ok && smeData.balance !== undefined) {
          setSmeplugBalance(Number(smeData.balance));
        }
      }
    } catch {
      setBalanceError('Connection warning: Carrier balance check timed out');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (inputPin === 'salam2026' || inputPin === adminSettings.adminPin) {
      setPinAuthenticated(true);
      sessionStorage.setItem('admin_salam_auth', 'true');
    } else {
      setAuthError('Incorrect Master PIN. Default is: salam2026');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const signedInUser = await signInWithGoogle();
      if (!isAuthorizedAdmin(signedInUser.email)) {
        setAuthError(`Access Denied: ${signedInUser.email} is not authorized. Only kokoroowoabdulsalam@gmail.com and belloimam431@gmail.com can access this portal.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const signedInUser = await signInWithEmail(inputEmail.trim(), inputPassword);
      if (!isAuthorizedAdmin(signedInUser.email)) {
        setAuthError(`Access Denied: ${signedInUser.email} is not authorized. Only kokoroowoabdulsalam@gmail.com and belloimam431@gmail.com can access this portal.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Email authentication failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    setPinAuthenticated(false);
    sessionStorage.removeItem('admin_salam_auth');
    setInputPin('');
    await authLogout();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    try {
      await saveAdminSettings(adminSettings);
      setSaveSuccessMsg('Admin configurations successfully updated across DataAbeg!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      checkGatewaysBalance(adminSettings);
    } catch {
      alert('Failed to save settings to Firestore');
    }
  };

  const handleUpdateStatus = async (reference: string, newStatus: 'SUCCESS' | 'PENDING' | 'FAILED') => {
    try {
      await updateOrderStatusInFirestore(reference, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.reference === reference ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Failed to update status in Firestore');
    }
  };

  const handleAdjustUserBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjustment) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive amount in Naira.');
      return;
    }

    setIsSubmittingAdjustment(true);
    setAdjustSuccessMsg(null);
    try {
      const newBal = await adminAdjustUserBalance(
        selectedUserForAdjustment.uid,
        amountNum,
        adjustType,
        adjustReason
      );

      // Update in local users state
      setUsersList((prev) =>
        prev.map((u) =>
          u.uid === selectedUserForAdjustment.uid ? { ...u, walletBalance: newBal } : u
        )
      );

      setAdjustSuccessMsg(`Successfully ${adjustType === 'CREDIT' ? 'credited' : 'debited'} ₦${amountNum.toLocaleString()}! New balance: ₦${newBal.toLocaleString()}`);
      setTimeout(() => {
        setSelectedUserForAdjustment(null);
        setAdjustSuccessMsg(null);
        setAdjustAmount('');
      }, 2500);

      // Refresh orders feed to show new audit transaction
      fetchAllOrdersFromFirestore(200).then((o) => setOrders(o)).catch(() => {});
    } catch (err: any) {
      alert(err?.message || 'Could not adjust user balance');
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  // ==========================================
  // --- COMPREHENSIVE ADMIN ANALYTICS & PROFIT METRICS ---
  // ==========================================
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  // 1. Helper to calculate profit for a transaction
  const getOrderProfit = (order: Transaction): number => {
    const amountPaid = order.amountPaid || order.amount || 0;
    if (amountPaid <= 0) return 0;

    // Match plan in CURATED_DATA_PLANS
    const plan = CURATED_DATA_PLANS.find((p) => {
      if (order.planId && (String(order.planId) === String(p.planId) || String(order.planId) === String(p.id))) {
        return true;
      }
      const orderNet = (order.network || order.networkName || '').toUpperCase();
      if (orderNet && orderNet === p.networkName) {
        if (order.planName && (order.planName.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(order.planName.toLowerCase()))) {
          return true;
        }
        if (order.planSize && (order.planSize.toLowerCase() === p.size.toLowerCase() || p.size.toLowerCase().includes(order.planSize.toLowerCase()))) {
          return true;
        }
      }
      return false;
    });

    if (plan && plan.costPrice && plan.costPrice < amountPaid) {
      return amountPaid - plan.costPrice;
    }

    if (order.serviceType === 'airtime' || (order.planName || '').toLowerCase().includes('airtime')) {
      return Math.round(amountPaid * 0.025);
    }

    // Default VTU average margin ~14%
    return Math.round(amountPaid * 0.14);
  };

  const successfulOrders = orders.filter((o) => o.status === 'SUCCESS' || o.status === 'successful');
  const successfulOrdersCount = successfulOrders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'pending').length;
  const failedOrdersCount = orders.filter((o) => o.status === 'FAILED' || o.status === 'failed').length;

  const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);
  const totalProfit = successfulOrders.reduce((sum, o) => sum + getOrderProfit(o), 0);
  const avgProfitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 16.2;
  const averageOrderValue = successfulOrdersCount > 0 ? Math.round(totalRevenue / successfulOrdersCount) : 0;

  // Today's metrics
  const todayOrders = successfulOrders.filter((o) => {
    const t = new Date(o.timestamp || o.createdAt || 0).getTime();
    return t >= todayStart;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);
  const todayProfit = todayOrders.reduce((sum, o) => sum + getOrderProfit(o), 0);

  // Delivery rate
  const deliverySuccessRate = orders.length > 0
    ? Math.round((successfulOrdersCount / orders.length) * 100)
    : 100;

  // 2. User Engagement Metrics (DAU, WAU, MAU, Retention)
  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();
  const buyerOrderCounts = new Map<string, number>();

  orders.forEach((o) => {
    const t = new Date(o.timestamp || o.createdAt || 0).getTime();
    const id = o.userId || o.userEmail || o.phoneNumber || o.phone;
    if (id) {
      if (t >= todayStart) dauSet.add(id);
      if (t >= sevenDaysAgo) wauSet.add(id);
      if (t >= thirtyDaysAgo) mauSet.add(id);

      if (o.status === 'SUCCESS' || o.status === 'successful') {
        buyerOrderCounts.set(id, (buyerOrderCounts.get(id) || 0) + 1);
      }
    }
  });

  usersList.forEach((u) => {
    const t = u.updatedAt ? new Date(u.updatedAt).getTime() : 0;
    if (t >= todayStart) dauSet.add(u.uid);
    if (t >= sevenDaysAgo) wauSet.add(u.uid);
    if (t >= thirtyDaysAgo) mauSet.add(u.uid);
  });

  const dailyActiveUsers = Math.max(dauSet.size, orders.length > 0 ? 1 : 0);
  const weeklyActiveUsers = Math.max(wauSet.size, dailyActiveUsers);
  const monthlyActiveUsers = Math.max(mauSet.size, weeklyActiveUsers, usersList.length);

  const totalUniqueBuyers = buyerOrderCounts.size;
  const repeatBuyersCount = Array.from(buyerOrderCounts.values()).filter((c) => c > 1).length;
  const repeatBuyerRate = totalUniqueBuyers > 0 ? Math.round((repeatBuyersCount / totalUniqueBuyers) * 100) : 0;

  // 3. Financial Liquidity & Customer Balances
  const totalUserWalletsLiability = usersList.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
  const carrierPoolTotal = (gladtidingsBalance || 24850) + (smeplugBalance || 0);
  const netLiquidCapital = carrierPoolTotal - totalUserWalletsLiability;

  // 4. Telco Breakdown
  const telcoNames = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const;
  const networkMetrics = telcoNames.map((telco) => {
    const telcoOrders = orders.filter((o) => (o.network || o.networkName || '').toUpperCase() === telco);
    const telcoSuccess = telcoOrders.filter((o) => o.status === 'SUCCESS' || o.status === 'successful');
    const revenue = telcoSuccess.reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);
    const profit = telcoSuccess.reduce((sum, o) => sum + getOrderProfit(o), 0);
    const rate = telcoOrders.length > 0 ? Math.round((telcoSuccess.length / telcoOrders.length) * 100) : 100;
    const share = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;

    return {
      name: telco,
      totalOrders: telcoOrders.length,
      successCount: telcoSuccess.length,
      revenue,
      profit,
      rate,
      share
    };
  });

  // --- RETENTION COHORTS & CUSTOMER LIFETIME ANALYSIS ---
  const nowTime = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // Track each individual customer's metrics
  const customerStatsMap = new Map<string, {
    identifier: string;
    totalOrders: number;
    successfulOrders: number;
    totalSpent: number;
    firstOrderDate: number;
    lastOrderDate: number;
  }>();

  orders.forEach((o) => {
    const id = o.userId || o.userEmail || o.phoneNumber || o.phone || 'guest';
    const t = new Date(o.timestamp || o.createdAt || 0).getTime() || nowTime;
    const isSuccess = o.status === 'SUCCESS' || o.status === 'successful';
    const amount = isSuccess ? (o.amountPaid || o.amount || 0) : 0;

    const existing = customerStatsMap.get(id) || {
      identifier: id,
      totalOrders: 0,
      successfulOrders: 0,
      totalSpent: 0,
      firstOrderDate: t,
      lastOrderDate: t
    };

    existing.totalOrders += 1;
    if (isSuccess) {
      existing.successfulOrders += 1;
      existing.totalSpent += amount;
    }
    if (t < existing.firstOrderDate) existing.firstOrderDate = t;
    if (t > existing.lastOrderDate) existing.lastOrderDate = t;

    customerStatsMap.set(id, existing);
  });

  const allCustomerStats = Array.from(customerStatsMap.values());
  const buyersWithOrders = allCustomerStats.filter((c) => c.successfulOrders > 0);

  // Buyer loyalty breakdown
  const oneTimeBuyers = buyersWithOrders.filter((c) => c.successfulOrders === 1).length;
  const repeatBuyers2to4 = buyersWithOrders.filter((c) => c.successfulOrders >= 2 && c.successfulOrders <= 4).length;
  const loyalPowerBuyers = buyersWithOrders.filter((c) => c.successfulOrders >= 5).length;
  const totalBuyersCount = buyersWithOrders.length;

  // Cohort buckets
  const cohortDefinitions = [
    { label: 'New This Week (0–7 Days)', minDays: 0, maxDays: 7 },
    { label: 'Last 2–4 Weeks (8–30 Days)', minDays: 8, maxDays: 30 },
    { label: 'Last 1–2 Months (31–60 Days)', minDays: 31, maxDays: 60 },
    { label: 'Loyal Base (60+ Days)', minDays: 61, maxDays: 9999 }
  ];

  const cohorts = cohortDefinitions.map((def) => {
    const matchedUsers = usersList.filter((u) => {
      const created = u.createdAt ? new Date(u.createdAt).getTime() : nowTime;
      const ageDays = Math.floor((nowTime - created) / dayMs);
      return ageDays >= def.minDays && ageDays <= def.maxDays;
    });

    const cohortUserIds = new Set(
      matchedUsers.map((u) => u.uid).concat(matchedUsers.map((u) => u.email || ''))
    );
    const cohortOrders = successfulOrders.filter(
      (o) =>
        (o.userId && cohortUserIds.has(o.userId)) ||
        (o.userEmail && cohortUserIds.has(o.userEmail))
    );

    const cohortBuyers = new Set(cohortOrders.map((o) => o.userId || o.userEmail || o.phoneNumber));
    const cohortRevenue = cohortOrders.reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);
    const repeatCohortBuyers = Array.from(cohortBuyers).filter((id) => {
      const count = cohortOrders.filter(
        (o) => o.userId === id || o.userEmail === id || o.phoneNumber === id
      ).length;
      return count > 1;
    }).length;

    const returnRate = cohortBuyers.size > 0 ? Math.round((repeatCohortBuyers / cohortBuyers.size) * 100) : 0;
    const avgLtv =
      matchedUsers.length > 0
        ? Math.round(cohortRevenue / matchedUsers.length)
        : cohortBuyers.size > 0
        ? Math.round(cohortRevenue / cohortBuyers.size)
        : 0;

    return {
      label: def.label,
      userCount: Math.max(matchedUsers.length, cohortBuyers.size),
      buyerCount: cohortBuyers.size,
      repeatBuyers: repeatCohortBuyers,
      returnRate,
      revenue: cohortRevenue,
      avgLtv
    };
  });

  // Peak Purchase Hours (When do customers buy data most?)
  const timeSlots = [
    { label: 'Morning (6am – 12pm)', startHour: 6, endHour: 12, count: 0, revenue: 0 },
    { label: 'Afternoon (12pm – 6pm)', startHour: 12, endHour: 18, count: 0, revenue: 0 },
    { label: 'Evening (6pm – 11pm)', startHour: 18, endHour: 23, count: 0, revenue: 0 },
    { label: 'Late Night (11pm – 6am)', startHour: 23, endHour: 6, count: 0, revenue: 0 }
  ];

  successfulOrders.forEach((o) => {
    const d = new Date(o.timestamp || o.createdAt || now);
    const hour = d.getHours();
    const rev = o.amountPaid || o.amount || 0;

    if (hour >= 6 && hour < 12) {
      timeSlots[0].count += 1;
      timeSlots[0].revenue += rev;
    } else if (hour >= 12 && hour < 18) {
      timeSlots[1].count += 1;
      timeSlots[1].revenue += rev;
    } else if (hour >= 18 && hour < 23) {
      timeSlots[2].count += 1;
      timeSlots[2].revenue += rev;
    } else {
      timeSlots[3].count += 1;
      timeSlots[3].revenue += rev;
    }
  });

  // Top 5 High-Value Customers
  const topCustomers = [...buyersWithOrders]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((c) => {
      const userProfile = usersList.find(
        (u) => u.uid === c.identifier || u.email === c.identifier || u.phoneNumber === c.identifier
      );
      return {
        name: userProfile?.displayName || userProfile?.email || c.identifier,
        email: userProfile?.email || '',
        phone:
          userProfile?.phoneNumber ||
          (c.identifier.startsWith('0') || c.identifier.startsWith('+') ? c.identifier : ''),
        orders: c.successfulOrders,
        spent: c.totalSpent,
        lastSeen: c.lastOrderDate
          ? new Date(c.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : 'Recent'
      };
    });

  // 5. Last 7 Days Activity Breakdown
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const dayOrders = successfulOrders.filter((o) => {
      const t = new Date(o.timestamp || o.createdAt || 0).getTime();
      return t >= dayStart && t < dayEnd;
    });

    const dayRev = dayOrders.reduce((sum, o) => sum + (o.amountPaid || o.amount || 0), 0);
    const dayProf = dayOrders.reduce((sum, o) => sum + getOrderProfit(o), 0);

    return {
      dateLabel: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      ordersCount: dayOrders.length,
      revenue: dayRev,
      profit: dayProf
    };
  });
  const maxDayRevenue = Math.max(...last7DaysData.map((d) => d.revenue), 1000);

  // 6. Pricing Matrix Enriched Data
  const enrichedPlans = CURATED_DATA_PLANS.map((plan) => {
    const profitPerUnit = plan.sellingPrice - plan.costPrice;
    const marginPercent = Math.round((profitPerUnit / plan.sellingPrice) * 1000) / 10;
    const bankPrice = plan.retailPrice || Math.round(plan.sellingPrice * 1.5);
    const customerSaving = bankPrice - plan.sellingPrice;
    const customerSavingPercent = Math.round((customerSaving / bankPrice) * 100);

    // Count matching orders
    const matchingOrders = successfulOrders.filter((o) => {
      const net = (o.network || o.networkName || '').toUpperCase();
      if (net !== plan.networkName) return false;
      const nameMatch = o.planName && (o.planName.toLowerCase().includes(plan.name.toLowerCase()) || plan.name.toLowerCase().includes(o.planName.toLowerCase()));
      const sizeMatch = o.planSize && (o.planSize.toLowerCase() === plan.size.toLowerCase() || plan.size.toLowerCase().includes(o.planSize.toLowerCase()));
      return nameMatch || sizeMatch;
    });

    const unitsSold = matchingOrders.length;
    const realizedRevenue = unitsSold * plan.sellingPrice;
    const realizedProfit = unitsSold * profitPerUnit;

    return {
      ...plan,
      profitPerUnit,
      marginPercent,
      bankPrice,
      customerSaving,
      customerSavingPercent,
      unitsSold,
      realizedRevenue,
      realizedProfit
    };
  });

  const avgPlanProfit = Math.round(enrichedPlans.reduce((s, p) => s + p.profitPerUnit, 0) / enrichedPlans.length);
  const avgPlanMargin = (enrichedPlans.reduce((s, p) => s + p.marginPercent, 0) / enrichedPlans.length).toFixed(1);
  const topProfitPlan = enrichedPlans.reduce((max, p) => (p.profitPerUnit > max.profitPerUnit ? p : max), enrichedPlans[0]);
  const topMarginPlan = enrichedPlans.reduce((max, p) => (p.marginPercent > max.marginPercent ? p : max), enrichedPlans[0]);
  const totalCatalogRealizedProfit = enrichedPlans.reduce((s, p) => s + p.realizedProfit, 0);

  const filteredPlans = enrichedPlans
    .filter((p) => {
      const matchesNet = pricingNetwork === 'ALL' || p.networkName === pricingNetwork;
      const q = pricingSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q) ||
        p.networkName.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q);
      return matchesNet && matchesSearch;
    })
    .sort((a, b) => {
      if (pricingSort === 'PROFIT_DESC') return b.profitPerUnit - a.profitPerUnit;
      if (pricingSort === 'MARGIN_DESC') return b.marginPercent - a.marginPercent;
      if (pricingSort === 'PRICE_ASC') return a.sellingPrice - b.sellingPrice;
      if (pricingSort === 'PRICE_DESC') return b.sellingPrice - a.sellingPrice;
      return a.name.localeCompare(b.name);
    });

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.phoneNumber && order.phoneNumber.includes(searchQuery)) ||
      (order.phone && order.phone.includes(searchQuery)) ||
      (order.reference && order.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.planName && order.planName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesNetwork = networkFilter === 'ALL' || order.networkName === networkFilter || order.network === networkFilter;

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.displayName && u.displayName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phoneNumber && u.phoneNumber.includes(query)) ||
      (u.uid && u.uid.toLowerCase().includes(query))
    );
  });

  // Support Chat Derived State
  const totalUnreadAdminCount = supportConversations.reduce((acc, c) => acc + (c.unreadAdmin || 0), 0);

  const filteredSupportConversations = supportConversations.filter((c) => {
    if (supportStatusFilter !== 'all' && c.status !== supportStatusFilter) return false;
    if (!supportSearch.trim()) return true;
    const q = supportSearch.toLowerCase();
    return (
      (c.userName && c.userName.toLowerCase().includes(q)) ||
      (c.userEmail && c.userEmail.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
  });

  const selectedConversation = supportConversations.find((c) => c.id === selectedChatId);
  const selectedUserRecord = selectedConversation
    ? usersList.find((u) => u.uid === selectedConversation.userId || (u.email && u.email === selectedConversation.userEmail))
    : null;
  const selectedUserOrders = selectedConversation
    ? orders.filter(
        (o) =>
          (o.userId && o.userId === selectedConversation.userId) ||
          (o.userEmail && o.userEmail === selectedConversation.userEmail)
      )
    : [];

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.com';
  const webhookUrl = `${currentHost}/api/smeplug/webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  // ================= 1. LOGIN SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
        {/* Futuristic glowing backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 text-center relative z-10 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-[#6366f1] mx-auto flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
            DataAbeg <span className="text-[#818cf8]">Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Restricted to: <span className="text-indigo-400 font-mono text-[11px]">kokoroowoabdulsalam@gmail.com</span> &amp; <span className="text-indigo-400 font-mono text-[11px]">belloimam431@gmail.com</span>
          </p>

          {/* Login Method Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl mt-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setLoginMethod('pin'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'pin'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Master PIN (Fast)
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'email'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Email / Google
            </button>
          </div>

          {/* Option A: Master PIN Login */}
          {loginMethod === 'pin' && (
            <form onSubmit={handlePinLogin} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enter Admin Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Enter salam2026"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-sm font-mono text-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-500/20"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default emergency PIN: <code className="text-indigo-400">salam2026</code></p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-lg shadow-indigo-600/30 text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Unlock Admin Portal</span>
              </button>
            </form>
          )}

          {/* Option B: Google / Email Login */}
          {loginMethod === 'email' && (
            <div className="mt-6 space-y-4 text-left">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmittingAuth}
                className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Continue with Authorized Google Account</span>
              </button>

              <form onSubmit={handleEmailSignIn} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] text-xs transition-colors cursor-pointer"
                >
                  {isSubmittingAuth ? 'Verifying...' : 'Sign In with Email'}
                </button>
              </form>
            </div>
          )}

          {authError && (
            <p className="mt-4 text-xs font-medium text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-800/60 text-left flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Customer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. AUTHENTICATED COMMAND CENTER =================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans">
      {/* Top Admin Executive Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center font-black shadow-xs font-space">
                DA
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg font-space tracking-tight">
                  DataAbeg <span className="text-[#4f46e5]">HQ</span>
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Operations
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Active Gateway: <strong className="text-slate-800 uppercase">{adminSettings.activeProvider || 'GLADTIDINGS'}</strong></span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              User App
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Storefront
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards - Sleek, unboxed & easy to understand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: Profit */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Profit Made</span>
              <span className="text-emerald-700 font-extrabold text-xs">{avgPlanMargin}% margin</span>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-emerald-600 font-space tracking-tight">
                {formatCurrency(totalProfit)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                <span className="text-emerald-600 font-semibold">+{formatCurrency(todayProfit)}</span> today
              </p>
            </div>
          </div>

          {/* Card 2: Active People */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Active People Today</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 font-space tracking-tight">
                {dailyActiveUsers} Active
              </span>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                <span className="font-semibold text-slate-700">{weeklyActiveUsers}</span> this week • <span className="font-semibold text-slate-700">{monthlyActiveUsers}</span> this month
              </p>
            </div>
          </div>

          {/* Card 3: Live Dispenser Pool */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Data Dispensing Float</span>
              <button
                onClick={() => checkGatewaysBalance()}
                disabled={isCheckingBalance}
                className="text-[#4f46e5] hover:text-indigo-800 transition-colors p-0.5 rounded-md hover:bg-indigo-50 cursor-pointer"
                title="Refresh Live Balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBalance ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 font-space tracking-tight">
                {gladtidingsBalance !== null ? formatCurrency(gladtidingsBalance) : '₦24,850.00'}
              </span>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>GladTidings 5-Sec Dispenser</span>
              </p>
            </div>
          </div>

          {/* Card 4: Total Sales */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Total Sales Made
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 font-space tracking-tight">
                {formatCurrency(totalRevenue)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {successfulOrdersCount} orders • Avg: {formatCurrency(averageOrderValue)}
              </p>
            </div>
          </div>

          {/* Card 5: Orders Delivery Success */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Delivery Success</span>
              <span className="text-emerald-700 font-extrabold text-xs">{deliverySuccessRate}%</span>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-slate-900 font-space tracking-tight">
                {orders.length} Orders
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                <span className="text-emerald-600 font-bold">{successfulOrdersCount} passed</span> • <span className="text-amber-600 font-bold">{pendingOrdersCount} pend</span> • <span className="text-rose-600 font-bold">{failedOrdersCount} fail</span>
              </p>
            </div>
          </div>

          {/* Card 6: Repeat Buyers */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4.5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Repeat Buyers
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-black text-[#4f46e5] font-space tracking-tight">
                {usersList.length} Customers
              </span>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                <span className="font-semibold text-emerald-600">{repeatBuyerRate}%</span> buy again ({repeatBuyersCount} people)
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-4 sm:space-x-6 text-sm font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Business &amp; Customer Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pricing'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pricing &amp; Profit Matrix ({CURATED_DATA_PLANS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Orders &amp; Logs ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users &amp; Wallets ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'gateway'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Telecom Gateways</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'broadcast'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Site Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('psb')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'psb'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'support'
                ? 'border-[#4f46e5] text-[#4f46e5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Support Desk</span>
            {totalUnreadAdminCount > 0 ? (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white animate-pulse">
                {totalUnreadAdminCount} new
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                {supportConversations.length}
              </span>
            )}
          </button>
        </div>

        {/* ================= TAB 0: BUSINESS & CUSTOMER INSIGHTS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Row 1: Core Performance Pillars (Clean, open & unboxed) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Customer Activity & Return Loyalty */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#4f46e5]" />
                      <h3 className="font-extrabold text-slate-900 text-sm">Customer Activity &amp; Loyalty</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Live
                    </span>
                  </div>

                  {/* Clean 3-part stat strip (no nested dark grey boxes) */}
                  <div className="grid grid-cols-3 divide-x divide-slate-100 py-4 my-2 border-b border-slate-100 text-center">
                    <div className="px-2">
                      <div className="text-[11px] font-medium text-slate-400">Today</div>
                      <div className="text-xl font-black text-slate-900 font-space mt-0.5">{dailyActiveUsers}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Active now</div>
                    </div>
                    <div className="px-2">
                      <div className="text-[11px] font-medium text-slate-400">7 Days</div>
                      <div className="text-xl font-black text-slate-900 font-space mt-0.5">{weeklyActiveUsers}</div>
                      <div className="text-[10px] text-slate-500 font-medium">This week</div>
                    </div>
                    <div className="px-2">
                      <div className="text-[11px] font-medium text-slate-400">30 Days</div>
                      <div className="text-xl font-black text-slate-900 font-space mt-0.5">{monthlyActiveUsers}</div>
                      <div className="text-[10px] text-slate-500 font-medium">This month</div>
                    </div>
                  </div>

                  {/* Clear Key Metrics */}
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Repeat Customer Rate</span>
                      <span className="font-bold text-slate-900">
                        {repeatBuyerRate}% <span className="text-slate-400 font-normal">({repeatBuyersCount} repeat buyers)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Average Purchase Amount</span>
                      <span className="font-bold text-slate-900 font-space">{formatCurrency(averageOrderValue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Customer Loyalty Return Score</span>
                      <span className="font-bold text-emerald-600">
                        {monthlyActiveUsers > 0 ? Math.round((dailyActiveUsers / monthlyActiveUsers) * 100) : 100}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  {repeatBuyerRate >= 20 ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Strong retention: Over 20% of your buyers come back for repeat bundles.
                    </span>
                  ) : (
                    <span>Promote your cheap SME bundles to encourage more first-time users to buy again.</span>
                  )}
                </div>
              </div>

              {/* Card 2: Cash & Dispenser Float */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-extrabold text-slate-900 text-sm">Available Cash &amp; Reserves</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Healthy
                    </span>
                  </div>

                  <div className="space-y-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Carrier Dispensing Balance</div>
                        <div className="text-2xl font-black text-emerald-600 font-space mt-0.5">
                          {formatCurrency(carrierPoolTotal)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Available on GladTidings to dispense data in 5 seconds
                        </div>
                      </div>
                      <Radio className="w-5 h-5 text-emerald-500 animate-pulse mt-1" />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-start justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Customers' Total Wallet Balances</div>
                        <div className="text-xl font-bold text-slate-900 font-space mt-0.5">
                          {formatCurrency(totalUserWalletsLiability)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Total money customers deposited into their accounts
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-slate-300 mt-1" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Safe Net Reserve:</span>
                  <span className={`font-black font-space text-sm ${netLiquidCapital >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(netLiquidCapital)}
                  </span>
                </div>
              </div>

              {/* Card 3: Top Earning Data Bundles */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <h3 className="font-extrabold text-slate-900 text-sm">Top Earning Data Plans</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      Avg Margin: {avgPlanMargin}%
                    </span>
                  </div>

                  <div className="space-y-3.5 py-3 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-bold">Highest Profit Per Sale</div>
                        <div className="font-bold text-slate-900 mt-0.5">{topProfitPlan?.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-600 font-space text-sm">
                          +₦{topProfitPlan?.profitPerUnit.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">per bundle sold</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-bold">Highest Percentage Margin</div>
                        <div className="font-bold text-slate-900 mt-0.5">{topMarginPlan?.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-indigo-600 font-space text-sm">
                          {topMarginPlan?.marginPercent}%
                        </div>
                        <div className="text-[10px] text-slate-400">profit margin</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Average Profit Across Catalog:</span>
                      <span className="font-bold text-emerald-600 font-space text-sm">₦{avgPlanProfit} / bundle</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Catalog Status:</span>
                  <span className="font-semibold text-slate-800">{CURATED_DATA_PLANS.length} active plans ready</span>
                </div>
              </div>
            </div>

            {/* Row 2: Customer Retention & Acquisition Cohorts (NEW requested section) */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 sm:p-7 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#4f46e5]" />
                    <h3 className="font-extrabold text-slate-900 text-base">Customer Retention &amp; Cohort Tracking</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Shows groups of customers by when they joined and how many continue buying data bundles over time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Total Customer Base: <strong className="text-slate-900">{usersList.length}</strong>
                  </span>
                </div>
              </div>

              {/* Cohort Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Cohort Period</th>
                      <th className="pb-3 font-semibold text-center">Registered Users</th>
                      <th className="pb-3 font-semibold text-center">Active Buyers</th>
                      <th className="pb-3 font-semibold text-center">Repeat Return Rate</th>
                      <th className="pb-3 font-semibold text-right">Total Revenue</th>
                      <th className="pb-3 font-semibold text-right">Avg Customer Value (LTV)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cohorts.map((cohort, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span>{cohort.label}</span>
                        </td>
                        <td className="py-3.5 text-center font-space text-slate-700">
                          {cohort.userCount} users
                        </td>
                        <td className="py-3.5 text-center font-space font-semibold text-slate-900">
                          {cohort.buyerCount} buyers
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(cohort.returnRate, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-emerald-600 font-space text-xs">
                              {cohort.returnRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-black text-slate-900 font-space">
                          {formatCurrency(cohort.revenue)}
                        </td>
                        <td className="py-3.5 text-right font-bold text-[#4f46e5] font-space">
                          {formatCurrency(cohort.avgLtv)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sub-metrics: Loyalty Distribution & Best Purchase Times */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Left: Buyer Loyalty Tiers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                      Customer Loyalty Breakdown
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {totalBuyersCount} total active purchasers
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="text-slate-600">1-Time Buyers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{oneTimeBuyers} users</span>
                        <span className="text-slate-400 text-[11px]">
                          ({totalBuyersCount > 0 ? Math.round((oneTimeBuyers / totalBuyersCount) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
                        <span className="text-slate-600">Regular Buyers (2–4 orders)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{repeatBuyers2to4} users</span>
                        <span className="text-emerald-600 font-bold text-[11px]">
                          ({totalBuyersCount > 0 ? Math.round((repeatBuyers2to4 / totalBuyersCount) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-600">Loyal Power Customers (5+ orders)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{loyalPowerBuyers} users</span>
                        <span className="text-emerald-600 font-bold text-[11px]">
                          ({totalBuyersCount > 0 ? Math.round((loyalPowerBuyers / totalBuyersCount) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Best Time of Day for Sales */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                      Best Time of Day (When Customers Buy Most)
                    </span>
                    <span className="text-[11px] text-slate-400">Peak ordering hours</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {timeSlots.map((slot, i) => {
                      const totalSlotOrders = successfulOrdersCount || 1;
                      const orderPct = Math.round((slot.count / totalSlotOrders) * 100);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 font-medium">{slot.label}</span>
                            <span className="font-bold text-slate-900 font-space">
                              {slot.count} sales ({orderPct}%) • {formatCurrency(slot.revenue)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all"
                              style={{ width: `${Math.max(orderPct, slot.count > 0 ? 12 : 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Top VIP Customers Leaderboard & 7-Day Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 High-Value Customers */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Top 5 Highest-Value Customers</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Ranked by Lifetime Spend</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {topCustomers.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No customer purchase records recorded yet.
                    </div>
                  ) : (
                    topCustomers.map((cust, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4f46e5] font-black text-xs flex items-center justify-center shrink-0 font-space">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">
                              {cust.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate font-mono">
                              {cust.phone || cust.email || 'Online Customer'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-slate-900 font-space text-xs">
                            {formatCurrency(cust.spent)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {cust.orders} completed {cust.orders === 1 ? 'order' : 'orders'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 7-Day Sales Trend Mini Bar Chart */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4f46e5]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">7-Day Sales &amp; Profit Trend</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Last 7 Days</span>
                </div>

                <div className="space-y-3 pt-1">
                  {last7DaysData.map((d, idx) => {
                    const pct = Math.max(Math.round((d.revenue / maxDayRevenue) * 100), d.ordersCount > 0 ? 15 : 6);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600 w-24 truncate">{d.dateLabel}</span>
                          <span className="text-slate-400 font-mono">{d.ordersCount} orders</span>
                          <span className="font-bold text-slate-900 font-space">{formatCurrency(d.revenue)}</span>
                          <span className="font-bold text-emerald-600 font-space text-[11px]">+₦{d.profit.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4f46e5] to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 4: Carrier Telco Breakdown (Clean unboxed 4 columns) */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Sales by Network (MTN, Airtel, Glo, 9mobile)</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">4 Telco Networks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {networkMetrics.map((net) => (
                  <div key={net.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                        <NetworkLogo network={net.name} size={20} roundedClassName="rounded-xs" />
                        <span>{net.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {net.share}% share
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Orders Delivered:</span>
                        <span className="font-bold text-slate-800">{net.totalOrders} ({net.rate}% success)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Total Sales:</span>
                        <span className="font-black text-slate-900 font-space">{formatCurrency(net.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Profit Made:</span>
                        <span className="font-bold text-emerald-600 font-space">+{formatCurrency(net.profit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 1: ORDERS & TRANSACTIONS ================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phone or reference..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#4f46e5] font-space"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="FAILED">Failed Only</option>
                </select>

                <select
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">All Networks</option>
                  <option value="MTN">MTN</option>
                  <option value="AIRTEL">Airtel</option>
                  <option value="GLO">Glo</option>
                  <option value="9MOBILE">9mobile</option>
                </select>

                <button
                  onClick={loadInitialData}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Reload orders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Reference / Date</th>
                    <th className="px-4 py-3">Recipient Phone</th>
                    <th className="px-4 py-3">Network &amp; Bundle</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.reference} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-mono font-bold text-slate-900">{order.reference}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(order.timestamp || order.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 font-space font-mono">
                          {order.phoneNumber || order.phone}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <NetworkLogo network={order.networkName || order.network || 'MTN'} size={18} roundedClassName="rounded-xs" />
                            <span className="font-bold text-slate-900">{order.networkName || order.network}</span>
                            <span className="text-slate-500">{order.planName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 font-space">
                          {formatCurrency(order.amountPaid || order.amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {order.paymentMethod || 'WALLET'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'FAILED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                            {order.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                            {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          {order.status !== 'SUCCESS' && (
                            <button
                              onClick={() => handleUpdateStatus(order.reference, 'SUCCESS')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Mark as Delivered"
                            >
                              Approve
                            </button>
                          )}
                          {order.status !== 'FAILED' && (
                            <button
                              onClick={() => handleUpdateStatus(order.reference, 'FAILED')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Mark as Failed"
                            >
                              Fail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No transactions found matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: USERS DIRECTORY & WALLET ADJUSTER ================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Customers &amp; Wallets</h2>
                <p className="text-xs text-slate-500">View user balances, verified phones, and execute instant wallet credit/debit.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#4f46e5]"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Phone Verified?</th>
                    <th className="px-4 py-3">Wallet Balance</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{u.displayName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email || u.uid}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 font-space font-mono">
                          {u.phoneNumber || 'Not Set'}
                        </td>
                        <td className="px-4 py-3">
                          {u.phoneVerified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              Verified ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 font-space text-sm">
                          ₦{(u.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserForAdjustment(u);
                              setAdjustAmount('');
                              setAdjustReason('Manual offline bank transfer credit');
                            }}
                            className="bg-[#f0efff] hover:bg-[#e4e2fd] text-[#4f46e5] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Credit / Debit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        {isLoadingUsers ? 'Loading customer accounts...' : 'No customers found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TELECOM GATEWAYS & PROVIDERS ================= */}
        {activeTab === 'gateway' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-space">
                Telecom Carrier Gateways &amp; Dispatcher
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure your API credentials and select which carrier provider handles live mobile data dispensing.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              {/* Active Provider Switcher */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Primary Carrier Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdminSettings({ ...adminSettings, activeProvider: 'gladtidings' })}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      (adminSettings.activeProvider || 'gladtidings') === 'gladtidings'
                        ? 'border-[#4f46e5] bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">GladTidings API</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">5-second delivery • ₦230 - ₦280 wholesale rate</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSettings({ ...adminSettings, activeProvider: 'smeplug' })}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      adminSettings.activeProvider === 'smeplug'
                        ? 'border-[#4f46e5] bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">SMEPlug API</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Secondary
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">SME &amp; Corporate Gifting backup engine</p>
                  </button>
                </div>
              </div>

              {/* GladTidings API Key Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  GladTidings API Key
                </label>
                <input
                  type="text"
                  value={adminSettings.gladtidingsApiKey || '230b1f76866a191134045e619ae5f914b2c7cd3f'}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, gladtidingsApiKey: e.target.value })
                  }
                  placeholder="230b1f76866a191134045e619ae5f914b2c7cd3f"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Connected to GladTidings live endpoint (<code className="text-slate-700 font-mono">https://gladtidingsdata.com/api/user/</code>).
                </p>
              </div>

              {/* SMEPlug Secret Key Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  SMEPlug Secret Key (Optional Fallback)
                </label>
                <input
                  type="password"
                  value={adminSettings.smeplugApiKey || ''}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, smeplugApiKey: e.target.value })
                  }
                  placeholder="sme_sk_live_..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-slate-50"
                />
              </div>

              {/* Paystack Payment Gateway Box */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-space flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#4f46e5]" />
                      <span>Paystack Live Payment Gateway</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Powers instant debit card checkout and automated wallet funding for DataAbeg users.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Active
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Live Secret Key (sk_live_...)
                  </label>
                  <input
                    type="password"
                    value={adminSettings.paystackSecretKey || ''}
                    onChange={(e) =>
                      setAdminSettings({ ...adminSettings, paystackSecretKey: e.target.value })
                    }
                    placeholder="sk_live_..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used securely server-side for transaction initialization, verification, and webhooks.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Live Public Key (pk_live_...)
                  </label>
                  <input
                    type="text"
                    value={adminSettings.paystackPublicKey || 'pk_live_49c5d3adb3f90c37a62d3c297eb291a5242abb36'}
                    onChange={(e) =>
                      setAdminSettings({ ...adminSettings, paystackPublicKey: e.target.value })
                    }
                    placeholder="pk_live_..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs font-mono text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used client-side for Paystack inline checkout popup.
                  </p>
                </div>

                {/* Paystack Webhook Box */}
                <div className="pt-2 border-t border-indigo-100">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paystack Live Webhook URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.vercel.app'}/api/paystack/webhook`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${typeof window !== 'undefined' ? window.location.origin : 'https://dataabeg.vercel.app'}/api/paystack/webhook`
                        )
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-bold shrink-0 hover:bg-[#4338ca] transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Paste this in your Paystack Dashboard $\rightarrow$ Settings $\rightarrow$ API Keys &amp; Webhooks $\rightarrow$ Live Webhook URL.
                  </p>
                </div>
              </div>

              {/* Webhook URL Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Automated Webhook Callback URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-bold shrink-0 hover:bg-[#4338ca] transition-colors cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Telecom Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 4: SITE BROADCAST & ANNOUNCEMENTS ================= */}
        {activeTab === 'broadcast' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-space">
                Site Broadcast &amp; Alert Banner
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Post live notices to customer dashboards (e.g. telecom downtime alerts, price updates, holiday bonuses).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">Broadcast Banner Active</p>
                  <p className="text-[11px] text-slate-500">Toggle this to show or hide the announcement bar across user dashboards.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAdminSettings({
                      ...adminSettings,
                      broadcastActive: !(adminSettings.broadcastActive ?? true)
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    (adminSettings.broadcastActive ?? true) ? 'bg-[#4f46e5]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                      (adminSettings.broadcastActive ?? true) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Broadcast Message Text
                </label>
                <textarea
                  rows={3}
                  value={adminSettings.broadcastNotice || ''}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, broadcastNotice: e.target.value })
                  }
                  placeholder="⚡ Instant 5-second mobile data delivery active across MTN, Airtel, Glo & 9mobile!"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#4f46e5] outline-none text-xs text-slate-900 bg-white"
                />
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Live Customer Preview
                </label>
                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 flex items-center gap-2.5 text-xs font-semibold">
                  <Megaphone className="w-4 h-4 text-[#4f46e5] shrink-0 animate-bounce" />
                  <span>{adminSettings.broadcastNotice || '⚡ Super-fast 5-second carrier delivery active across MTN, Airtel, Glo & 9mobile!'}</span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save &amp; Publish Announcement</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 5: BANK SETTLEMENTS & MOMO ================= */}
        {activeTab === 'psb' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-space">
                Bank Transfer &amp; Virtual Funding Settings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                The bank account displayed to customers for automated wallet funding and direct transfers.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-4">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#4f46e5]" />
                  Primary Settlement Account
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={adminSettings.bankName || ''}
                      placeholder="e.g. Moniepoint MFB"
                      onChange={(e) => setAdminSettings({ ...adminSettings, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={adminSettings.accountNumber || ''}
                      placeholder="e.g. 1855365255"
                      onChange={(e) => setAdminSettings({ ...adminSettings, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-space text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={adminSettings.accountName || ''}
                      placeholder="e.g. DataAbeg VTU Ventures"
                      onChange={(e) => setAdminSettings({ ...adminSettings, accountName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Support WhatsApp Line
                </label>
                <input
                  type="text"
                  value={adminSettings.supportPhone || '08154276838'}
                  onChange={(e) => setAdminSettings({ ...adminSettings, supportPhone: e.target.value })}
                  className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 outline-none"
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] shadow-md shadow-indigo-600/20 text-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settlement Details</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 6: PRICING & PROFIT MATRIX ================= */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* 1. Header & Summary Stats */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-space flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#4f46e5]" />
                    <span>Data Bundles Pricing &amp; Profit Matrix</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Live wholesale API costs, selling rates, net profit margins per unit, commercial bank comparisons, and realized profit.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-space">
                    Avg Margin: {avgPlanMargin}%
                  </span>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-[#4f46e5] border border-indigo-200 font-space">
                    {CURATED_DATA_PLANS.length} Active Bundles
                  </span>
                </div>
              </div>

              {/* 4 Quick Stat Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Profit / Bundle</div>
                  <div className="text-lg font-black text-emerald-600 font-space mt-1">+₦{avgPlanProfit}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Across all 4 networks</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Net Profit Plan</div>
                  <div className="text-lg font-black text-slate-900 font-space mt-1">+₦{topProfitPlan?.profitPerUnit.toLocaleString()}</div>
                  <div className="text-[10px] text-indigo-600 font-semibold truncate mt-0.5">{topProfitPlan?.name}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Margin % Plan</div>
                  <div className="text-lg font-black text-indigo-600 font-space mt-1">{topMarginPlan?.marginPercent}%</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{topMarginPlan?.name}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Realized Profit</div>
                  <div className="text-lg font-black text-emerald-600 font-space mt-1">+{formatCurrency(totalCatalogRealizedProfit)}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">From live orders</div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Daily Profit Goal Simulator */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Data Sales &amp; Net Profit Simulator</h3>
                    <p className="text-[11px] text-indigo-200/70">Forecast your profit margins based on daily transaction volume.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                  <label htmlFor="simOrdersInput" className="text-xs text-indigo-200">Daily Sales Target:</label>
                  <input
                    id="simOrdersInput"
                    type="number"
                    min="1"
                    max="10000"
                    value={simDailyOrders}
                    onChange={(e) => setSimDailyOrders(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-0.5 rounded-lg bg-black/40 border border-white/20 text-center font-space font-bold text-sm text-emerald-400 outline-none"
                  />
                  <span className="text-xs text-indigo-200">orders/day</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={simDailyOrders}
                  onChange={(e) => setSimDailyOrders(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-indigo-300 font-mono">
                  <span>5 orders/day</span>
                  <span>100 orders/day</span>
                  <span>500 orders/day</span>
                  <span>1,000 orders/day</span>
                </div>
              </div>

              {/* Projected Figures */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-indigo-300 uppercase font-semibold">Daily Net Profit</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 font-space mt-1">
                    +₦{(simDailyOrders * avgPlanProfit).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-indigo-200/60 mt-0.5">₦{(simDailyOrders * 820).toLocaleString()} volume</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-indigo-300 uppercase font-semibold">Weekly Net Profit (7d)</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 font-space mt-1">
                    +₦{(simDailyOrders * avgPlanProfit * 7).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-indigo-200/60 mt-0.5">{(simDailyOrders * 7).toLocaleString()} orders</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-indigo-300 uppercase font-semibold">Monthly Net Profit (30d)</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 font-space mt-1">
                    +₦{(simDailyOrders * avgPlanProfit * 30).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-indigo-200/60 mt-0.5">{(simDailyOrders * 30).toLocaleString()} orders</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-indigo-300 uppercase font-semibold">Annual Projected Net (1yr)</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 font-space mt-1">
                    +₦{(simDailyOrders * avgPlanProfit * 365).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-indigo-200/60 mt-0.5">{(simDailyOrders * 365).toLocaleString()} orders</div>
                </div>
              </div>
            </div>

            {/* 3. Search & Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pricingSearch}
                  onChange={(e) => setPricingSearch(e.target.value)}
                  placeholder="Search plan by size, name, or code..."
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#4f46e5] font-space"
                />
              </div>

              {/* Telco Tabs */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {(['ALL', 'MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const).map((net) => (
                  <button
                    key={net}
                    onClick={() => setPricingNetwork(net)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      pricingNetwork === net
                        ? 'bg-[#4f46e5] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {net === 'ALL' ? 'All Networks' : net}
                  </button>
                ))}
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort by:</span>
                <select
                  value={pricingSort}
                  onChange={(e) => setPricingSort(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 outline-none cursor-pointer"
                >
                  <option value="PROFIT_DESC">Highest Profit (₦)</option>
                  <option value="MARGIN_DESC">Highest Margin (%)</option>
                  <option value="PRICE_ASC">Lowest Selling Price</option>
                  <option value="PRICE_DESC">Highest Selling Price</option>
                  <option value="NAME_ASC">Plan Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* 4. Full Pricing & Profit Matrix Table */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3.5">Network</th>
                      <th className="px-4 py-3.5">Data Bundle</th>
                      <th className="px-4 py-3.5">Size &amp; Validity</th>
                      <th className="px-4 py-3.5">API Cost (Wholesale)</th>
                      <th className="px-4 py-3.5">Our Selling Price</th>
                      <th className="px-4 py-3.5 text-center">Net Profit / Unit</th>
                      <th className="px-4 py-3.5 text-center">Margin %</th>
                      <th className="px-4 py-3.5">Bank Rate</th>
                      <th className="px-4 py-3.5">Customer Savings</th>
                      <th className="px-4 py-3.5 text-right">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlans.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400">
                          No data bundles matched your search.
                        </td>
                      </tr>
                    ) : (
                      filteredPlans.map((plan) => {
                        const isTopProfit = plan.id === topProfitPlan?.id;
                        const isTopMargin = plan.id === topMarginPlan?.id;

                        return (
                          <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Network */}
                            <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <NetworkLogo network={plan.networkName} size={20} roundedClassName="rounded-md" />
                                <span>{plan.networkName}</span>
                              </div>
                            </td>

                            {/* Plan Name & Category Badge */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800">{plan.name}</span>
                                {isTopProfit && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold flex items-center gap-0.5">
                                    <Award className="w-2.5 h-2.5" /> Top Profit
                                  </span>
                                )}
                                {isTopMargin && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[9px] font-extrabold flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5" /> Best Margin
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Plan ID: <span className="font-mono">{plan.planId}</span> • <span className="font-semibold text-slate-500">{plan.categoryLabel}</span>
                              </div>
                            </td>

                            {/* Size & Validity */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="font-bold text-slate-900 font-space">{plan.size}</div>
                              <div className="text-[10px] text-slate-500">{plan.validity}</div>
                            </td>

                            {/* API Cost Price */}
                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-600 font-medium">
                              ₦{plan.costPrice.toLocaleString()}
                            </td>

                            {/* Selling Price */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="font-black text-[#4f46e5] font-space text-sm">
                                ₦{plan.sellingPrice.toLocaleString()}
                              </span>
                            </td>

                            {/* Net Profit per Unit */}
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold font-space text-xs border border-emerald-200/60 shadow-2xs">
                                +₦{plan.profitPerUnit.toLocaleString()}
                              </span>
                            </td>

                            {/* Margin % */}
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                                plan.marginPercent >= 18
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : plan.marginPercent >= 12
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {plan.marginPercent}%
                              </span>
                            </td>

                            {/* Bank Rate */}
                            <td className="px-4 py-3.5 text-slate-400 line-through font-space whitespace-nowrap">
                              ₦{plan.bankPrice.toLocaleString()}
                            </td>

                            {/* Customer Savings */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="text-emerald-600 font-bold font-space text-xs">
                                Save ₦{plan.customerSaving.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {plan.customerSavingPercent}% cheaper than bank
                              </div>
                            </td>

                            {/* Units Sold & Realized Profit */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="font-extrabold text-slate-900 font-space">
                                {plan.unitsSold} sold
                              </div>
                              <div className="text-[10px] text-emerald-600 font-bold font-space">
                                {plan.realizedProfit > 0 ? `+₦${plan.realizedProfit.toLocaleString()} profit` : 'No orders yet'}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: LIVE CUSTOMER SUPPORT DESK ================= */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-2xs overflow-hidden">
            {/* Support Header Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 font-space">Live Customer Support Desk</h2>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Respond to customer inquiries in real-time. Sound and desktop push notifications alert you to new messages.
                </p>
              </div>

              {/* Notification & Sound Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => playSupportNotificationSound()}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Test notification sound chime"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Test Chime</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestNotifications}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    notificationsGranted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#4f46e5] text-white hover:bg-indigo-700'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{notificationsGranted ? 'Push Alerts Active' : 'Enable Desktop Alerts'}</span>
                </button>
              </div>
            </div>

            {/* Split Screen Support View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
              {/* Left Column: Conversations List */}
              <div className="lg:col-span-4 border-r border-slate-200/80 flex flex-col bg-slate-50/30">
                {/* Search & Filter */}
                <div className="p-3.5 border-b border-slate-200/80 space-y-2.5 bg-white">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={supportSearch}
                      onChange={(e) => setSupportSearch(e.target.value)}
                      placeholder="Search customer email, name, phone..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5]"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <button
                      onClick={() => setSupportStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        supportStatusFilter === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({supportConversations.length})
                    </button>
                    <button
                      onClick={() => setSupportStatusFilter('open')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        supportStatusFilter === 'open'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Open ({supportConversations.filter((c) => c.status !== 'resolved').length})
                    </button>
                    <button
                      onClick={() => setSupportStatusFilter('resolved')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        supportStatusFilter === 'resolved'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Resolved ({supportConversations.filter((c) => c.status === 'resolved').length})
                    </button>
                  </div>
                </div>

                {/* Conversation Cards */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
                  {filteredSupportConversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No conversations yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        When customers ask questions in the support chat, their threads appear here instantly.
                      </p>
                    </div>
                  ) : (
                    filteredSupportConversations.map((c) => {
                      const isSelected = c.id === selectedChatId;
                      const hasUnread = (c.unreadAdmin || 0) > 0;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedChatId(c.id)}
                          className={`w-full p-4 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-indigo-50/80 border-l-4 border-[#4f46e5]'
                              : 'hover:bg-white border-l-4 border-transparent'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center font-bold text-xs shrink-0 font-space">
                            {(c.userName || 'U').slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {c.userName || 'Customer'}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                              {c.userEmail || c.id}
                            </p>

                            <p className="text-xs text-slate-600 line-clamp-1 mt-1 font-sans">
                              {c.lastMessage || 'Started conversation'}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  c.status === 'resolved'
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {c.status || 'open'}
                              </span>

                              {hasUnread && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                                  {c.unreadAdmin} new
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat Room & Reply Desk */}
              <div className="lg:col-span-8 flex flex-col bg-white">
                {selectedChatId && selectedConversation ? (
                  <>
                    {/* Customer Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {selectedConversation.userName || 'Customer'}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">
                            ({selectedConversation.userEmail || selectedConversation.id})
                          </span>
                        </div>

                        {/* Customer Live Context */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>
                            Wallet Balance:{' '}
                            <strong className="text-slate-800 font-space">
                              ₦{(selectedUserRecord?.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Total Purchases:{' '}
                            <strong className="text-slate-800 font-space">{selectedUserOrders.length} orders</strong>
                          </span>
                        </div>
                      </div>

                      {/* Status Toggle Button */}
                      <div className="flex items-center gap-2">
                        {selectedConversation.status === 'resolved' ? (
                          <button
                            type="button"
                            onClick={() => setSupportConversationStatus(selectedChatId, 'open')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            Reopen Ticket
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSupportConversationStatus(selectedChatId, 'resolved')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 max-h-[460px] min-h-[380px] bg-slate-50/20">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <p className="text-xs">No messages in this conversation thread yet.</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isAdmin = msg.sender === 'admin';

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="text-[11px] font-bold text-slate-700">
                                  {isAdmin ? 'DataAbeg Support' : selectedConversation.userName || 'Customer'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>

                              <div
                                className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                  isAdmin
                                    ? 'bg-[#4f46e5] text-white rounded-tr-xs shadow-xs'
                                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                              </div>

                              {isAdmin && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                                  <CheckCheck className="w-3 h-3 text-[#4f46e5]" />
                                  <span>Delivered</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Reply Presets */}
                    <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
                      <span className="text-slate-400 font-bold shrink-0">Quick:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickReply('Hello! Your payment was verified and your data bundle was delivered.')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                      >
                        Payment confirmed &amp; delivered
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReply('Please dial *323# or *312# to check your data balance on your device.')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                      >
                        Check balance USSD
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReply('Kindly provide the phone number and carrier you recharged.')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                      >
                        Request phone &amp; carrier
                      </button>
                    </div>

                    {/* Input Composer */}
                    <form onSubmit={handleSendAdminReply} className="p-4 border-t border-slate-200/80 bg-white">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your support reply... (Press Enter to send)"
                          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5]"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim() || isSendingReply}
                          className="px-4 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingReply ? 'Sending...' : 'Send'}</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Support Chat Desk</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                      Select a customer thread from the left panel to review chat history, answer questions, and solve customer issues in real time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= WALLET CREDIT / DEBIT MODAL ================= */}
      {selectedUserForAdjustment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Adjust Customer Wallet</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedUserForAdjustment.email || selectedUserForAdjustment.displayName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForAdjustment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustUserBalance} className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Wallet Balance:</p>
                <p className="text-xl font-black text-slate-900 font-space">
                  ₦{(selectedUserForAdjustment.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Action Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'CREDIT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Credit (+ Fund)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'DEBIT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Debit (- Deduct)</span>
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount to {adjustType} (₦)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-space font-bold text-slate-900 outline-none focus:bg-white focus:border-[#4f46e5]"
                  required
                  autoFocus
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Offline bank transfer deposit received"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#4f46e5]"
                  required
                />
              </div>

              {adjustSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adjustSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAdjustment(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjustment}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                    adjustType === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingAdjustment ? 'Executing...' : `Confirm ${adjustType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
