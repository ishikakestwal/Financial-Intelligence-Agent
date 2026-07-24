# FinGuard Intelligence

Enterprise-grade, AI-powered collaborative financial intelligence console for **cross-bank financial crime detection**. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Zero-setup mock data — runs instantly.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Views

1. **Command Dashboard** — KPI cards (nodes, monitored volume, flagged rings, privacy-shield), consortium node health, hour × severity risk heatmap, agent fleet status, real-time alert feed, and typology distribution.
2. **Interactive Transaction Graph** — Custom SVG network canvas with bank swimlanes, animated red pulses on high-risk nodes, dashed suspicious flow edges, zoom controls, filters, and a full edge log. Click any node to open the slide-over drawer.
3. **AI Investigator Chat** — Natural-language console. Every query fans out to 4 specialist agents (Graph Analyst, Risk Analyst, Compliance Officer, Investigation Assistant) with confidence pills and evidence citations.
4. **SAR Builder** — Auto-generated Suspicious Activity Reports with cluster tables, transaction chain timeline, risk-scoring rationale, regulator citations, and export actions.

## Structure

```
src/
  app/            Next.js App Router (layout, page, globals)
  components/     AppShell, Sidebar, TopBar, NodeDetailDrawer, views/*, ui/*
  lib/mockData.ts All banks, nodes, edges, alerts, chat seed, and helpers
```

All data is mocked in `src/lib/mockData.ts` — no backend needed.
