import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface SupportMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'admin';
  senderName: string;
  senderEmail?: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadAdmin: number;
  unreadUser: number;
  status: 'open' | 'resolved';
}

const LOCAL_STORAGE_CONVERSATIONS_KEY = 'dataabeg_support_conversations';
const LOCAL_STORAGE_MESSAGES_PREFIX = 'dataabeg_support_msgs_';

/**
 * Play a friendly native synthesizer chime (zero audio file downloads required)
 */
export function playSupportNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant 2-step upward ping (E5 -> B5)
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch (_) {}
}

/**
 * Trigger native browser push notification
 */
export async function triggerNativeNotification(title: string, body: string): Promise<void> {
  playSupportNotificationSound();

  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg'
      });
    } catch (_) {}
  } else if (Notification.permission === 'default') {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg'
        });
      }
    } catch (_) {}
  }
}

/**
 * Request desktop & mobile browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

/**
 * Send a support message
 */
export async function sendSupportMessage(
  chatId: string,
  text: string,
  sender: 'user' | 'admin',
  senderName: string,
  senderEmail?: string
): Promise<SupportMessage> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const newMessage: SupportMessage = {
    id: msgId,
    chatId,
    sender,
    senderName,
    senderEmail: senderEmail || '',
    text: text.trim(),
    timestamp: nowIso,
    read: false
  };

  // 1. Immediately store in localStorage so UI is instantaneous
  if (typeof window !== 'undefined') {
    try {
      const storageKey = LOCAL_STORAGE_MESSAGES_PREFIX + chatId;
      const cached = localStorage.getItem(storageKey);
      const list: SupportMessage[] = cached ? JSON.parse(cached) : [];
      list.push(newMessage);
      localStorage.setItem(storageKey, JSON.stringify(list));

      // Update cached conversations list
      const convos = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      let cList: SupportConversation[] = convos ? JSON.parse(convos) : [];
      const existingIdx = cList.findIndex((c) => c.id === chatId);
      const updatedConvo: SupportConversation = {
        id: chatId,
        userId: chatId,
        userName: sender === 'user' ? senderName : cList[existingIdx]?.userName || 'Customer',
        userEmail: senderEmail || cList[existingIdx]?.userEmail || '',
        lastMessage: newMessage.text,
        lastMessageTime: nowIso,
        unreadAdmin: sender === 'user' ? ((cList[existingIdx]?.unreadAdmin || 0) + 1) : 0,
        unreadUser: sender === 'admin' ? ((cList[existingIdx]?.unreadUser || 0) + 1) : 0,
        status: 'open'
      };

      if (existingIdx >= 0) {
        cList[existingIdx] = updatedConvo;
      } else {
        cList.unshift(updatedConvo);
      }
      localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(cList));
    } catch (_) {}
  }

  // 2. Persist to Firestore
  try {
    const convoRef = doc(db, 'support_conversations', chatId);
    const msgRef = doc(db, 'support_conversations', chatId, 'messages', msgId);

    await Promise.all([
      setDoc(msgRef, newMessage),
      setDoc(
        convoRef,
        {
          id: chatId,
          userId: chatId,
          userName: sender === 'user' ? senderName : 'Customer',
          userEmail: senderEmail || '',
          lastMessage: newMessage.text,
          lastMessageTime: nowIso,
          status: 'open',
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )
    ]);
  } catch (err) {
    console.warn('Notice: Support chat Firestore write fallback:', err);
  }

  return newMessage;
}

/**
 * Subscribe to messages in a specific conversation
 */
export function subscribeToSupportMessages(
  chatId: string,
  callback: (messages: SupportMessage[]) => void
): () => void {
  // Initial local render
  if (typeof window !== 'undefined') {
    try {
      const storageKey = LOCAL_STORAGE_MESSAGES_PREFIX + chatId;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch (_) {}
  }

  try {
    const msgsCol = collection(db, 'support_conversations', chatId, 'messages');
    const q = query(msgsCol, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SupportMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SupportMessage);
        });

        if (list.length > 0) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_MESSAGES_PREFIX + chatId, JSON.stringify(list));
            } catch (_) {}
          }
          callback(list);
        }
      },
      (err: any) => {
        if (err?.code === 'permission-denied') {
          console.info('Firestore: support messages locked by security rules. Publish firestore.rules in Firebase Console.');
        } else {
          console.warn('Firestore support messages snapshot fallback:', err?.message || err);
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to messages:', err);
    return () => {};
  }
}

/**
 * Subscribe to all conversations (for Admin Support Portal)
 */
export function subscribeToAllSupportConversations(
  callback: (conversations: SupportConversation[]) => void
): () => void {
  // Initial local render
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch (_) {}
  }

  try {
    const convosCol = collection(db, 'support_conversations');
    const q = query(convosCol, orderBy('lastMessageTime', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SupportConversation[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SupportConversation);
        });

        if (list.length > 0) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(list));
            } catch (_) {}
          }
          callback(list);
        }
      },
      (err: any) => {
        if (err?.code === 'permission-denied') {
          console.info('Firestore: support conversations locked by security rules. Publish firestore.rules in Firebase Console.');
        } else {
          console.warn('Firestore conversations snapshot fallback:', err?.message || err);
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to conversations:', err);
    return () => {};
  }
}

/**
 * Mark a conversation as read by admin
 */
export async function markSupportConversationReadByAdmin(chatId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const convos = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      if (convos) {
        const list: SupportConversation[] = JSON.parse(convos);
        const idx = list.findIndex((c) => c.id === chatId);
        if (idx >= 0) {
          list[idx].unreadAdmin = 0;
          localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(list));
        }
      }
    } catch (_) {}
  }

  try {
    const convoRef = doc(db, 'support_conversations', chatId);
    await updateDoc(convoRef, { unreadAdmin: 0 });
  } catch (_) {}
}

/**
 * Update conversation status (open / resolved)
 */
export async function setSupportConversationStatus(
  chatId: string,
  status: 'open' | 'resolved'
): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const convos = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY);
      if (convos) {
        const list: SupportConversation[] = JSON.parse(convos);
        const idx = list.findIndex((c) => c.id === chatId);
        if (idx >= 0) {
          list[idx].status = status;
          localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(list));
        }
      }
    } catch (_) {}
  }

  try {
    const convoRef = doc(db, 'support_conversations', chatId);
    await updateDoc(convoRef, { status });
  } catch (_) {}
}

