'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveChatSession,
  loadChatSessions,
  loadSessionMessages,
  deleteChatSession,
  ChatSession,
  SavedMessage,
} from '@/lib/chatHistory';
import { Specialty } from './useClinicChat';

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fetchedRef = useRef(false); // prevent double fetch

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingHistory(true);
    try {
      const data = await loadChatSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveSession = useCallback(async (
    sessionId: string,
    specialty: Specialty,
    messages: any[]
  ) => {
    if (messages.length <= 1) return;
    try {
      await saveChatSession(sessionId, specialty, messages);
      // update sessions list locally without refetching
      setSessions(prev => {
        const exists = prev.find(s => s.id === sessionId);
        const updated: ChatSession = {
          id: sessionId,
          specialty,
          preview: messages.find(m => m.role === 'user' && m.id !== 'welcome')
            ? (messages.find(m => m.role === 'user' && m.id !== 'welcome').content?.slice(0, 60) ?? 'Conversation')
            : 'New conversation',
          messageCount: messages.length,
          createdAt: exists?.createdAt ?? new Date(),
        };
        if (exists) {
          return prev.map(s => s.id === sessionId ? updated : s);
        }
        return [updated, ...prev];
      });
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, []);

  const loadSession = useCallback(async (
    sessionId: string
  ): Promise<SavedMessage[]> => {
    try {
      return await loadSessionMessages(sessionId);
    } catch (e) {
      console.error('Failed to load session:', e);
      return [];
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  }, []);

  return {
    sessions,
    loadingHistory,
    saveSession,
    loadSession,
    deleteSession,
    refreshSessions: fetchSessions,
  };
}