"use client";

import { useEffect, useMemo } from "react";
import {
  EDGES,
  bankById,
  formatINR,
  nodeById,
  severityColor,
  type GraphNode,
} from "@/lib/mockData";
import { SeverityBadge } from "./ui/SeverityBadge";

export function NodeDetailDrawer({
  node,
  onClose,
}: {
  node: GraphNode | null;
  onClose: () => void;
}) {
  const open = !!node;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const related = useMemo(() => {
    if (!node) return [];
    return EDGES.filter((e) => e.source === node.id || e.target === node.id);
  }, [node]);

  const connectedBanks = useMemo(() => {
    if (!node) return [];
    const set = new Set<string>();
    related.forEach((e) => {
      const other = e.source === node.id ? nodeById(e.target) : nodeById(e.source);
      set.add(other.bankId);
    });
    return Array.from(set).map((id) => bankById(id));
  }, [node, related]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[460px] max-w-full transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full glass border-l border-white/10 flex flex-col">
          {node && (
            <>
              <div className="p-5 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg grid place-items-center"
                    style={{
                      background: `${severityColor(node.severity)}22`,
                      color: severityColor(node.severity),
                      boxShadow:
                        node.severity === "high"
                          ? "0 0 16px rgba(239,68,68,0.45)"
                          : undefined,
                    }}
                  >
                    ◉
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-widest text-slate-400">
                        Anonymized handle
                      </span>
                      <SeverityBadge severity={node.severity} size="md" />
                    </div>
                    <div className="mt-1 font-mono text-white text-[16px] break-all">
                      {node.hash}
                    </div>
                    <div className="text-[12px] text-slate-400">{node.label}</div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white text-lg leading-none px-1"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MiniStat
                    label="Balance"
                    value={formatINR(node.balance)}
                    color="#22c55e"
                  />
                  <MiniStat
                    label="Jurisdiction"
                    value={node.country}
                    color="#38bdf8"
                  />
                  <MiniStat
                    label="Opened"
                    value={node.createdAt}
                    color="#a78bfa"
                  />
                </div>
              </div>

              <div className="p-5 overflow-auto space-y-5 flex-1">
                {/* AI explanation */}
                <section>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-emerald-300">
                      Instant AI Explanation
                    </span>
                    <span className="text-[10px] rounded px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                      confidence 0.93
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-[13px] leading-relaxed text-slate-200">
                    {aiExplanation(node)}
                  </div>
                </section>

                {/* Timeline */}
                <section>
                  <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
                    Timeline breakdown ({related.length} events)
                  </div>
                  <ol className="relative border-l border-white/10 pl-4 space-y-3">
                    {related
                      .slice()
                      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                      .map((e) => {
                        const other =
                          e.source === node.id ? nodeById(e.target) : nodeById(e.source);
                        const dir = e.source === node.id ? "out" : "in";
                        return (
                          <li key={e.id} className="relative">
                            <span
                              className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full"
                              style={{
                                background: severityColor(e.severity),
                                boxShadow: `0 0 8px ${severityColor(e.severity)}`,
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-mono">
                                {e.timestamp}
                              </span>
                              <span
                                className={`text-[10px] rounded px-1.5 py-0.5 border ${
                                  dir === "out"
                                    ? "border-red-500/25 bg-red-500/10 text-red-300"
                                    : "border-sky-500/25 bg-sky-500/10 text-sky-300"
                                }`}
                              >
                                {dir === "out" ? "→ outbound" : "← inbound"}
                              </span>
                              <SeverityBadge severity={e.severity} />
                            </div>
                            <div className="mt-1 text-[13px] text-slate-200">
                              {e.currency === "INR"
                                ? formatINR(e.amount)
                                : `${e.currency} ${e.amount.toLocaleString()}`}{" "}
                              <span className="text-slate-500">
                                {dir === "out" ? "to" : "from"}
                              </span>{" "}
                              <span className="font-mono">{other.hash}</span>
                            </div>
                            {e.note && (
                              <div className="text-[11.5px] text-slate-400 italic">
                                — {e.note}
                              </div>
                            )}
                          </li>
                        );
                      })}
                  </ol>
                </section>

                {/* Connected institutions */}
                <section>
                  <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
                    Connected institutions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {connectedBanks.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[12px]"
                        style={{
                          borderColor: `${b.color}44`,
                          background: `${b.color}12`,
                          color: b.color,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: b.color }}
                        />
                        {b.name}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Signals */}
                <section>
                  <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
                    Risk signals
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <SignalBar label="Velocity anomaly" value={92} color="#ef4444" />
                    <SignalBar label="Fan-out ratio" value={78} color="#f59e0b" />
                    <SignalBar label="Counterparty risk" value={71} color="#f59e0b" />
                    <SignalBar label="KYC completeness" value={34} color="#38bdf8" />
                  </div>
                </section>
              </div>

              <div className="p-4 border-t border-white/5 flex items-center gap-2">
                <button className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] px-3 py-2 text-[13px] text-slate-200">
                  Freeze account
                </button>
                <button className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-2 text-[13px] text-emerald-200 shadow-glow">
                  Escalate to SAR →
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg border px-2.5 py-2"
      style={{ borderColor: `${color}33`, background: `${color}0E` }}
    >
      <div className="text-[10px] uppercase tracking-widest" style={{ color }}>
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-medium text-white truncate">
        {value}
      </div>
    </div>
  );
}

function SignalBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}55)`,
          }}
        />
      </div>
    </div>
  );
}

function aiExplanation(node: GraphNode) {
  if (node.severity === "high") {
    return `${node.hash} shows a rapid layering pattern: within 62 minutes it forwarded ~₹4.6 Cr through 3 hops to a terminal offshore beneficiary. Fan-out is 5.8× the baseline for its cohort and the counterparties are freshly created (<90 days). This matches typology AML-TYP-04 across the ${node.country} corridor.`;
  }
  if (node.severity === "medium") {
    return `${node.hash} shows elevated counterparty diversity and velocity above its 90-day baseline. No terminal offshore hops yet, but pattern is consistent with early-stage structuring. Recommend continued monitoring for the next 24 hours.`;
  }
  return `${node.hash} shows normal activity within its historical envelope. Counterparties and volumes match KYC-declared profile; no anomalies detected in the last 24 hours.`;
}
