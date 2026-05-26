"use client";

import { useEffect, useRef, useState } from "react";

type ChannelType = "announcements" | "job" | "dm";

type Channel = {
  id: string;
  type: ChannelType;
  name: string;
  icon: string;
  description?: string;
  memberCount?: number;
  unread?: number;
};

type Message = {
  id: string;
  channelId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  body: string;
  timestamp: Date;
  isSystem?: boolean;
};

const CHANNELS: Channel[] = [
  {
    id: "announcements",
    type: "announcements",
    name: "Announcements",
    icon: "📣",
    description: "Company-wide updates from management",
    memberCount: 7,
  },
  {
    id: "job-riverside",
    type: "job",
    name: "Riverside Complex",
    icon: "🏗️",
    description: "Sunrise Development · Phase 2",
    memberCount: 3,
  },
  {
    id: "job-harbor",
    type: "job",
    name: "Harbor View",
    icon: "🏗️",
    description: "Harbor Bay LLC · Foundation",
    memberCount: 2,
  },
  {
    id: "job-metro",
    type: "job",
    name: "Metro Clinic Reno",
    icon: "🏗️",
    description: "Metro Health Partners · Interior Buildout",
    memberCount: 1,
    unread: 2,
  },
  { id: "dm-marcus", type: "dm", name: "Marcus Rivera", icon: "👤", unread: 1 },
  { id: "dm-anita", type: "dm", name: "Anita Patel", icon: "👤" },
  { id: "dm-deja", type: "dm", name: "Deja Williams", icon: "👤" },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  announcements: [
    {
      id: "a3",
      channelId: "announcements",
      senderName: "System",
      senderInitials: "SY",
      senderColor: "#9ca3af",
      body: "Marcus Rivera clocked in at Riverside Complex — 7:02 AM",
      timestamp: new Date(2026, 4, 26, 7, 3),
      isSystem: true,
    },
    {
      id: "a1",
      channelId: "announcements",
      senderName: "Anita Patel",
      senderInitials: "AP",
      senderColor: "#8b5cf6",
      body: "🗓 The schedule for the week of June 1 has been published. Please review your shifts and let me know if you have any conflicts.",
      timestamp: new Date(2026, 4, 26, 8, 14),
    },
    {
      id: "a2",
      channelId: "announcements",
      senderName: "Anita Patel",
      senderInitials: "AP",
      senderColor: "#8b5cf6",
      body: "Reminder: all timesheets for May 18–24 need to be submitted by end of day Friday. Reach out if you need any corrections.",
      timestamp: new Date(2026, 4, 26, 8, 16),
      isSystem: false,
    },
  ],
  "job-riverside": [
    {
      id: "r1",
      channelId: "job-riverside",
      senderName: "Marcus Rivera",
      senderInitials: "MR",
      senderColor: "#3b82f6",
      body: "Good morning crew. Starting framing on the east wing today. Hard hats required on the scaffold.",
      timestamp: new Date(2026, 4, 26, 7, 5),
    },
    {
      id: "r2",
      channelId: "job-riverside",
      senderName: "Tom Kowalski",
      senderInitials: "TK",
      senderColor: "#10b981",
      body: "Morning. Running about 10 minutes late — parking situation on Riverside Dr.",
      timestamp: new Date(2026, 4, 26, 7, 22),
    },
    {
      id: "r3",
      channelId: "job-riverside",
      senderName: "Anita Patel",
      senderInitials: "AP",
      senderColor: "#8b5cf6",
      body: "No problem Tom. Heads up — the city inspector is coming at 2 PM for rough framing sign-off.",
      timestamp: new Date(2026, 4, 26, 8, 1),
    },
  ],
  "job-harbor": [],
  "job-metro": [
    {
      id: "m1",
      channelId: "job-metro",
      senderName: "Anita Patel",
      senderInitials: "AP",
      senderColor: "#8b5cf6",
      body: "Drywall delivery is confirmed for Thursday morning. Please clear the east corridor by 7 AM.",
      timestamp: new Date(2026, 4, 25, 16, 30),
    },
    {
      id: "m2",
      channelId: "job-metro",
      senderName: "Jordan Lee",
      senderInitials: "JL",
      senderColor: "#f59e0b",
      body: "Will do. Any update on the paint colors for exam rooms 4–6?",
      timestamp: new Date(2026, 4, 25, 16, 45),
    },
  ],
  "dm-marcus": [
    {
      id: "d1",
      channelId: "dm-marcus",
      senderName: "Marcus Rivera",
      senderInitials: "MR",
      senderColor: "#3b82f6",
      body: "Hey, can I swap my shift on Thursday with Carlos? He's good with it.",
      timestamp: new Date(2026, 4, 25, 14, 20),
    },
  ],
  "dm-anita": [],
  "dm-deja": [],
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getDateLabel(date: Date): string {
  const today = new Date(2026, 4, 26);
  const yesterday = new Date(2026, 4, 25);
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Today";
  }
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState("announcements");
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannel = channels.find((c) => c.id === activeChannel);
  const currentMessages = messages[activeChannel] ?? [];

  function activateChannel(id: string) {
    setActiveChannel(id);
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      senderName: "You",
      senderInitials: "ME",
      senderColor: "#f97316",
      body: draft.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] ?? []), newMsg],
    }));
    setDraft("");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, activeChannel]);

  // Group messages by date
  const groupedMessages: { dateLabel: string; msgs: Message[] }[] = [];
  for (const msg of currentMessages) {
    const label = getDateLabel(msg.timestamp);
    const last = groupedMessages[groupedMessages.length - 1];
    if (!last || last.dateLabel !== label) {
      groupedMessages.push({ dateLabel: label, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  }

  const generalChannels = channels.filter((c) => c.type === "announcements");
  const jobChannels = channels.filter((c) => c.type === "job");
  const dmChannels = channels.filter((c) => c.type === "dm");

  function ChannelItem({ channel }: { channel: Channel }) {
    const isActive = channel.id === activeChannel;
    return (
      <button
        onClick={() => activateChannel(channel.id)}
        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
          isActive ? "bg-gray-700" : "hover:bg-gray-800"
        }`}
      >
        <span className="text-base flex-shrink-0">{channel.icon}</span>
        <span
          className={`flex-1 text-sm font-medium truncate ${
            isActive ? "text-white" : "text-gray-400"
          }`}
        >
          {channel.name}
        </span>
        {channel.unread && channel.unread > 0 ? (
          <span className="flex-shrink-0 h-5 min-w-[20px] rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold px-1">
            {channel.unread}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 flex flex-col border-r border-gray-800">
        <div className="px-4 py-5 flex-shrink-0">
          <h2 className="text-white font-bold text-base">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {/* General */}
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              General
            </div>
            <div className="mt-1 space-y-0.5">
              {generalChannels.map((c) => (
                <ChannelItem key={c.id} channel={c} />
              ))}
            </div>
          </div>

          {/* Job Channels */}
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Job Channels
            </div>
            <div className="mt-1 space-y-0.5">
              {jobChannels.map((c) => (
                <ChannelItem key={c.id} channel={c} />
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Direct Messages
            </div>
            <div className="mt-1 space-y-0.5">
              {dmChannels.map((c) => (
                <ChannelItem key={c.id} channel={c} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-3 py-3 border-t border-gray-800 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-800 hover:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 transition-colors">
            <span>📨</span> New Message
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header bar */}
        <div className="border-b border-gray-100 px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl flex-shrink-0">{currentChannel?.icon}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 leading-tight">{currentChannel?.name}</h3>
              {currentChannel?.description && (
                <p className="text-xs text-gray-400 truncate">{currentChannel.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {currentChannel?.memberCount && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                👥 {currentChannel.memberCount}{" "}
                {currentChannel.memberCount === 1 ? "member" : "members"}
              </span>
            )}
            <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Search">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-4xl mb-3">{currentChannel?.icon}</span>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Start the conversation below.</p>
            </div>
          ) : (
            groupedMessages.map(({ dateLabel, msgs }) => (
              <div key={dateLabel}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-medium text-gray-400 px-2">{dateLabel}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="space-y-4">
                  {msgs.map((msg) =>
                    msg.isSystem ? (
                      <div key={msg.id} className="flex justify-center">
                        <span className="text-xs text-gray-400 italic bg-gray-50 rounded-full px-3 py-1">
                          {msg.body}
                        </span>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: msg.senderColor }}
                        >
                          {msg.senderInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-sm font-medium text-gray-900">
                              {msg.senderName}
                            </span>
                            <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{msg.body}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Compose bar */}
        <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="rounded-xl border border-gray-200 focus-within:border-orange-400 transition-colors overflow-hidden">
            <textarea
              ref={composeRef}
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${currentChannel?.name ?? "…"}`}
              className="w-full resize-none px-4 pt-3 pb-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 text-lg transition-colors"
                  aria-label="Attach file"
                >
                  📎
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 text-lg transition-colors"
                  aria-label="Emoji"
                >
                  😊
                </button>
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
