"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type ChannelType = "announcements" | "job" | "dm";

type Channel = {
  id: string; // matches messages.channel
  type: ChannelType;
  name: string;
  icon: string;
  description?: string;
};

type Message = {
  id: string;
  channel: string;
  sender_type: "admin" | "employee";
  sender_id: string | null;
  sender_name: string;
  body: string;
  created_at: string;
};

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

function senderColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function senderInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getDateLabel(ts: string): string {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function ChannelSection({
  title,
  items,
  activeChannel,
  onSelect,
}: {
  title: string;
  items: Channel[];
  activeChannel: string;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="mt-1 space-y-0.5">
        {items.map((channel) => {
          const isActive = channel.id === activeChannel;
          return (
            <button
              key={channel.id}
              onClick={() => onSelect(channel.id)}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [senderName, setSenderName] = useState("Management");
  const [userId, setUserId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState("announcements");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannelRef = useRef(activeChannel);
  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  // Bootstrap: who am I, which org, and what channels exist
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserId(user.id);

      const [{ data: member }, { data: profile }] = await Promise.all([
        supabase.from("org_members").select("org_id").eq("user_id", user.id).limit(1).single(),
        supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single(),
      ]);
      if (cancelled || !member?.org_id) {
        setLoadingChannels(false);
        return;
      }
      setOrgId(member.org_id);

      const name =
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        user.email?.split("@")[0] ||
        "Management";
      setSenderName(name);

      const [{ data: jobs }, { data: employees }] = await Promise.all([
        supabase
          .from("jobs")
          .select("id, name, customer")
          .eq("org_id", member.org_id)
          .eq("status", "active")
          .order("name"),
        supabase
          .from("employees")
          .select("id, name, role")
          .eq("org_id", member.org_id)
          .eq("status", "Active")
          .order("name"),
      ]);
      if (cancelled) return;

      setChannels([
        {
          id: "announcements",
          type: "announcements",
          name: "Announcements",
          icon: "📣",
          description: "Company-wide updates from management",
        },
        ...(jobs ?? []).map((j) => ({
          id: `job:${j.id}`,
          type: "job" as const,
          name: j.name,
          icon: "🏗️",
          description: j.customer,
        })),
        ...(employees ?? []).map((e) => ({
          id: `dm:${e.id}`,
          type: "dm" as const,
          name: e.name,
          icon: "👤",
          description: e.role,
        })),
      ]);
      setLoadingChannels(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load messages for the active channel
  const loadMessages = useCallback((org: string, channel: string) => {
    const supabase = createClient();
    return supabase
      .from("messages")
      .select("id, channel, sender_type, sender_id, sender_name, body, created_at")
      .eq("org_id", org)
      .eq("channel", channel)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (data) setMessages(data);
      });
  }, []);

  useEffect(() => {
    if (orgId) loadMessages(orgId, activeChannel);
  }, [orgId, activeChannel, loadMessages]);

  // Realtime: append new messages in the open channel
  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();
    const sub = supabase
      .channel("dashboard-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (msg.channel !== activeChannelRef.current) return prev;
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [orgId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeChannel]);

  async function sendMessage() {
    const body = draft.trim();
    if (!body || !orgId || sending) return;
    setSending(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .insert({
        org_id: orgId,
        channel: activeChannel,
        sender_type: "admin",
        sender_id: userId,
        sender_name: senderName,
        body,
      })
      .select()
      .single();
    if (data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
      );
      setDraft("");
    }
    setSending(false);
  }

  const currentChannel = channels.find((c) => c.id === activeChannel);

  // Group messages by date
  const groupedMessages: { dateLabel: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const label = getDateLabel(msg.created_at);
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

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 flex flex-col border-r border-gray-800">
        <div className="px-4 py-5 flex-shrink-0">
          <h2 className="text-white font-bold text-base">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {loadingChannels ? (
            <p className="px-3 text-xs text-gray-500">Loading channels…</p>
          ) : (
            <>
              <ChannelSection
                title="General"
                items={generalChannels}
                activeChannel={activeChannel}
                onSelect={setActiveChannel}
              />
              <ChannelSection
                title="Job Channels"
                items={jobChannels}
                activeChannel={activeChannel}
                onSelect={setActiveChannel}
              />
              <ChannelSection
                title="Direct Messages"
                items={dmChannels}
                activeChannel={activeChannel}
                onSelect={setActiveChannel}
              />
              {jobChannels.length === 0 && dmChannels.length === 0 && (
                <p className="px-3 text-xs text-gray-500">
                  Add jobs and employees to get crew channels and direct messages.
                </p>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header bar */}
        <div className="border-b border-gray-100 px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl flex-shrink-0">{currentChannel?.icon ?? "💬"}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 leading-tight">
                {currentChannel?.name ?? "Messages"}
              </h3>
              {currentChannel?.description && (
                <p className="text-xs text-gray-400 truncate">{currentChannel.description}</p>
              )}
            </div>
          </div>
          {currentChannel?.type === "dm" && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 flex-shrink-0">
              Private thread with {currentChannel.name}
            </span>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-4xl mb-3">{currentChannel?.icon ?? "💬"}</span>
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
                  {msgs.map((msg) => {
                    const mine = msg.sender_type === "admin" && msg.sender_id === userId;
                    return (
                      <div key={msg.id} className="flex gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: mine ? "#f97316" : senderColor(msg.sender_name),
                          }}
                        >
                          {senderInitials(msg.sender_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-sm font-medium text-gray-900">
                              {mine ? "You" : msg.sender_name}
                            </span>
                            {msg.sender_type === "employee" && (
                              <span className="rounded bg-blue-50 px-1.5 text-[10px] font-medium text-blue-600">
                                Employee
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })}
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
            <div className="flex items-center justify-end px-3 pb-2">
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? "Sending…" : "Send"}
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
