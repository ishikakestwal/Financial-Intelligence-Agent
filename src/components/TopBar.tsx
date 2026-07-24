"use client";

import { useState } from "react";
import type { ViewKey } from "./AppShell";

const VIEW_TITLES: Record<ViewKey, { title: string; sub: string }> = {
  dashboard: {
    title: "Command Dashboard",
    sub: "Consortium-wide signals · privacy-preserving overview",
  },
  graph: {
    title: "Interactive Transaction Graph",
    sub: "Multi-bank flow topology · anonymized handles",
  },
  chat: {
    title: "Multi-Agent AI Investigator",
    sub: "Ask in natural language · 4 specialist agents online",
  },
  sar: {
    title: "Compliance Reports · SAR Builder",
    sub: "Draft & export suspicious activity reports",
  },
  upload: {
    title: "Data Ingestion",
    sub: "Upload CSV transaction data securely",
  },
};

const PROFILES = [
  "Global Central Bank / Multi-Institution Node",
  "Meridian Trust Bank",
  "Sterling Union Bank",
  "Continental Wealth",
];

export function TopBar({
  view,
  liveFeed,
  onToggleFeed,
}: {
  view: ViewKey;
  liveFeed: boolean;
  onToggleFeed: () => void;
}) {
  const [profile, setProfile] = useState(PROFILES[0]);
  const [profileOpen, setProfileOpen] = useState(false);
  const { title, sub } = VIEW_TITLES[view];

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-finguard-bg/70 backdrop-blur">
      <div className="flex items-center gap-4 px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[11px] uppercase tracking-widest text-slate-500">
              Session · gph_2f9a7c
            </div>
            <span className="text-[10px] rounded px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              SECURE
            </span>
          </div>
          <div className="mt-0.5 text-lg font-semibold text-white leading-tight">
            {title}
          </div>
          <div className="text-[12px] text-slate-500">{sub}</div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Profile selector */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06] transition"
            >
              <span className="grid place-items-center w-6 h-6 rounded-md bg-gradient-to-br from-sky-500 to-indigo-500 text-[11px] font-bold text-white">
                GB
              </span>
              <span className="text-[13px] text-slate-200 max-w-[240px] truncate">
                {profile}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-finguard-panel shadow-xl p-1 z-30">
                {PROFILES.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProfile(p);
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] hover:bg-white/5 ${
                      p === profile ? "text-emerald-300" : "text-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sync status */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
            </span>
            <span className="text-[12px] text-slate-300">
              Consortium sync · <span className="text-emerald-300">online</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">42ms</span>
          </div>

          {/* Live feed toggle */}
          <button
            onClick={onToggleFeed}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
              liveFeed
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 shadow-glow"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                liveFeed ? "bg-emerald-400 animate-blink" : "bg-slate-500"
              }`}
            />
            <span className="text-[12px]">
              {liveFeed ? "Live feed · ON" : "Live feed · paused"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
