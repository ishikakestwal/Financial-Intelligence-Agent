"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BANKS,
  bankById,
  formatINR,
  severityColor,
  type GraphNode,
  type GraphEdge,
} from "@/lib/mockData";
import { SeverityBadge } from "../ui/SeverityBadge";
import { NodeDetailDrawer } from "../NodeDetailDrawer";
import { fetchGraph, analyzeGraph } from "@/lib/api";

type FilterKey = "all" | "safe" | "medium" | "high";

export function GraphView() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGraph();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeGraph();
      if (res.graph) {
        setNodes(res.graph.nodes || []);
        setEdges(res.graph.edges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const visibleNodes = useMemo(
    () =>
      nodes.filter((n) => (filter === "all" ? true : n.severity === filter)),
    [filter, nodes]
  );
  const visibleEdges = useMemo(() => {
    const ids = new Set(visibleNodes.map((n) => n.id));
    return edges.filter(
      (e) =>
        ids.has(e.source) &&
        ids.has(e.target) &&
        (filter === "all" ? true : e.severity === filter || filter === "high")
    );
  }, [visibleNodes, filter, edges]);

  const nodeById = (id: string) => nodes.find(n => n.id === id) || nodes[0];

  const W = 1240;
  const H = 560;

  return (
    <div className="p-5">
      <div className="grid grid-cols-12 gap-4">
        {/* Left rail */}
        <aside className="col-span-12 xl:col-span-3 flex flex-col gap-4">
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Cluster Inspector
            </div>
            <div className="mt-1 text-white text-[15px] font-semibold flex items-center justify-between">
              <span>Ring · live</span>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isLoading}
                className="text-[11px] rounded-md border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 px-2 py-1 disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Graph"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Stat label="Nodes" value={String(nodes.length)} color="#38bdf8" />
              <Stat label="Edges" value={String(edges.length)} color="#a78bfa" />
              <Stat
                label="High"
                value={String(nodes.filter((n) => n.severity === "high").length)}
                color="#ef4444"
              />
            </div>
            <div className="divider my-4" />
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
              Institutions
            </div>
            <div className="space-y-2">
              {BANKS.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }}
                  />
                  <span className="text-[12.5px] text-slate-200">{b.name}</span>
                  <span className="ml-auto text-[11px] text-slate-500 font-mono">
                    {b.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Filters
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["all", "high", "medium", "safe"] as FilterKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`text-[12px] rounded-lg border px-2.5 py-1.5 capitalize transition ${
                    filter === k
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="divider my-4" />
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
              Legend
            </div>
            <div className="space-y-1.5 text-[12px] text-slate-300">
              <LegendRow color="#ef4444" label="High-risk node · animated" />
              <LegendRow color="#f59e0b" label="Medium-risk node" />
              <LegendRow color="#22c55e" label="Safe node" />
              <div className="flex items-center gap-2 mt-2">
                <svg width="36" height="10">
                  <line
                    x1="0"
                    y1="5"
                    x2="36"
                    y2="5"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
                <span>Suspicious flow</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="36" height="10">
                  <line x1="0" y1="5" x2="36" y2="5" stroke="#22c55e" strokeWidth="2" />
                </svg>
                <span>Verified flow</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400">
              Recent hops
            </div>
            <div className="mt-2 max-h-56 overflow-auto pr-1 space-y-1.5">
              {edges.slice()
                .sort((a, b) => (b.severity === "high" ? 1 : 0) - (a.severity === "high" ? 1 : 0))
                .slice(0, 8)
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 text-[12px] rounded-md px-2 py-1.5 bg-white/[0.02] border border-white/5"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: severityColor(e.severity) }}
                    />
                    <span className="font-mono text-slate-400">
                      {nodeById(e.source)?.hash.slice(0, 6)}→{nodeById(e.target)?.hash.slice(0, 6)}
                    </span>
                    <span className="ml-auto text-slate-200 font-mono">
                      {formatINR(e.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <section className="col-span-12 xl:col-span-9">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="text-[11px] uppercase tracking-widest text-slate-400">
                  Network Canvas
                </div>
                <span className="text-[11px] rounded px-1.5 py-0.5 bg-red-500/10 border border-red-500/25 text-red-300">
                  1 active ring
                </span>
                <span className="text-[11px] rounded px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-300">
                  3 medium clusters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                  className="w-7 h-7 rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <div className="text-[11px] text-slate-400 font-mono w-10 text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
                  className="w-7 h-7 rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="text-[11px] rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 px-2 py-1"
                >
                  Reset
                </button>
              </div>
            </div>

            <div
              className="relative grid-bg"
              style={{ height: H + 20, overflow: "hidden" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.25s ease",
                }}
              >
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <marker
                      id="arrowRed"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                    </marker>
                    <marker
                      id="arrowAmber"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                    </marker>
                    <marker
                      id="arrowGreen"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                    </marker>
                    <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(239,68,68,0.55)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                    </radialGradient>
                  </defs>

                  {/* Bank swimlanes */}
                  {BANKS.map((b, i) => {
                    const x = 60 + i * 240;
                    return (
                      <g key={b.id} opacity={0.55}>
                        <rect
                          x={x - 40}
                          y={20}
                          width={200}
                          height={H - 40}
                          rx={16}
                          fill={`${b.color}0A`}
                          stroke={`${b.color}22`}
                        />
                        <text
                          x={x + 60}
                          y={42}
                          textAnchor="middle"
                          fontSize={10}
                          letterSpacing={2}
                          fill="#94a3b8"
                        >
                          {b.name.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Edges */}
                  {visibleEdges.map((e) => {
                    const s = nodeById(e.source);
                    const t = nodeById(e.target);
                    if (!s || !t) return null;
                    const color = severityColor(e.severity);
                    const isHigh = e.severity === "high";
                    const marker =
                      e.severity === "high"
                        ? "url(#arrowRed)"
                        : e.severity === "medium"
                        ? "url(#arrowAmber)"
                        : "url(#arrowGreen)";
                    const path = curvePath(s.x, s.y, t.x, t.y);
                    return (
                      <g key={e.id} className="cursor-pointer">
                        <path
                          d={path}
                          fill="none"
                          stroke={color}
                          strokeOpacity={isHigh ? 0.85 : 0.55}
                          strokeWidth={isHigh ? 2 : 1.4}
                          strokeDasharray={isHigh ? "6 6" : undefined}
                          markerEnd={marker}
                          className={isHigh ? "animate-dashmove" : ""}
                          style={{ strokeDashoffset: 0 }}
                        />
                        {isHigh && (
                          <text
                            x={(s.x + t.x) / 2}
                            y={(s.y + t.y) / 2 - 8}
                            textAnchor="middle"
                            fontSize={10}
                            fill="#fca5a5"
                            className="font-mono"
                          >
                            {formatINR(e.amount)}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {visibleNodes.map((n) => {
                    const bank = bankById(n.bankId);
                    const isHover = hover === n.id;
                    const isHigh = n.severity === "high";
                    const color = severityColor(n.severity);
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHover(n.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setSelected(n)}
                      >
                        {isHigh && (
                          <>
                            <circle r={36} fill="url(#redGlow)" />
                            <circle
                              r={22}
                              fill="none"
                              stroke="#ef4444"
                              strokeOpacity={0.55}
                              strokeWidth={1.5}
                            >
                              <animate
                                attributeName="r"
                                from="22"
                                to="38"
                                dur="1.6s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                from="0.75"
                                to="0"
                                dur="1.6s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </>
                        )}
                        <circle
                          r={isHover ? 20 : 17}
                          fill="#0d1117"
                          stroke={color}
                          strokeWidth={isHover ? 2.2 : 1.6}
                          style={{
                            filter: `drop-shadow(0 0 6px ${color}80)`,
                            transition: "r 0.15s ease",
                          }}
                        />
                        <circle r={7} fill={color} opacity={0.9} />
                        <text
                          y={-24}
                          textAnchor="middle"
                          fontSize={10}
                          fill="#e5e7eb"
                          className="font-mono"
                        >
                          {n.hash}
                        </text>
                        <text
                          y={34}
                          textAnchor="middle"
                          fontSize={10}
                          fill="#94a3b8"
                        >
                          {n.label}
                        </text>
                        <rect
                          x={-22}
                          y={40}
                          width={44}
                          height={12}
                          rx={3}
                          fill={`${bank.color}22`}
                          stroke={`${bank.color}55`}
                        />
                        <text
                          y={49}
                          textAnchor="middle"
                          fontSize={8}
                          fill={bank?.color || "#fff"}
                          className="font-mono"
                        >
                          {bank?.code || "UNK"}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* HUD */}
              <div className="pointer-events-none absolute left-3 bottom-3 flex gap-2">
                <div className="rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-[11px] font-mono text-slate-300">
                  MPC · differential-privacy ε=0.42
                </div>
                <div className="rounded-md border border-red-500/25 bg-black/40 px-2.5 py-1.5 text-[11px] font-mono text-red-300">
                  RING DETECTED · n1 → n3 → n5 → n6 → n9
                </div>
              </div>
              <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-[11px] font-mono text-slate-300">
                Click any node · anonymized handle
              </div>
            </div>
          </div>

          {/* Below-canvas: edge log */}
          <div className="mt-4 glass rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="text-[11px] uppercase tracking-widest text-slate-400">
                Edge Log · consortium view
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {visibleEdges.length} events
              </div>
            </div>
            <div className="max-h-56 overflow-auto">
              <table className="w-full text-[12px]">
                <thead className="text-slate-500 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Time</th>
                    <th className="px-4 py-2 font-medium">From</th>
                    <th className="px-4 py-2 font-medium">To</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Severity</th>
                    <th className="px-4 py-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEdges.map((e) => {
                    const s = nodeById(e.source);
                    const t = nodeById(e.target);
                    if (!s || !t) return null;
                    return (
                      <tr
                        key={e.id}
                        className="border-t border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-2 font-mono text-slate-400">
                          {e.timestamp}
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-200">
                          {s.hash}
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-200">
                          {t.hash}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {e.currency === "INR"
                            ? formatINR(e.amount)
                            : `${e.currency} ${e.amount.toLocaleString()}`}
                        </td>
                        <td className="px-4 py-2">
                          <SeverityBadge severity={e.severity} />
                        </td>
                        <td className="px-4 py-2 text-slate-400">
                          {e.note ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <NodeDetailDrawer
        node={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function curvePath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const nx = -dy;
  const ny = dx;
  const len = Math.sqrt(nx * nx + ny * ny) || 1;
  const off = 30;
  const cx = mx + (nx / len) * off;
  const cy = my + (ny / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function Stat({
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
      className="rounded-lg border p-2"
      style={{
        borderColor: `${color}33`,
        background: `${color}0F`,
      }}
    >
      <div className="text-[18px] font-semibold text-white leading-none">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest" style={{ color }}>
        {label}
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span>{label}</span>
    </div>
  );
}
