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
      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-none bg-emerald-500/15 px-1.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
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
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/80 px-5 bg-black">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex h-8 w-8 items-center justify-center rounded-none bg-gradient-to-br from-emerald-600 to-emerald-900 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        >
          <Car className="h-4 w-4 text-white" />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-bold tracking-wider text-white uppercase font-mono"
        >
          VISIO AUTO
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 relative z-10 custom-scrollbar">
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
                    "relative flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 group uppercase font-mono",
                    isActive
                      ? "text-white bg-emerald-500/10 border-l-2 border-emerald-500"
                      : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  )}
                >
                  {/* Hover background */}
                  {!isActive && (
                    <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  <item.icon
                    className={cn(
                      "relative z-10 h-4 w-4 transition-colors",
                      isActive ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-zinc-600"
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
                      className="relative z-10 ml-auto h-1.5 w-1.5 rounded-none bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
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
      <div className="border-t border-zinc-800/80 px-4 py-3 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 p-1.5 transition-colors hover:bg-zinc-800/30"
        >
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-200">
              SM
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 border-2 border-black bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-bold text-zinc-200 uppercase tracking-wide font-mono">
              Sandton Motors
            </p>
            <p className="truncate text-[10px] uppercase tracking-widest text-zinc-500">Growth Plan</p>
          </div>
        </motion.div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-black selection:bg-emerald-500/30">
      
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={mounted ? { x: -280, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="hidden w-64 flex-col lg:flex relative z-10 border-r-2 border-zinc-800 bg-carbon"
      >
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
          {sidebarContent}
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 border-emerald-500 bg-carbon lg:hidden box-shadow-[10px_0_30px_rgba(0,0,0,0.8)]"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden h-full relative bg-[#050505]">
        
        <header className="absolute top-0 inset-x-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-black/80 backdrop-blur-md">
          <div className="relative flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 rounded-none hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-zinc-300" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-white tracking-widest uppercase font-mono">
                Sandton Motor Group
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                Location: Sandton, GP // Status: ONLINE
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            {/* Live signal indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden items-center gap-2 rounded-none border-l-2 border-emerald-500 bg-emerald-500/10 px-3 py-1.5 text-xs md:flex"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(16, 185, 129, 0.4)",
                    "0 0 0 6px rgba(16, 185, 129, 0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-none bg-emerald-500"
              />
              <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Signals</span>
              <span className="font-mono font-bold text-emerald-500 text-sm">15</span>
            </motion.div>

            <NotificationBell />
          </div>
        </header>

        {/* Content with page transition */}
        <main className="flex-1 overflow-y-auto p-4 pt-20 lg:p-6 lg:pt-24 custom-scrollbar">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        "inline-flex items-center rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono border border-emerald-500/20",
        className
      )}
    >
      {children}
    </span>
  );
}
