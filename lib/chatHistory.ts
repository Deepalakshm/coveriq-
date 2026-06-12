import { db } from './firebase';
import { getUserId } from './userId';
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

export interface SavedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  specialty: string;
  preview: string;
  createdAt: Date;
  messageCount: number;
}

// save a full chat session
export async function saveChatSession(
  sessionId: string,
  specialty: string,
  messages: any[]
): Promise<void> {
  const userId = getUserId();
  const sessionRef = doc(db, 'users', userId, 'chatSessions', sessionId);
  const messagesRef = collection(sessionRef, 'messages');

  await setDoc(sessionRef, {
    specialty,
    preview: getPreview(messages),
    messageCount: messages.length,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });

  for (const m of messages) {
    if (m.id === 'welcome') continue;
    const text = extractText(m);
    if (!text.trim()) continue;
    const msgRef = doc(messagesRef, m.id);
    await setDoc(msgRef, {
      role: m.role,
      content: text,
      createdAt: serverTimestamp(),
    });
  }
}

// load all chat sessions for sidebar
export async function loadChatSessions(): Promise<ChatSession[]> {
  const userId = getUserId();
  const q = query(
    collection(db, 'users', userId, 'chatSessions'),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    specialty: d.data().specialty,
    preview: d.data().preview,
    messageCount: d.data().messageCount,
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  }));
}

// load messages for a specific session
export async function loadSessionMessages(
  sessionId: string
): Promise<SavedMessage[]> {
  const userId = getUserId();
  const messagesRef = collection(
    db, 'users', userId, 'chatSessions', sessionId, 'messages'
  );
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    role: d.data().role,
    content: d.data().content,
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  }));
}

// delete a session
export async function deleteChatSession(sessionId: string): Promise<void> {
  const userId = getUserId();
  await deleteDoc(doc(db, 'users', userId, 'chatSessions', sessionId));
}

// ── helpers ──────────────────────────────────────────

function extractText(m: any): string {
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p: any) => p?.type === 'text')
      .map((p: any) => p?.text ?? '')
      .join('');
  }
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.content)) {
    return m.content
      .filter((p: any) => p?.type === 'text')
      .map((p: any) => p?.text ?? '')
      .join('');
  }
  return '';
}

function getPreview(messages: any[]): string {
  const first = messages.find(
    (m) => m.role === 'user' && m.id !== 'welcome'
  );
  if (!first) return 'New conversation';
  const text = extractText(first);
  return text.length > 60 ? text.slice(0, 60) + '...' : text;
}