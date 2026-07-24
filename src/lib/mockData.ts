export type Severity = "safe" | "medium" | "high";

export type Bank = {
  id: string;
  name: string;
  code: string;
  color: string;
};

export type GraphNode = {
  id: string;
  hash: string;
  bankId: string;
  label: string;
  x: number;
  y: number;
  severity: Severity;
  balance: number;
  country: string;
  createdAt: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  amount: number;
  currency: string;
  timestamp: string;
  severity: Severity;
  note?: string;
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  amount: number;
  banks: string[];
  time: string;
};

export type ChatAgent = "Graph Analyst" | "Risk Analyst" | "Compliance Officer" | "Investigation Assistant";

export type ChatMessage = {
  id: string;
  role: "user" | "agent" | "system";
  agent?: ChatAgent;
  content: string;
  time: string;
  confidence?: number;
  citations?: string[];
};

export const BANKS: Bank[] = [
  { id: "b1", name: "Meridian Trust Bank", code: "MTB", color: "#38bdf8" },
  { id: "b2", name: "Northwind Capital", code: "NWC", color: "#a78bfa" },
  { id: "b3", name: "Sterling Union Bank", code: "SUB", color: "#f59e0b" },
  { id: "b4", name: "Pacific Reserve", code: "PRV", color: "#22c55e" },
  { id: "b5", name: "Continental Wealth", code: "CWL", color: "#ec4899" },
];

// Layered layout — three vertical bands to feel like a network
export const NODES: GraphNode[] = [
  { id: "n1", hash: "0xA3F1…9B2C", bankId: "b1", label: "Corporate Vault", x: 120, y: 120, severity: "safe", balance: 4_200_000, country: "IN", createdAt: "2019-04-11" },
  { id: "n2", hash: "0x77E4…13A8", bankId: "b1", label: "Payroll Node", x: 120, y: 260, severity: "safe", balance: 780_000, country: "IN", createdAt: "2020-08-01" },
  { id: "n3", hash: "0xBB09…D14F", bankId: "b2", label: "Shell Alpha", x: 360, y: 90, severity: "high", balance: 12_400_000, country: "SG", createdAt: "2024-11-02" },
  { id: "n4", hash: "0x0C5B…7710", bankId: "b2", label: "Retail Trader", x: 360, y: 240, severity: "medium", balance: 320_000, country: "SG", createdAt: "2022-01-19" },
  { id: "n5", hash: "0xDE21…44EF", bankId: "b3", label: "Layered Mule 01", x: 600, y: 140, severity: "high", balance: 9_800_000, country: "AE", createdAt: "2025-02-08" },
  { id: "n6", hash: "0x91AA…2C6D", bankId: "b3", label: "Layered Mule 02", x: 600, y: 300, severity: "high", balance: 7_600_000, country: "AE", createdAt: "2025-02-10" },
  { id: "n7", hash: "0x4A88…F0B1", bankId: "b4", label: "Import/Export Ltd.", x: 860, y: 100, severity: "medium", balance: 2_150_000, country: "US", createdAt: "2021-06-22" },
  { id: "n8", hash: "0x812F…AA51", bankId: "b4", label: "Merchant Node", x: 860, y: 260, severity: "safe", balance: 640_000, country: "US", createdAt: "2018-11-05" },
  { id: "n9", hash: "0xCE00…981D", bankId: "b5", label: "Offshore Trust", x: 1100, y: 180, severity: "high", balance: 15_300_000, country: "KY", createdAt: "2025-05-14" },
  { id: "n10", hash: "0x22B7…3F09", bankId: "b5", label: "FX Broker", x: 1100, y: 340, severity: "medium", balance: 1_800_000, country: "CH", createdAt: "2023-09-17" },
  { id: "n11", hash: "0x66C2…B4A3", bankId: "b2", label: "Freight Payments", x: 360, y: 380, severity: "safe", balance: 410_000, country: "SG", createdAt: "2020-03-12" },
  { id: "n12", hash: "0xF3D9…7E22", bankId: "b3", label: "Cash Aggregator", x: 600, y: 460, severity: "high", balance: 5_400_000, country: "AE", createdAt: "2025-01-28" },
];

export const EDGES: GraphEdge[] = [
  { id: "e1", source: "n1", target: "n3", amount: 4_800_000, currency: "INR", timestamp: "07-22 14:02", severity: "high", note: "Structured layering" },
  { id: "e2", source: "n3", target: "n5", amount: 4_600_000, currency: "USD", timestamp: "07-22 14:18", severity: "high" },
  { id: "e3", source: "n5", target: "n6", amount: 4_400_000, currency: "USD", timestamp: "07-22 14:41", severity: "high" },
  { id: "e4", source: "n6", target: "n9", amount: 4_300_000, currency: "USD", timestamp: "07-22 15:03", severity: "high", note: "Terminal deposit" },
  { id: "e5", source: "n2", target: "n4", amount: 42_000, currency: "USD", timestamp: "07-22 09:11", severity: "safe" },
  { id: "e6", source: "n4", target: "n7", amount: 88_000, currency: "USD", timestamp: "07-22 10:24", severity: "medium" },
  { id: "e7", source: "n7", target: "n8", amount: 15_000, currency: "USD", timestamp: "07-22 10:51", severity: "safe" },
  { id: "e8", source: "n8", target: "n10", amount: 210_000, currency: "USD", timestamp: "07-22 11:36", severity: "medium" },
  { id: "e9", source: "n11", target: "n12", amount: 3_200_000, currency: "AED", timestamp: "07-22 13:07", severity: "high", note: "Rapid pass-through" },
  { id: "e10", source: "n12", target: "n9", amount: 3_150_000, currency: "USD", timestamp: "07-22 13:44", severity: "high" },
  { id: "e11", source: "n1", target: "n2", amount: 120_000, currency: "INR", timestamp: "07-22 08:02", severity: "safe" },
  { id: "e12", source: "n7", target: "n10", amount: 640_000, currency: "USD", timestamp: "07-22 12:19", severity: "medium" },
  { id: "e13", source: "n3", target: "n12", amount: 1_100_000, currency: "USD", timestamp: "07-22 13:22", severity: "high" },
];

export const ALERTS: AlertItem[] = [
  {
    id: "a1",
    title: "Multi-hop layering ring detected",
    detail: "5 accounts, 4 banks, ₹4.6 Cr routed through 6 hops in 62 minutes.",
    severity: "high",
    amount: 46_000_000,
    banks: ["MTB", "NWC", "SUB", "CWL"],
    time: "2 min ago",
  },
  {
    id: "a2",
    title: "Structuring pattern near threshold",
    detail: "12 deposits of ₹9.8L each across 3 hours from Shell Alpha.",
    severity: "high",
    amount: 11_760_000,
    banks: ["NWC", "SUB"],
    time: "14 min ago",
  },
  {
    id: "a3",
    title: "Cross-border rapid pass-through",
    detail: "Funds settled in AE and exited to KY within 41 minutes.",
    severity: "medium",
    amount: 3_200_000,
    banks: ["SUB", "CWL"],
    time: "37 min ago",
  },
  {
    id: "a4",
    title: "Unusual counterparty diversity",
    detail: "FX Broker fanning out to 26 new counterparties overnight.",
    severity: "medium",
    amount: 1_800_000,
    banks: ["CWL", "PRV"],
    time: "1 hr ago",
  },
  {
    id: "a5",
    title: "Routine payroll batch cleared",
    detail: "Payroll Node → 240 employee accounts, all within norms.",
    severity: "safe",
    amount: 780_000,
    banks: ["MTB"],
    time: "1 hr ago",
  },
  {
    id: "a6",
    title: "Import/Export invoicing verified",
    detail: "Cross-checked against customs manifest #KA-77-1102.",
    severity: "safe",
    amount: 640_000,
    banks: ["PRV"],
    time: "2 hr ago",
  },
];

export const KPIS = {
  nodes: 1_284,
  volume: 12_480_000_000, // INR
  rings: 7,
  saltRotation: "Active · every 12 min",
  privacyBudget: 78, // percent remaining (differential privacy epsilon)
  agentsOnline: 4,
  jurisdictions: 9,
};

export const SEED_CHAT: ChatMessage[] = [
  {
    id: "m0",
    role: "system",
    content: "Session opened · Investigator: A. Rao · Clearance: L3 · Salted graph handle: gph_2f9a7c",
    time: "09:12",
  },
  {
    id: "m1",
    role: "user",
    content: "Show suspicious transactions above ₹10 lakh routed through Shell Alpha in the last 24 hours.",
    time: "09:12",
  },
  {
    id: "m2",
    role: "agent",
    agent: "Graph Analyst",
    content:
      "Identified 6 outbound hops from 0xBB09…D14F (Shell Alpha) to Layered Mule 01/02 and Cash Aggregator, totalling ₹4.6 Cr in 62 minutes. Fan-out ratio 5.8× baseline.",
    time: "09:12",
    confidence: 0.94,
    citations: ["e1", "e2", "e13"],
  },
  {
    id: "m3",
    role: "agent",
    agent: "Risk Analyst",
    content:
      "Cluster risk score 0.91 (High). Matches typology AML-TYP-04 (rapid layering across ≥3 institutions). Velocity anomaly z-score 4.2.",
    time: "09:12",
    confidence: 0.91,
  },
  {
    id: "m4",
    role: "agent",
    agent: "Compliance Officer",
    content:
      "Recommend filing an SAR under FIU-IND §12A within 72 hours. Counterparty Offshore Trust (KY) triggers cross-border reporting under FEMA Sch. II.",
    time: "09:13",
    confidence: 0.88,
  },
  {
    id: "m5",
    role: "agent",
    agent: "Investigation Assistant",
    content:
      "I've queued the cluster gph_2f9a7c for SAR draft. Would you like to freeze the endpoint accounts and notify the partner institutions via the FinGuard consortium channel?",
    time: "09:13",
    confidence: 0.9,
  },
];

export const AGENT_META: Record<
  ChatAgent,
  { color: string; bg: string; icon: string; role: string }
> = {
  "Graph Analyst": {
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.12)",
    icon: "◇",
    role: "Traces topology & flow paths",
  },
  "Risk Analyst": {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: "△",
    role: "Scores anomalies & typologies",
  },
  "Compliance Officer": {
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.14)",
    icon: "◈",
    role: "Maps to regulation & filings",
  },
  "Investigation Assistant": {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "◉",
    role: "Orchestrates next actions",
  },
};

export const SUGGESTED_QUERIES = [
  "Why is Shell Alpha suspicious?",
  "Show all cross-bank transfers above ₹10 lakh today",
  "List rings that touched more than 3 institutions this week",
  "Explain the risk signals for cluster gph_2f9a7c",
  "Which nodes are the terminal beneficiaries?",
];

export function formatINR(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function severityColor(s: Severity) {
  return s === "high"
    ? "#ef4444"
    : s === "medium"
    ? "#f59e0b"
    : "#22c55e";
}

export function bankById(id: string) {
  return BANKS.find((b) => b.id === id)!;
}

export function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}
