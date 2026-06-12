import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
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
  const sessionRef = doc(db, 'chatSessions', sessionId);
  const messagesRef = collection(sessionRef, 'messages');

  // save session metadata
  const { setDoc } = await import('firebase/firestore');
  await setDoc(sessionRef, {
    specialty,
    preview: getPreview(messages),
    messageCount: messages.length,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });

  // save each message
  for (const m of messages) {
    if (m.id === 'welcome') continue; // skip welcome message
    const text = extractText(m);
    if (!text.trim()) continue;

    const { setDoc: setDocMsg } = await import('firebase/firestore');
    const msgRef = doc(messagesRef, m.id);
    await setDocMsg(msgRef, {
      role: m.role,
      content: text,
      createdAt: serverTimestamp(),
    });
  }
}

// load all chat sessions for sidebar
export async function loadChatSessions(): Promise<ChatSession[]> {
  const q = query(
    collection(db, 'chatSessions'),
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
export async function loadSessionMessages(sessionId: string): Promise<SavedMessage[]> {
  const messagesRef = collection(db, 'chatSessions', sessionId, 'messages');
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
  await deleteDoc(doc(db, 'chatSessions', sessionId));
}

// helpers
function extractText(m: any): string {
  // v6 format — parts array
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p: any) => p?.type === 'text')
      .map((p: any) => p?.text ?? '')
      .join('');
  }
  // plain string content
  if (typeof m.content === 'string') return m.content;
  // content array format
  if (Array.isArray(m.content)) {
    return m.content
      .filter((p: any) => p?.type === 'text')
      .map((p: any) => p?.text ?? '')
      .join('');
  }
  return '';
}

function getPreview(messages: any[]): string {
  const first = messages.find((m) => m.role === 'user' && m.id !== 'welcome');
  if (!first) return 'New conversation';
  const text = extractText(first);
  return text.length > 60 ? text.slice(0, 60) + '...' : text;
}