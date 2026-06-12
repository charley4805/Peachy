"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useMe } from "../me-context";

type Channel = {
  id: string;
  type: "announcements" | "job" | "dm" | "coworker";
  name: string;
  description?: string;
  can_post: boolean;
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

const CHANNEL_ICON: Record<Channel["type"], string> = {
  announcements: "📣",
  job: "🏗️",
  dm: "🏢",
  coworker: "👤",
};

const GROUPS: { label: string; types: Channel["type"][] }[] = [
  { label: "Company", types: ["announcements", "dm"] },
  { label: "Job Crews", types: ["job"] },
  { label: "Coworkers", types: ["coworker"] },
];

const POLL_MS = 5000;

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

function fmtTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dateLabel(ts: string): string {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function EmployeeMessagesPage() {
  const { employee } = useMe();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [canPost, setCanPost] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [hasRealtime, setHasRealtime] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Load channel list once; detect whether we have a Supabase session
  // (invite accounts get realtime; badge+PIN portal sessions poll instead)
  useEffect(() => {
    fetch("/api/me/channels")
      .then((r) => (r.ok ? r.json() : { channels: [] }))
      .then((data) => {
        setChannels(data.channels);
        if (data.channels.length > 0) setActiveId(data.channels[0].id);
      });

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasRealtime(!!data.session);
    });
  }, []);

  // Load messages when the active channel changes
  const loadMessages = useCallback((channel: string) => {
    return fetch(`/api/me/messages?channel=${encodeURIComponent(channel)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMessages(data.messages);
          setCanPost(data.can_post);
        }
      });
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  // Keep the realtime handler pointed at the current channel
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Live updates: realtime when signed in with Supabase, polling otherwise
  useEffect(() => {
    if (hasRealtime === null) return;

    if (!hasRealtime) {
      const id = setInterval(() => {
        if (activeIdRef.current) loadMessages(activeIdRef.current);
      }, POLL_MS);
      return () => clearInterval(id);
    }

    const supabase = createClient();
    const sub = supabase
      .channel("employee-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `org_id=eq.${employee.org_id}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (msg.channel !== activeIdRef.current) return prev;
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [hasRealtime, employee.org_id, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const res = await fetch("/api/me/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: activeId, body }),
    });
    if (res.ok) {
      const msg: Message = await res.json();
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
      setDraft("");
    }
    setSending(false);
  }

  const active = channels.find((c) => c.id === activeId);

  // Group by date
  const grouped: { label: string; msgs: Message[] }[] = [];
  for (const m of messages) {
    const label = dateLabel(m.created_at);
    const last = grouped[grouped.length - 1];
    if (!last || last.label !== label) grouped.push({ label, msgs: [m] });
    else last.msgs.push(m);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9.5rem)] md:h-[calc(100vh-4rem)] -mb-6 md:mb-0">
      {/* Channel picker */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-3">
        <button
          onClick={() => setShowChannels((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg">{active ? CHANNEL_ICON[active.type] : "💬"}</span>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {active?.name ?? "Messages"}
              </div>
              {active?.description && (
                <div className="text-xs text-gray-400 truncate">{active.description}</div>
              )}
            </div>
          </div>
          <span className="text-gray-400 text-xs">{showChannels ? "▲" : "▼ Switch"}</span>
        </button>

        {showChannels && (
          <div className="border-t border-gray-50 p-2 max-h-72 overflow-y-auto">
            {GROUPS.map((group) => {
              const groupChannels = channels.filter((c) => group.types.includes(c.type));
              if (groupChannels.length === 0) return null;
              return (
                <div key={group.label} className="mb-2 last:mb-0">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {groupChannels.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveId(c.id);
                          setShowChannels(false);
                        }}
                        className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          c.id === activeId
                            ? "bg-orange-50 text-orange-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{CHANNEL_ICON[c.type]}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        {c.description && (
                          <span className="text-xs text-gray-400 truncate max-w-[40%]">
                            {c.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-100 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-3">{active ? CHANNEL_ICON[active.type] : "💬"}</span>
            <p className="text-gray-500 font-medium text-sm">No messages yet</p>
            {canPost && (
              <p className="text-gray-400 text-xs mt-1">Start the conversation below.</p>
            )}
          </div>
        ) : (
          grouped.map(({ label, msgs }) => (
            <div key={label}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-medium text-gray-400">{label}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-3">
                {msgs.map((m) => {
                  const mine =
                    m.sender_type === "employee" && m.sender_id === employee.id;
                  return (
                    <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: mine ? "#f97316" : senderColor(m.sender_name),
                        }}
                      >
                        {senderInitials(m.sender_name)}
                      </div>
                      <div className={`max-w-[80%] ${mine ? "text-right" : ""}`}>
                        <div
                          className={`flex items-baseline gap-2 mb-0.5 ${
                            mine ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-xs font-medium text-gray-700">
                            {mine ? "You" : m.sender_name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {fmtTime(m.created_at)}
                          </span>
                        </div>
                        <div
                          className={`inline-block rounded-2xl px-3.5 py-2 text-sm leading-relaxed text-left ${
                            mine
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Compose */}
      <div className="mt-3 pb-3">
        {canPost ? (
          <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-200 focus-within:border-orange-400 transition-colors px-3 py-2">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${active?.name ?? "…"}`}
              className="flex-1 resize-none py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
            <button
              onClick={send}
              disabled={!draft.trim() || sending}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              Send
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400 py-2">
            Only management can post in this channel.
          </p>
        )}
      </div>
    </div>
  );
}
