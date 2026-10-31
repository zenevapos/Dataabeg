'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare,
  X,
  Send,
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  Headphones,
  ShieldCheck,
  ChevronDown,
  Minimize2
} from 'lucide-react';
import {
  SupportMessage,
  sendSupportMessage,
  subscribeToSupportMessages,
  triggerNativeNotification,
  requestNotificationPermission
} from '@/lib/supportChat';

export default function SupportChatWidget() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [incomingToast, setIncomingToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesCountRef = useRef(0);

  // Determine chatId
  const [chatId, setChatId] = useState<string>('');

  useEffect(() => {
    let activeId = user?.uid;
    if (!activeId && typeof window !== 'undefined') {
      let storedGuestId = localStorage.getItem('dataabeg_guest_chat_id');
      if (!storedGuestId) {
        storedGuestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        localStorage.setItem('dataabeg_guest_chat_id', storedGuestId);
      }
      activeId = storedGuestId;
    }
    setChatId(activeId || 'guest_user');

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, [user]);

  // Listen to open-support-chat event from anywhere in the app
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setUnreadCount(0);
    };
    window.addEventListener('open-support-chat', handleOpen);
    return () => window.removeEventListener('open-support-chat', handleOpen);
  }, []);

  // Subscribe to real-time messages for this chatId
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToSupportMessages(chatId, (newMsgs) => {
      // Check if new admin reply arrived
      if (newMsgs.length > previousMessagesCountRef.current && previousMessagesCountRef.current > 0) {
        const latest = newMsgs[newMsgs.length - 1];
        if (latest.sender === 'admin') {
          triggerNativeNotification('DataAbeg Support Team', latest.text);
          setIncomingToast(`Support: ${latest.text.slice(0, 75)}...`);
          setTimeout(() => setIncomingToast(null), 5000);
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      }

      previousMessagesCountRef.current = newMsgs.length;
      setMessages(newMsgs);
    });

    return () => unsubscribe();
  }, [chatId, isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    const senderName = profile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Customer');
    const senderEmail = user?.email || profile?.email || '';

    await sendSupportMessage(chatId, textToSend, 'user', senderName, senderEmail);
  };

  const handleQuickQuestion = (q: string) => {
    setInputText(q);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    if (granted) {
      triggerNativeNotification('DataAbeg Alerts Enabled', 'You will receive instant native notifications when support replies.');
    }
  };

  return (
    <>
      {/* Incoming Message Notification Toast Banner */}
      {incomingToast && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
            setIncomingToast(null);
          }}
          className="fixed bottom-24 right-5 z-50 max-w-sm bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center gap-3 cursor-pointer animate-in fade-in slide-in-from-bottom-4 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-indigo-300">New Reply from Support</div>
            <div className="text-xs truncate text-slate-200">{incomingToast}</div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-5 z-40">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setUnreadCount(0);
          }}
          className="relative group flex items-center gap-2.5 px-4 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-full shadow-lg hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer"
          title="Live Customer Support"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
          </div>

          <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">
            Need Help?
          </span>

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] shadow-sm animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4f46e5] to-indigo-700 text-white p-4 px-5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-700"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">DataAbeg Support</h3>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • Avg reply: &lt;2 mins</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Alert Opt-in Banner */}
          {!hasPermission && (
            <div className="bg-indigo-50/80 px-4 py-2 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-medium">Enable instant reply alerts</span>
              </div>
              <button
                onClick={handleEnableNotifications}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs">
            {/* Welcome Bot Bubble */}
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-[#4f46e5]/10 flex items-center justify-center shrink-0 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-slate-200/80 text-slate-800 shadow-2xs space-y-1.5">
                <p className="font-semibold text-slate-900">
                  👋 Hello {profile?.displayName ? profile.displayName.split(' ')[0] : 'there'}! Welcome to DataAbeg.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  How can we assist you today? You can type your order reference, ask about wallet top-ups, or report carrier network issues.
                </p>
              </div>
            </div>

            {/* Quick Suggestions (Rendered when message list is small) */}
            {messages.length <= 1 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                  Common Topics
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleQuickQuestion('My data order is pending, can you check delivery?')}
                    className="text-left p-2 px-3 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 text-slate-700 hover:border-indigo-200 transition-colors cursor-pointer text-xs font-medium"
                  >
                    ⚡ Check delivery status of my order
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('How do I top up my wallet with Paystack?')}
                    className="text-left p-2 px-3 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 text-slate-700 hover:border-indigo-200 transition-colors cursor-pointer text-xs font-medium"
                  >
                    💳 How to fund my wallet
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('I made a mistake in the phone number, can I rectify it?')}
                    className="text-left p-2 px-3 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 text-slate-700 hover:border-indigo-200 transition-colors cursor-pointer text-xs font-medium"
                  >
                    📱 Rectify wrong phone number
                  </button>
                </div>
              </div>
            )}

            {/* Live Message History */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl shadow-2xs text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#4f46e5] text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs'
                    }`}
                  >
                    {!isUser && (
                      <div className="text-[10px] font-bold text-[#4f46e5] mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#4f46e5]" />
                        <span>Support Agent</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono px-1">
                    <span>{timeFormatted}</span>
                    {isUser && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-[#4f46e5] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
