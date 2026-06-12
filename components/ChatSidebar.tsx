'use client';

import { ChatSession } from '@/lib/chatHistory';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  loadingHistory: boolean;
}

const SPECIALTY_COLORS: Record<string, { bg: string; color: string }> = {
  'Health Insurance':  { bg: '#1E3A5F', color: '#7EB8F7' },
  'Motor Insurance':   { bg: '#1A3A2A', color: '#5DCAA5' },
  'Life Insurance':    { bg: '#2D2458', color: '#AFA9EC' },
  'Travel Insurance':  { bg: '#3A2A10', color: '#FAC775' },
  'General Practice':  { bg: '#1E3A5F', color: '#7EB8F7' },
  'Dermatology':       { bg: '#3A1A2A', color: '#ED93B1' },
  'Mental Health':     { bg: '#2D2458', color: '#AFA9EC' },
};

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  loadingHistory,
}: ChatSidebarProps) {
  return (
    <aside
      className="w-64 flex flex-col h-screen flex-shrink-0"
      style={{ background: '#0C1B33' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3"
        style={{ borderBottom: '0.5px solid #1E3A5F' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
          style={{ background: '#1D9E75', color: '#fff' }}
        >
          C
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#E8F4F0' }}>CoverIQ</p>
          <p className="text-xs" style={{ color: '#4D7A8A' }}>Insurance Assistant</p>
        </div>
      </div>

      {/* New conversation button */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{ background: '#1D9E75', color: '#fff', border: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#0F6E56')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1D9E75')}
        >
          <span style={{ fontSize: '16px', fontWeight: 300 }}>+</span>
          New conversation
        </button>
      </div>

      {/* Section label */}
      {sessions.length > 0 && (
        <p className="px-4 pb-1 text-xs font-medium uppercase tracking-widest"
          style={{ color: '#2D5A70' }}>
          Recent
        </p>
      )}

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-4 h-4 rounded-full border-2 animate-spin"
              style={{ borderColor: '#1D9E75', borderTopColor: 'transparent' }} />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-xs py-8 px-4"
            style={{ color: '#2D5A70' }}>
            No conversations yet.<br />Start chatting!
          </p>
        ) : (
          <div className="flex flex-col gap-0.5 py-1">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const badge = SPECIALTY_COLORS[s.specialty] ?? { bg: '#1E3A5F', color: '#7EB8F7' };
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className="group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150"
                  style={{ background: isActive ? '#1E3A5F' : 'transparent' }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = '#162D47';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate"
                      style={{ color: isActive ? '#E8F4F0' : '#9DB8CC' }}>
                      {s.preview}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md"
                        style={{ background: badge.bg, color: badge.color, fontSize: '10px' }}
                      >
                        {s.specialty}
                      </span>
                      <span className="text-xs" style={{ color: '#2D5A70', fontSize: '10px' }}>
                        {s.createdAt.toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1 rounded cursor-pointer"
                    style={{ color: '#4D7A8A', background: 'transparent', border: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E24B4A')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4D7A8A')}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}