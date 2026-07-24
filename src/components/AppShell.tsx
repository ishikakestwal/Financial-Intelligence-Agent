"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandDashboard } from "./views/CommandDashboard";
import { GraphView } from "./views/GraphView";
import { InvestigatorChat } from "./views/InvestigatorChat";
import { SARReports } from "./views/SARReports";
import { UploadView } from "./views/UploadView";

export type ViewKey = "dashboard" | "graph" | "chat" | "sar" | "upload";

export function AppShell({ children: _children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [liveFeed, setLiveFeed] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} onChange={setView} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          view={view}
          liveFeed={liveFeed}
          onToggleFeed={() => setLiveFeed((v) => !v)}
        />
        <main className="flex-1 min-w-0 overflow-auto">
          {view === "dashboard" && <CommandDashboard liveFeed={liveFeed} />}
          {view === "graph" && <GraphView />}
          {view === "chat" && <InvestigatorChat />}
          {view === "sar" && <SARReports />}
          {view === "upload" && <UploadView />}
        </main>
      </div>
    </div>
  );
}
