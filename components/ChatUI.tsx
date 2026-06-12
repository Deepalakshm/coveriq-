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
  className="
    opacity-0
    group-hover:opacity-100
    transition-all
    duration-200
    flex
    items-center
    gap-1.5
    text-sm
    text-slate-500
    hover:text-[#1D9E75]
    mt-2
    ml-11
  "
>
      <>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
  <span>{copied ? 'Copied' : 'Copy'}</span>
</>
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
   <div className="flex flex-col h-screen" style={{ background: '#F8FAFC' }}>

      {/* Header */}
    <header
  className="h-[82px] px-6 flex items-center gap-3 border-b"
  style={{
    background: '#fff',
    borderColor: '#E2E8F0',
    boxShadow: '0 1px 8px rgba(15,23,42,0.04)',
  }}
>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
          style={{
  background: '#1D9E75',
  color: '#FFFFFF',
}}>
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

  <div className="relative">
    <select
      value={specialty}
      onChange={(e) => setSpecialty(e.target.value as Specialty)}
      className="
        appearance-none
        cursor-pointer
        rounded-xl
        border
        pl-4
        pr-10
        py-2.5
        text-sm
        font-medium
        transition-all
        hover:border-slate-400
        focus:outline-none
        focus:ring-2
      "
     style={{
  background: '#FFFFFF',
  color: '#0C1B33',
  border: '1px solid #E2E8F0',
  minWidth: '220px',
  height: '44px',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
}}
    >
      {SPECIALTIES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>

    {/* Premium Dropdown Arrow */}
    <svg
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#64748B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
</div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-4 max-w-4xl w-full mx-auto hide-scrollbar">
        {messages.map((m: any, idx: number) => (
          <div key={m.id} className="group">

            {/* AI message */}
            {m.role === 'assistant' && (
              <>
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
  background: '#1D9E75',
  color: '#FFFFFF',
}}>
                    C
                  </div>
                  <div className="max-w-lg px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                    style={{
  background: '#FFFFFF',
  color: '#1E293B',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}}>
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
              style={{
  background: '#1D9E75',
  color: '#FFFFFF',
}}>
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
      <div
  className="px-4 py-4 border-t"
  style={{
    background: '#fff',
    borderColor: '#E2E8F0',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
  }}
>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
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
  background: '#FFFFFF',
  color: '#0C1B33',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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
  className="
    px-6 py-3 rounded-xl text-sm font-semibold
    transition-all duration-200
    disabled:opacity-50
    disabled:cursor-not-allowed
    hover:brightness-95
  "
  style={{
    background: '#1D9E75',
    color: '#FFFFFF',
    minWidth: '100px',
  }}
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