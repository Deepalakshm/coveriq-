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
  'Health Insurance': { bg: '#1E3A5F', color: '#7EB8F7' },
  'Motor Insurance': { bg: '#1A3A2A', color: '#5DCAA5' },
  'Life Insurance': { bg: '#2D2458', color: '#AFA9EC' },
  'Travel Insurance': { bg: '#3A2A10', color: '#FAC775' },
  'General Practice': { bg: '#1E3A5F', color: '#7EB8F7' },
  Dermatology: { bg: '#3A1A2A', color: '#ED93B1' },
  'Mental Health': { bg: '#2D2458', color: '#AFA9EC' },
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
      className="w-70 flex flex-col h-screen flex-shrink-0"
      style={{ background: '#0C1B33' }}
    >
      {/* Header */}
      <div
        className="h-[82px] px-5 flex items-center gap-3"
        style={{
          borderBottom: '1px solid #1E3A5F',
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
          style={{
            background: '#1D9E75',
            color: '#FFFFFF',
          }}
        >
          C
        </div>

        <div>
          <p
            className="font-semibold"
            style={{
              color: '#E8F4F0',
              fontSize: '15px',
            }}
          >
            CoverIQ
          </p>

          <p
            className="text-xs"
            style={{
              color: '#7A98AD',
            }}
          >
            Insurance Assistant
          </p>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-4 py-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{
            background: '#1D9E75',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 2px 8px rgba(29,158,117,.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0F6E56';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1D9E75';
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 300,
            }}
          >
            +
          </span>
          New Conversation
        </button>
      </div>

      {/* Section Label */}
      {sessions.length > 0 && (
        <div className="px-5 pb-2">
          <p
            className="text-xs font-medium uppercase"
            style={{
              color: '#4D7A8A',
              letterSpacing: '0.12em',
            }}
          >
            Recent Chats
          </p>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 hide-scrollbar">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-10">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{
                borderColor: '#1D9E75',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center px-6 py-10">
            <p
              style={{
                color: '#7A98AD',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              No conversations yet.
              <br />
              Start your first insurance conversation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;

              const badge =
                SPECIALTY_COLORS[s.specialty] ?? {
                  bg: '#1E3A5F',
                  color: '#7EB8F7',
                };

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className="group flex items-start gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: isActive ? '#162D47' : 'transparent',
                    borderLeft: isActive
                      ? '3px solid #1D9E75'
                      : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#162D47';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: isActive
                          ? '#E8F4F0'
                          : '#C5D7E3',
                      }}
                    >
                      {s.preview}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className="px-2 py-1 rounded-md"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '10px',
                        }}
                      >
                        {s.specialty}
                      </span>

                      <span
                        style={{
                          color: '#7A98AD',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        {s.createdAt.toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{
                      color: '#7A98AD',
                      background: 'transparent',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7A98AD';
                    }}
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