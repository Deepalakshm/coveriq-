'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { SavedMessage } from '@/lib/chatHistory';

export type Specialty = 'Health Insurance' | 'Motor Insurance' | 'Life Insurance' | 'Travel Insurance';
export type Language = 'English' | 'Tamil';

export function useClinicChat(restoredMessages: SavedMessage[] = []) {
  const [specialty, setSpecialty] = useState<Specialty>('Health Insurance');
  const [language, setLanguage] = useState<Language>('English');
  const [input, setInput] = useState('');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const specialtyRef = useRef(specialty);
  const languageRef = useRef(language);

  const handleSetSpecialty = (s: Specialty) => {
    specialtyRef.current = s;
    setSpecialty(s);
  };

  const handleSetLanguage = (l: Language) => {
    languageRef.current = l;
    setLanguage(l);
  };

  const options = {
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({
        specialty: specialtyRef.current,
        language: languageRef.current,
      }),
    }),
  };

  const chat = useChat(options as any) as any;
  const { messages, setMessages, sendMessage, status, error, stop } = chat;

  useEffect(() => {
    if (restoredMessages.length === 0) return;
    const formatted = restoredMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      parts: [{ type: 'text', text: m.content }],
    }));
    setMessages(formatted);
  }, []);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setRateLimitError(null);
    sendMessage({ text: input });
    setInput('');
  };

  const sendQuickReply = (text: string) => {
    if (isLoading) return;
    setRateLimitError(null);
    sendMessage({ text });
  };

const welcomeText = language === 'Tamil'
  ? `வணக்கம்! நான் CoverIQ-இன் ${
      specialty === 'Health Insurance' ? 'சுகாதார காப்பீடு' :
      specialty === 'Motor Insurance'  ? 'வாகன காப்பீடு' :
      specialty === 'Life Insurance'   ? 'ஆயுள் காப்பீடு' :
      'பயண காப்பீடு'
    } உதவியாளர். இன்று உங்களுக்கு எவ்வாறு உதவலாம்?`
  : `Hello! I'm your ${specialty} assistant at CoverIQ. How can I help you today?`;

  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: welcomeText }],
    content: welcomeText,
  };

// show chips when no real conversation yet — welcome message is index 0
// so messages from useChat (not counting welcome) should be empty
const showQuickReplies = messages.length === 0;

  return {
    messages: [welcomeMessage, ...messages],
    input,
    handleInputChange,
    handleSubmit,
    sendQuickReply,
    showQuickReplies,
    isLoading,
    stop,
    error,
    rateLimitError,
    specialty,
    setSpecialty: handleSetSpecialty,
    language,
    setLanguage: handleSetLanguage,
  };
}