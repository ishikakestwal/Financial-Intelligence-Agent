"use client";

import type { ViewKey } from "./AppShell";

const NAV: {
  key: ViewKey;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "dashboard",
    label: "Command Dashboard",
    hint: "Overview & signals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "graph",
    label: "Transaction Graph",
    hint: "Network canvas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="19" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="6" cy="19" r="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="18" cy="19" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6.5 7.5L11 12M17.5 7.5L13 12M11 14L7 18M13 14l4 4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    key: "chat",
    label: "AI Investigator",
    hint: "Multi-agent chat",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16v10H8l-4 3V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="9" cy="11" r="1" fill="currentColor" />
        <circle cx="12" cy="11" r="1" fill="currentColor" />
        <circle cx="15" cy="11" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "sar",
    label: "Compliance / SAR",
    hint: "Auto reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M7 3h8l4 4v14H7V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 3v5h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "upload",
    label: "Upload Data",
    hint: "Ingest CSV",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Sidebar({
  view,
  onChange,
}: {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-white/5 bg-finguard-panel/70 backdrop-blur flex flex-col">
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center shadow-glow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="#052e1a" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
            <path d="M9 12l2 2 4-4" stroke="#052e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-wide text-white">
            FinGuard <span className="text-emerald-400">Intelligence</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">
            Consortium AML Console
          </div>
        </div>
      </div>

      <div className="divider" />

      <nav className="p-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                active
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-white shadow-glow"
                  : "border border-transparent hover:bg-white/5 text-slate-300"
              }`}
            >
              <span
                className={`grid place-items-center w-8 h-8 rounded-md ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/[0.03] text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">
                <div className="text-sm font-medium leading-tight">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500">{item.hint}</div>
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
            Privacy Shield
          </div>
          <div className="mt-1.5 text-sm text-white">
            Salted graph handles rotating
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-emerald-500 to-emerald-300" />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span>ε-budget</span>
            <span className="text-emerald-300">78% remaining</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 grid place-items-center text-[11px] font-semibold text-white">
            AR
          </div>
          <div className="text-[12px]">
            <div className="text-slate-200">A. Rao</div>
            <div className="text-slate-500">Investigator · L3</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
