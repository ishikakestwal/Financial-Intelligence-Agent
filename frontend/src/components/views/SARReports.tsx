"use client";

import { useState } from "react";
import {
  BANKS,
  EDGES,
  NODES,
  bankById,
  formatINR,
  nodeById,
} from "@/lib/mockData";
import { SeverityBadge } from "../ui/SeverityBadge";
import { downloadReport } from "@/lib/api";

const CASES = [
  {
    id: "SAR-2026-0714",
    cluster: "gph_2f9a7c",
    title: "Cross-border layering ring · Shell Alpha",
    banks: ["MTB", "NWC", "SUB", "CWL"],
    amount: 46_000_000,
    status: "Draft",
    severity: "high" as const,
    updated: "2 min ago",
  },
  {
    id: "SAR-2026-0713",
    cluster: "gph_18b2ee",
    title: "Structuring pattern · retail cohort",
    banks: ["NWC", "SUB"],
    amount: 11_760_000,
    status: "Awaiting review",
    severity: "high" as const,
    updated: "18 min ago",
  },
  {
    id: "SAR-2026-0712",
    cluster: "gph_a01f4c",
    title: "Rapid pass-through · AE → KY",
    banks: ["SUB", "CWL"],
    amount: 3_200_000,
    status: "Ready to file",
    severity: "medium" as const,
    updated: "1 hr ago",
  },
  {
    id: "SAR-2026-0711",
    cluster: "gph_7d3921",
    title: "Unusual counterparty diversity · FX broker",
    banks: ["CWL", "PRV"],
    amount: 1_800_000,
    status: "Under investigation",
    severity: "medium" as const,
    updated: "3 hr ago",
  },
  {
    id: "SAR-2026-0710",
    cluster: "gph_4b0018",
    title: "Trade-based ML · import invoice mismatch",
    banks: ["PRV", "MTB"],
    amount: 8_400_000,
    status: "Filed",
    severity: "high" as const,
    updated: "1 d ago",
  },
];

export function SARReports() {
  const [selectedId, setSelectedId] = useState(CASES[0].id);
  const selected = CASES.find((c) => c.id === selectedId)!;

  const clusterNodes = NODES.filter((n) => n.severity !== "safe").slice(0, 6);
  const clusterEdges = EDGES.filter((e) => e.severity !== "safe").slice(0, 6);
  const total = clusterEdges.reduce((s, e) => s + e.amount, 0);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // In a real scenario, we would use the actual investigation_id
      // but here we use selected.id (which in the backend should match an investigation record)
      await downloadReport(selected.id);
    } catch (e) {
      console.error("Failed to export PDF", e);
      alert("Failed to export PDF. Ensure backend has the investigation.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-5">
      <div className="grid grid-cols-12 gap-4">
        {/* Case queue */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <div className="glass rounded-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-400">
                  SAR queue
                </div>
                <div className="mt-0.5 text-white text-[15px] font-semibold">
                  {CASES.length} open cases
                </div>
              </div>
              <button className="text-[11px] rounded-md border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 px-2 py-1">
                + New
              </button>
            </div>
            <div className="max-h-[560px] overflow-auto divide-y divide-white/5">
              {CASES.map((c) => {
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-3 hover:bg-white/[0.03] transition ${
                      active
                        ? "bg-emerald-500/[0.06] border-l-2 border-emerald-500"
                        : "border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={c.severity} />
                      <span className="text-[10.5px] text-slate-500 font-mono">
                        {c.id}
                      </span>
                    </div>
                    <div className="mt-1 text-[13px] text-white line-clamp-1">
                      {c.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-mono">{formatINR(c.amount)}</span>
                      <span>·</span>
                      <span>{c.status}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      {c.banks.map((b) => (
                        <span
                          key={b}
                          className="text-[9.5px] rounded px-1 py-0.5 bg-white/[0.04] border border-white/10 text-slate-300 font-mono"
                        >
                          {b}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] text-slate-500">
                        {c.updated}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Filing checklist
            </div>
            <div className="mt-2 space-y-2 text-[12.5px]">
              {[
                { label: "Cluster evidence bundle attached", done: true },
                { label: "KYC + CDD re-run on endpoints", done: true },
                { label: "Cross-institution sign-off", done: true },
                { label: "Regulator template mapping (FIU-IND)", done: true },
                { label: "Investigator narrative reviewed", done: false },
                { label: "Legal counsel approval", done: false },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded grid place-items-center text-[10px] ${
                      r.done
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/[0.03] text-slate-500 border border-white/10"
                    }`}
                  >
                    {r.done ? "✓" : "·"}
                  </span>
                  <span
                    className={r.done ? "text-slate-200" : "text-slate-400"}
                  >
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* SAR document */}
        <section className="col-span-12 xl:col-span-9 space-y-4">
          <div className="glass rounded-2xl">
            <div className="px-5 py-4 border-b border-white/5 flex items-start gap-4">
              <div className="grid place-items-center w-11 h-11 rounded-lg bg-red-500/15 text-red-300 shadow-glowRed">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-widest text-slate-400">
                    Suspicious Activity Report · draft
                  </span>
                  <SeverityBadge severity={selected.severity} size="md" />
                  <span className="text-[11px] rounded px-1.5 py-0.5 bg-white/[0.04] border border-white/10 text-slate-300 font-mono">
                    {selected.id}
                  </span>
                  <span className="text-[11px] rounded px-1.5 py-0.5 bg-white/[0.04] border border-white/10 text-slate-300 font-mono">
                    cluster · {selected.cluster}
                  </span>
                </div>
                <div className="mt-1 text-white text-[17px] font-semibold">
                  {selected.title}
                </div>
                <div className="text-[12px] text-slate-400">
                  Auto-generated by Compliance Officer agent · reviewed by A. Rao ·
                  updated {selected.updated}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[12px] rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 px-3 py-1.5">
                  Review case
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="text-[12px] rounded-md border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 px-3 py-1.5 shadow-glow disabled:opacity-50"
                >
                  {isExporting ? "Exporting..." : "Export PDF ↓"}
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              <FactCard label="Aggregate flow" value={formatINR(total)} accent="#22c55e" />
              <FactCard
                label="Institutions"
                value={`${selected.banks.length} banks`}
                accent="#38bdf8"
              />
              <FactCard label="Nodes involved" value={String(clusterNodes.length)} accent="#a78bfa" />
              <FactCard label="Detected typology" value="AML-TYP-04" accent="#ef4444" />
            </div>

            <div className="px-5 pb-5 space-y-5">
              <Section title="1 · Reporting entity">
                <p>
                  Global Central Bank / Multi-Institution Node (Consortium Coordinator)
                  on behalf of {selected.banks.length} member banks:{" "}
                  {selected.banks.map((b, i) => {
                    const bank = BANKS.find((x) => x.code === b)!;
                    return (
                      <span key={b}>
                        <span style={{ color: bank.color }}>{bank.name}</span>
                        {i < selected.banks.length - 1 ? ", " : ""}
                      </span>
                    );
                  })}
                  . Cluster handle{" "}
                  <span className="font-mono text-slate-100">
                    {selected.cluster}
                  </span>
                  , observed on the shared FinGuard graph under differential-privacy
                  budget ε = 0.42.
                </p>
              </Section>

              <Section title="2 · Suspected activity">
                <p>
                  The subject cluster displays a rapid multi-hop layering pattern
                  across four institutions and three jurisdictions within a 62-minute
                  window. Fan-out from anonymized handle{" "}
                  <span className="font-mono">0xBB09…D14F</span> is 5.8× the 90-day
                  baseline; terminal flows settle into an offshore beneficiary
                  (jurisdiction KY), consistent with typology{" "}
                  <span className="text-red-300 font-medium">AML-TYP-04</span>{" "}
                  (structured layering).
                </p>
              </Section>

              <Section title="3 · Subject accounts (anonymized handles)">
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <table className="w-full text-[12.5px]">
                    <thead className="bg-white/[0.03] text-slate-400 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">Handle</th>
                        <th className="px-3 py-2 font-medium">Institution</th>
                        <th className="px-3 py-2 font-medium">Role</th>
                        <th className="px-3 py-2 font-medium">Jurisdiction</th>
                        <th className="px-3 py-2 font-medium">Balance</th>
                        <th className="px-3 py-2 font-medium">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clusterNodes.map((n, i) => {
                        const bank = bankById(n.bankId);
                        const role =
                          i === 0
                            ? "Originator"
                            : i === clusterNodes.length - 1
                            ? "Terminal beneficiary"
                            : "Layering hop";
                        return (
                          <tr
                            key={n.id}
                            className="border-t border-white/5 hover:bg-white/[0.02]"
                          >
                            <td className="px-3 py-2 font-mono text-slate-100">
                              {n.hash}
                            </td>
                            <td className="px-3 py-2" style={{ color: bank.color }}>
                              {bank.name}
                            </td>
                            <td className="px-3 py-2 text-slate-300">{role}</td>
                            <td className="px-3 py-2 font-mono text-slate-300">
                              {n.country}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-100">
                              {formatINR(n.balance)}
                            </td>
                            <td className="px-3 py-2">
                              <SeverityBadge severity={n.severity} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="4 · Transaction chain">
                <ol className="relative border-l border-white/10 pl-4 space-y-2.5">
                  {clusterEdges.map((e) => {
                    const s = nodeById(e.source);
                    const t = nodeById(e.target);
                    return (
                      <li key={e.id} className="relative">
                        <span
                          className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full"
                          style={{
                            background:
                              e.severity === "high"
                                ? "#ef4444"
                                : e.severity === "medium"
                                ? "#f59e0b"
                                : "#22c55e",
                            boxShadow:
                              e.severity === "high"
                                ? "0 0 10px #ef4444"
                                : undefined,
                          }}
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {e.timestamp}
                          </span>
                          <span className="text-[13px] text-slate-100 font-mono">
                            {s.hash} → {t.hash}
                          </span>
                          <span className="text-[12px] text-slate-200 font-mono">
                            {e.currency === "INR"
                              ? formatINR(e.amount)
                              : `${e.currency} ${e.amount.toLocaleString()}`}
                          </span>
                          <SeverityBadge severity={e.severity} />
                        </div>
                        {e.note && (
                          <div className="mt-0.5 text-[11.5px] text-slate-400 italic">
                            — {e.note}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </Section>

              <Section title="5 · Risk scoring rationale">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ["Velocity anomaly (z-score 4.2)", 92, "#ef4444"],
                    ["Cross-jurisdiction hops (4 in 62m)", 88, "#ef4444"],
                    ["Counterparty novelty (< 90 d)", 74, "#f59e0b"],
                    ["Fan-out ratio (5.8× baseline)", 81, "#f59e0b"],
                    ["KYC completeness", 34, "#38bdf8"],
                    ["Composite cluster score", 91, "#a78bfa"],
                  ].map(([label, pct, color]) => (
                    <div
                      key={label as string}
                      className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-200">{label}</span>
                        <span
                          className="font-mono"
                          style={{ color: color as string }}
                        >
                          {pct}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${pct as number}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}55)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="6 · Regulatory citations">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-mono">FIU-IND §12A</span> — Reporting of
                    suspicious transactions within 7 working days of detection.
                  </li>
                  <li>
                    <span className="font-mono">FEMA Sch. II</span> — Cross-border
                    fund transfers with terminal offshore beneficiary.
                  </li>
                  <li>
                    <span className="font-mono">FATF Recommendation 16</span> — Wire
                    transfer information-sharing across member institutions.
                  </li>
                  <li>
                    <span className="font-mono">RBI KYC Master Direction 2016</span>{" "}
                    — Enhanced due diligence on flagged endpoints.
                  </li>
                </ul>
              </Section>

              <Section title="7 · Recommended actions">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>File a joint SAR with the four exposed member banks within 72 hours.</li>
                  <li>Freeze the two terminal-beneficiary handles pending review.</li>
                  <li>
                    Request re-verified KYC from originating institution for
                    handles created after 2025-02-01.
                  </li>
                  <li>
                    Share the anonymized cluster fingerprint on the FinGuard
                    consortium channel to prime peer institutions.
                  </li>
                </ol>
              </Section>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-[11px] text-slate-500">
                  Draft prepared by Compliance Officer agent · reviewed by A. Rao ·
                  audit trail retained for 5 years
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-[12px] rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 px-3 py-1.5">
                    Save draft
                  </button>
                  <button className="text-[12px] rounded-md border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 px-3 py-1.5">
                    Send to legal
                  </button>
                  <button className="text-[12px] rounded-md border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 px-3 py-1.5 shadow-glow">
                    File with regulator →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FactCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{ borderColor: `${accent}33`, background: `${accent}0E` }}
    >
      <div
        className="text-[10.5px] uppercase tracking-widest"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div className="mt-1 text-white text-[18px] font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-[11px] uppercase tracking-widest text-emerald-300 mb-1.5">
        {title}
      </div>
      <div className="text-[13px] text-slate-200 leading-relaxed">{children}</div>
    </section>
  );
}
