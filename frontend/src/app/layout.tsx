import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "FinGuard Intelligence · Cross-Bank Financial Crime Command",
  description:
    "Privacy-preserving, multi-agent AI console for cross-institution financial crime detection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-finguard-bg text-slate-200 radial-glow">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
