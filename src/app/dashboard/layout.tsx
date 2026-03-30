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
  ChevronRight,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "AI Agent", href: "/dashboard/chat", icon: Bot, badge: false },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Signals", href: "/dashboard/signals", icon: Zap, badge: true },
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

const externalLinks = [
  { label: "Why Visio Auto", href: "/why-visio-auto", icon: Zap },
  { label: "Get Started", href: "/get-started", icon: Users },
];

function NotificationBell() {
  const [count] = useState(3);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-zinc-400 hover:text-white"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.5 }}
          className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
        >
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {count}
          </motion.span>
        </motion.span>
      )}
    </Button>
  );
}

function SignalBadge() {
  const [count] = useState(15);

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.8 }}
      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/15 px-1.5 text-[10px] font-bold text-emerald-400"
    >
      <motion.span
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {count}
      </motion.span>
    </motion.span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/50 px-5">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20"
        >
          <Car className="h-4 w-4 text-white" />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold text-white"
        >
          Visio Auto
        </motion.span>
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
        <ul className="space-y-0.5">
          {navItems.map((item, index) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.05 * index + 0.15,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 rounded-lg bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      "relative z-10 h-4 w-4 transition-colors",
                      isActive ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>

                  {/* Signal live badge */}
                  {item.badge && <SignalBadge />}

                  {/* Active dot */}
                  {isActive && !item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400"
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* Client-facing links */}
        <div className="mt-6 border-t border-zinc-800/50 pt-4">
          <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            For Dealers
          </p>
          <ul className="space-y-0.5">
            {externalLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
                >
                  <item.icon className="h-4 w-4 text-zinc-600" />
                  {item.label}
                  <ChevronRight className="ml-auto h-3 w-3 text-zinc-700" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User area at bottom */}
      <div className="border-t border-zinc-800/50 px-4 py-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-zinc-800/30"
        >
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-xs font-bold text-zinc-200 ring-2 ring-zinc-700/50">
              SM
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-zinc-200">
              Sandton Motors
            </p>
            <p className="truncate text-[11px] text-zinc-500">Growth Plan</p>
          </div>
        </motion.div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={mounted ? { x: -280 } : false}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden w-64 flex-col border-r border-zinc-800/50 bg-zinc-950 lg:flex"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/50 bg-zinc-950 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Glass-effect top bar */}
        <header className="relative flex h-14 items-center justify-between border-b border-zinc-800/50 px-4 lg:px-6">
          {/* Glass background */}
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xl" />

          <div className="relative flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-zinc-400" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Sandton Motor Group
              </h2>
              <p className="text-[11px] text-zinc-500">
                Sandton, Gauteng
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            {/* Live signal indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs md:flex"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(16, 185, 129, 0.4)",
                    "0 0 0 6px rgba(16, 185, 129, 0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              />
              <span className="text-zinc-400">Live</span>
              <span className="font-mono font-semibold text-emerald-400">15 signals</span>
            </motion.div>

            <NotificationBell />
          </div>
        </header>

        {/* Content with page transition */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 lg:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
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
