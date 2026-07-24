"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "../ui/MetricCard";
import { SeverityBadge } from "../ui/SeverityBadge";
import { ALERTS, BANKS, KPIS, formatINR } from "@/lib/mockData";
import { fetchGraph } from "@/lib/api";

const spark1 = [12, 14, 13, 18, 17, 22, 24, 21, 27, 30, 28, 34];
const spark2 = [220, 234, 210, 255, 268, 260, 280, 305, 298, 320, 335, 348];
const spark3 = [3, 4, 3, 5, 6, 5, 6, 6, 7, 7, 7, 8];
const spark4 = [90, 88, 85, 82, 84, 81, 80, 78, 79, 78, 77, 78];

export function CommandDashboard({ liveFeed }: { liveFeed: boolean }) {
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState({ nodes: KPIS.nodes, volume: KPIS.volume, rings: KPIS.rings });
  useEffect(() => {
    if (!liveFeed) return;
    const t = setInterval(() => setTick((n) => n + 1), 2400);
    return () => clearInterval(t);
  }, [liveFeed]);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchGraph();
        if (data && data.nodes) {
          const vol = data.edges?.reduce((acc: number, e: any) => acc + (e.amount || 0), 0) || 0;
          setStats({
            nodes: data.nodes.length,
            volume: vol,
            rings: data.cycles ? data.cycles.length : KPIS.rings,
          });
        }
      } catch (e) {
        console.error("Failed to load graph for dashboard stats", e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-5 grid-bg min-h-full">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Active Cross-Bank Nodes"
          value={stats.nodes.toLocaleString("en-IN")}
          sub="Across 9 jurisdictions"
          accent="#38bdf8"
          spark={spark1}
          icon={<span className="text-[11px]">◇</span>}
          trend={{ dir: "up", text: "+3.2% vs 24h" }}
        />
        <MetricCard
          label="Total Monitored Volume"
          value={formatINR(stats.volume)}
          sub="Rolling 24h · consortium-wide"
          accent="#22c55e"
          spark={spark2}
          icon={<span className="text-[11px]">₹</span>}
          trend={{ dir: "up", text: "+8.7% vs 7d avg" }}
        />
        <MetricCard
          label="Flagged Rings"
          value={String(stats.rings)}
          sub="Open investigations"
          accent="#ef4444"
          spark={spark3}
          icon={<span className="text-[11px]">◉</span>}
          trend={{ dir: "up", text: "+2 new since 08:00" }}
        />
        <MetricCard
          label="Privacy-Shield Status"
          value="Active"
          sub={KPIS.saltRotation}
          accent="#a78bfa"
          spark={spark4}
          icon={<span className="text-[11px]">◈</span>}
          trend={{ dir: "flat", text: "ε-budget 78% remaining" }}
        />
      </div>

      {/* Middle strip */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 scan-overlay">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400">
                Consortium Nodes
              </div>
              <div className="mt-1 text-white text-lg font-semibold">
                5 institutions · synced
              </div>
            </div>
            <span className="text-[11px] rounded px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              MPC · zk-audit
            </span>
          </div>
          <div className="mt-4 space-y-2.5">
            {BANKS.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-md grid place-items-center text-[11px] font-bold"
                  style={{ background: `${b.color}22`, color: b.color }}
                >
                  {b.code}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-slate-200 truncate">
                    {b.name}
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${72 + i * 4}%`,
                        background: `linear-gradient(90deg, ${b.color}, ${b.color}55)`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono w-14 text-right">
                  {(38 + i * 6)}ms
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400">
                Risk Heatmap · last 24h
              </div>
              <div className="mt-1 text-white text-lg font-semibold">
                Hour × Severity
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-emerald-500/60" />
              <span>low</span>
              <span className="w-2 h-2 rounded-sm bg-amber-500/70" />
              <span>med</span>
              <span className="w-2 h-2 rounded-sm bg-red-500/80" />
              <span>high</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-24 gap-[3px]">
            {Array.from({ length: 3 }).map((_, row) => (
              <RiskHeatRow key={row} row={row} tick={tick} />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-24 text-[9px] text-slate-500 font-mono">
            {[0, 6, 12, 18].map((h) => (
              <div key={h} style={{ gridColumn: `span 6` }} className="text-left">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400">
                Multi-Agent Fleet
              </div>
              <div className="mt-1 text-white text-lg font-semibold">
                4 agents · online
              </div>
            </div>
            <span className="text-[11px] rounded px-1.5 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/25">
              LLM · v4.2
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {[
              { n: "Graph Analyst", c: "#38bdf8", load: 62 },
              { n: "Risk Analyst", c: "#f59e0b", load: 74 },
              { n: "Compliance Officer", c: "#a78bfa", load: 41 },
              { n: "Investigation Assistant", c: "#22c55e", load: 55 },
            ].map((a) => (
              <div
                key={a.n}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: a.c, boxShadow: `0 0 8px ${a.c}` }}
                  />
                  <div className="text-[12px] text-slate-200 truncate">
                    {a.n}
                  </div>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${a.load}%`,
                      background: `linear-gradient(90deg, ${a.c}, ${a.c}55)`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>load</span>
                  <span className="font-mono">{a.load}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400">
                Real-Time Alert Feed
              </div>
              <div className="mt-0.5 text-white text-[15px] font-semibold">
                Cross-institution signals
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${liveFeed ? "bg-emerald-400 animate-blink" : "bg-slate-500"}`} />
              {liveFeed ? "streaming" : "paused"} · tick #{tick}
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {ALERTS.map((a) => (
              <div
                key={a.id}
                className="p-4 flex items-start gap-3 hover:bg-white/[0.02] transition group"
              >
                <div
                  className={`mt-1 w-2 h-2 rounded-full ${
                    a.severity === "high"
                      ? "bg-red-500 animate-pulseRed"
                      : a.severity === "medium"
                      ? "bg-amber-400 animate-pulseAmber"
                      : "bg-emerald-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[14px] font-medium text-white">
                      {a.title}
                    </div>
                    <SeverityBadge severity={a.severity} />
                    <span className="text-[11px] text-slate-500">
                      {a.time}
                    </span>
                  </div>
                  <div className="mt-1 text-[12.5px] text-slate-400">
                    {a.detail}
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {a.banks.map((b) => (
                      <span
                        key={b}
                        className="text-[10.5px] rounded px-1.5 py-0.5 bg-white/[0.04] border border-white/10 text-slate-300 font-mono"
                      >
                        {b}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-500 ml-auto font-mono">
                      {formatINR(a.amount)}
                    </span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition text-[11px] rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 px-2 py-1">
                  Investigate →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-widest text-slate-400">
            Typology Distribution · 7d
          </div>
          <div className="mt-1 text-white text-[15px] font-semibold">
            Detected patterns
          </div>
          <div className="mt-4 space-y-3">
            {[
              { name: "Rapid layering", pct: 42, c: "#ef4444" },
              { name: "Structuring / smurfing", pct: 24, c: "#f59e0b" },
              { name: "Round-trip / U-turn", pct: 14, c: "#a78bfa" },
              { name: "Trade-based ML", pct: 12, c: "#38bdf8" },
              { name: "Shell-account funneling", pct: 8, c: "#22c55e" },
            ].map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: r.c }}
                    />
                    <span className="text-slate-200">{r.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{r.pct}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${r.pct * 2}%`,
                      background: `linear-gradient(90deg, ${r.c}, ${r.c}44)`,
                      maxWidth: "100%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="divider my-4" />
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
            <div className="text-[11px] uppercase tracking-widest text-emerald-300">
              Compliance posture
            </div>
            <div className="mt-1 text-[13px] text-slate-200 leading-relaxed">
              All institutions passing FATF R.16 checks. 3 SAR drafts awaiting review.
            </div>
            <button className="mt-2 text-[12px] rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 px-2.5 py-1">
              Review SAR queue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskHeatRow({ row, tick }: { row: number; tick: number }) {
  // deterministic pseudo-random with tick influence
  const cells = Array.from({ length: 24 }).map((_, i) => {
    const seed = (i * 9 + row * 31 + tick * 3) % 100;
    const v = (Math.sin((i + row) * 1.3 + tick * 0.4) + 1) / 2;
    const lvl = (seed / 100) * 0.6 + v * 0.4;
    return lvl;
  });
  return (
    <>
      {cells.map((lvl, i) => {
        const color =
          lvl > 0.72 ? "#ef4444" : lvl > 0.45 ? "#f59e0b" : "#22c55e";
        const opacity = 0.25 + lvl * 0.75;
        return (
          <div
            key={i}
            title={`${String(i).padStart(2, "0")}:00 · lvl ${(lvl * 100).toFixed(0)}%`}
            className="h-4 rounded-[3px]"
            style={{ background: color, opacity }}
          />
        );
      })}
    </>
  );
}
