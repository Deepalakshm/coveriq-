'use client';

import { useState, useCallback } from 'react';
import ChatUI from '@/components/ChatUI';
import ChatSidebar from '@/components/ChatSidebar';
import { useChatHistory } from '@/hooks/useChatHistory';
import { SavedMessage } from '@/lib/chatHistory';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(generateSessionId);
  const [restoredMessages, setRestoredMessages] = useState<SavedMessage[]>([]);

  const {
    sessions,
    loadingHistory,
    saveSession,
    loadSession,
    deleteSession,
  } = useChatHistory();

  const handleNewChat = useCallback(() => {
    const newId = generateSessionId();
    setSessionId(newId);
    setRestoredMessages([]);   // clear restored messages
  }, []);

  const handleSelectSession = useCallback(async (id: string) => {
  if (id === sessionId) return;
  const msgs = await loadSession(id);   // fetch first
  setRestoredMessages(msgs);            // set messages
  setSessionId(id);                     // THEN change id — triggers remount with data ready
}, [loadSession, sessionId]);

  const handleSaveSession = useCallback((specialty: string, messages: any[]) => {
    saveSession(sessionId, specialty as any, messages);
  }, [sessionId, saveSession]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        loadingHistory={loadingHistory}
      />
      <div className="flex-1 min-w-0">
        <ChatUI
          key={sessionId}
          sessionId={sessionId}
          restoredMessages={restoredMessages}
          onSaveSession={handleSaveSession}
        />
      </div>
    </div>
  );
}