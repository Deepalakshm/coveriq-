'use client';

import { useClinicChat, Specialty, Language } from '@/hooks/useClinicChat';
import QuickReplies from '@/components/QuickReplies';
import MarkdownMessage from '@/components/MarkdownMessage';
import LanguageToggle from '@/components/languageToggle';
import { useEffect, useRef, useState } from 'react';
import { SavedMessage } from '@/lib/chatHistory';

const SPECIALTIES = [
  'Health Insurance',
  'Motor Insurance',
  'Life Insurance',
  'Travel Insurance',
];

interface ChatUIProps {
  sessionId: string;
  restoredMessages: SavedMessage[];
  onSaveSession: (specialty: string, messages: any[]) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1 ml-9"
    >
      {copied ? '✓ Copied!' : '⎘ Copy'}
    </button>
  );
}

function extractText(m: any): string {
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p: any) => p?.type === 'text' && p?.state !== 'step-start')
      .map((p: any) => p?.text ?? '')
      .join('');
  }
  if (typeof m.content === 'string') return m.content;
  return '';
}

export default function ChatUI({ sessionId, restoredMessages, onSaveSession }: ChatUIProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    sendQuickReply,
    showQuickReplies,
    isLoading,
    stop,
    rateLimitError,
    specialty,
    setSpecialty,
    language,
    setLanguage,
  } = useClinicChat(restoredMessages);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSavedLengthRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  setTimeout(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}, [messages]);

  useEffect(() => {
    if (messages.length <= 1) return;
    if (messages.length === lastSavedLengthRef.current) return;
    if (isLoading) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      lastSavedLengthRef.current = messages.length;
      onSaveSession(specialty, messages);
    }, 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [messages.length, isLoading]);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F4F6F9' }}>

      {/* Header */}
      <header className="px-5 py-3 flex items-center gap-3 border-b"
        style={{ background: '#fff', borderColor: '#E2E8F0' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
          style={{ background: '#0C1B33', color: '#1D9E75' }}>
          C
        </div>
        <div className="flex-1">
          <h1 className="font-semibold" style={{ color: '#0C1B33', fontSize: '15px' }}>CoverIQ</h1>
          <p className="flex items-center gap-1.5" style={{ fontSize: '11px', color: '#64748B' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#1D9E75' }}></span>
            Insurance Assistant · Online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle language={language} onChange={setLanguage} />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value as Specialty)}
            className="text-sm rounded-lg px-3 py-1.5 border focus:outline-none"
            style={{ borderColor: '#CBD5E1', color: '#0C1B33', background: '#F8FAFC' }}
          >
            {SPECIALTIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        {messages.map((m: any, idx: number) => (
          <div key={m.id} className="group">

            {/* AI message */}
            {m.role === 'assistant' && (
              <>
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: '#0C1B33', color: '#1D9E75' }}>
                    C
                  </div>
                  <div className="max-w-lg px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                    style={{ background: '#fff', color: '#1E293B', border: '0.5px solid #E2E8F0' }}>
                    <MarkdownMessage content={extractText(m)} />
                  </div>
                </div>
                <CopyButton text={extractText(m)} />

                {/* Quick reply chips below first message */}
                {idx === 0 && (
                  <QuickReplies
                    specialty={specialty as Specialty}
                    language={language}
                    onSelect={sendQuickReply}
                    visible={showQuickReplies}
                  />
                )}
              </>
            )}

            {/* User message */}
            {m.role === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-sm px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
                  style={{ background: '#0C1B33', color: '#E8F4F0' }}>
                  {extractText(m)}
                </div>
              </div>
            )}

          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
              style={{ background: '#0C1B33', color: '#1D9E75' }}>
              C
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center"
              style={{ background: '#fff', border: '0.5px solid #E2E8F0' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: '#94A3B8', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Rate limit error */}
      {rateLimitError && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2">
          <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{ background: '#FEF2F2', color: '#991B1B', border: '0.5px solid #FECACA' }}>
            ⚠ {rateLimitError}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t" style={{ background: '#fff', borderColor: '#E2E8F0' }}>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={
              isLoading
                ? language === 'Tamil' ? 'பதில் வருகிறது...' : 'Generating response...'
                : language === 'Tamil' ? 'உங்கள் கேள்வியை கேளுங்கள்...' : 'Ask about your policy, claims, coverage...'
            }
            disabled={isLoading}
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              color: '#0C1B33',
            }}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              style={{ background: '#1E293B', color: '#fff' }}
            >
              ■ Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-5 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: '#0C1B33', color: '#1D9E75' }}
            >
              {language === 'Tamil' ? 'அனுப்பு' : 'Send'}
            </button>
          )}
        </form>
        {isLoading && (
          <p className="text-center mt-2" style={{ fontSize: '11px', color: '#94A3B8' }}>
            {language === 'Tamil' ? 'பதில் உருவாக்கப்படுகிறது — நிறுத்த Stop அழுத்தவும்' : 'Generating response — click Stop to cancel'}
          </p>
        )}
      </div>

    </div>
  );
}