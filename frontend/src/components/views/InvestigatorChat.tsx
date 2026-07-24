"use client";

import { useEffect, useRef, useState } from "react";
import {
  AGENT_META,
  SEED_CHAT,
  SUGGESTED_QUERIES,
  type ChatAgent,
  type ChatMessage,
} from "@/lib/mockData";
import { fetchChat } from "@/lib/api";

export function InvestigatorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_CHAT);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState<ChatAgent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function send(text: string) {
    if (!text.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      content: text,
      time,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setThinking("Investigation Assistant");
    try {
      const res = await fetchChat(text, { context: "investigation" });
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}`,
          role: "agent",
          agent: "Investigation Assistant",
          content: res.answer,
          confidence: 0.95,
          time,
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}_err`,
          role: "agent",
          agent: "Investigation Assistant",
          content: "Sorry, I encountered an error communicating with the backend.",
          time,
        },
      ]);
    } finally {
      setThinking(null);
    }
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-12 gap-4">
        {/* Left rail: agents */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Agent Fleet
            </div>
            <div className="mt-1 text-white text-[15px] font-semibold">
              4 specialists · collaborating
            </div>
            <div className="mt-3 space-y-2">
              {(Object.keys(AGENT_META) as ChatAgent[]).map((a) => {
                const m = AGENT_META[a];
                return (
                  <div
                    key={a}
                    className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
                  >
                    <span
                      className="grid place-items-center w-8 h-8 rounded-md text-[14px]"
                      style={{ background: m.bg, color: m.color }}
                    >
                      {m.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] text-white truncate">{a}</div>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
                        />
                      </div>
                      <div className="text-[11.5px] text-slate-400">{m.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Try asking
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-[12.5px] rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] px-3 py-2 text-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Session context
            </div>
            <div className="mt-2 space-y-1.5 text-[12px]">
              <ContextRow k="Cluster" v="gph_2f9a7c" mono />
              <ContextRow k="Handles" v="12 salted" />
              <ContextRow k="Institutions" v="5 (MPC)" />
              <ContextRow k="Retention" v="24 h volatile" />
              <ContextRow k="Model" v="finguard-mixer v4.2" mono />
            </div>
          </div>
        </aside>

        {/* Chat surface */}
        <section className="col-span-12 xl:col-span-9">
          <div className="glass rounded-2xl flex flex-col" style={{ minHeight: 640 }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-8 h-8 rounded-md bg-emerald-500/15 text-emerald-300 shadow-glow">
                  ◉
                </div>
                <div>
                  <div className="text-[13px] text-white font-medium">
                    Investigator Console
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Answers are synthesized across all 4 agents · confidence-weighted
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[11px] rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 px-2 py-1">
                  Export transcript
                </button>
                <button className="text-[11px] rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 px-2 py-1">
                  Reset session
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-auto p-5 space-y-4"
              style={{ maxHeight: 640 }}
            >
              {messages.map((m) => (
                <Message key={m.id} m={m} />
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full animate-blink"
                    style={{ background: AGENT_META[thinking].color }}
                  />
                  <span style={{ color: AGENT_META[thinking].color }}>
                    {thinking}
                  </span>
                  <span>is analyzing</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-blink" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-blink" style={{ animationDelay: "200ms" }} />
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-blink" style={{ animationDelay: "400ms" }} />
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 p-3">
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-slate-500 text-[13px] font-mono">›</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder='Ask "Why is Shell Alpha suspicious?" or "Show transfers > ₹10 lakh today"'
                  className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-slate-500 text-slate-100"
                />
                <span className="hidden md:inline text-[10.5px] rounded px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 font-mono">
                  ⏎ send
                </span>
                <button
                  onClick={() => send(input)}
                  className="rounded-md border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-[12.5px] px-3 py-1.5 shadow-glow"
                >
                  Ask fleet
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
                Queries are answered on salted, differentially-private handles — raw PII never leaves member banks.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ContextRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{k}</span>
      <span className={`text-slate-200 ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}

function Message({ m }: { m: ChatMessage }) {
  if (m.role === "system") {
    return (
      <div className="text-center">
        <span className="inline-block text-[11px] rounded-full border border-white/10 bg-white/[0.03] text-slate-400 px-2.5 py-1 font-mono">
          {m.content}
        </span>
      </div>
    );
  }
  if (m.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-[13.5px] text-slate-100 leading-relaxed">
          {m.content}
          <div className="mt-1 text-[10px] text-slate-400 font-mono">{m.time}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 grid place-items-center text-[11px] font-bold text-white">
          AR
        </div>
      </div>
    );
  }
  const meta = AGENT_META[m.agent!];
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-md grid place-items-center text-[14px]"
        style={{ background: meta.bg, color: meta.color, boxShadow: `0 0 12px ${meta.color}55` }}
      >
        {meta.icon}
      </div>
      <div className="max-w-[82%]">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]"
            style={{
              borderColor: `${meta.color}55`,
              background: meta.bg,
              color: meta.color,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
            {m.agent}
          </span>
          <span className="text-[10.5px] text-slate-500 font-mono">{m.time}</span>
          {typeof m.confidence === "number" && (
            <span className="text-[10.5px] rounded px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-300 font-mono">
              conf {m.confidence.toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[13.5px] text-slate-100 leading-relaxed">
          {m.content}
          {m.citations && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {m.citations.map((c) => (
                <span
                  key={c}
                  className="text-[10.5px] rounded px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 font-mono"
                >
                  ↪ evt:{c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Removed buildAgentReply simulation
