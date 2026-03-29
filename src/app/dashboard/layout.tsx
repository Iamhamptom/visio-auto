"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Zap,
  BarChart3,
  Radio,
  Package,
  TrendingUp,
  Plug,
  Send,
  Presentation,
  FileText,
  Settings,
  Bell,
  Car,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Signals", href: "/dashboard/signals", icon: Zap },
  { label: "Market Terminal", href: "/dashboard/terminal", icon: BarChart3 },
  { label: "Social Radar", href: "/dashboard/social", icon: Radio },
  { label: "Inventory", href: "/dashboard/inventory", icon: Package },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { label: "Outreach", href: "/dashboard/outreach", icon: Send },
  { label: "Pitch Builder", href: "/dashboard/pitch", icon: Presentation },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/50 bg-zinc-950 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800/50 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
            <Car className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Visio Auto</span>
          <Badge className="ml-auto text-[10px]">PRO</Badge>
          <button
            className="ml-1 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-emerald-400" : "text-zinc-500"
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-zinc-800/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
              SM
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-zinc-200">
                Sandton Motors
              </p>
              <p className="truncate text-xs text-zinc-500">Growth Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-800/50 bg-zinc-950/50 px-4 backdrop-blur-sm lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-zinc-400" />
            </button>
            <div>
              <h2 className="text-sm font-medium text-white">
                Sandton Motor Group
              </h2>
              <p className="text-xs text-zinc-500">
                Sandton, Gauteng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs md:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">Live</span>
              <span className="font-mono text-emerald-400">15 signals</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
        className
      )}
    >
      {children}
    </span>
  );
}
