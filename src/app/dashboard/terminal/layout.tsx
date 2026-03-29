export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      {/* Terminal Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-emerald-900/40 bg-[#0a0f0d]/95 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <h1 className="font-mono text-sm font-bold tracking-widest text-emerald-400 uppercase">
              Visio Auto Market Terminal
            </h1>
          </div>
          <span className="hidden text-xs text-emerald-700 sm:inline">|</span>
          <span className="hidden font-mono text-[11px] text-emerald-700 sm:inline">
            SA Automotive Intelligence
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[11px] text-zinc-500 sm:inline">
            NAAMSA Data
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            {new Date().toLocaleDateString("en-ZA", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-emerald-600">
            {new Date().toLocaleTimeString("en-ZA", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
      </header>

      {/* Dense content area — minimal padding */}
      <main className="p-2">{children}</main>
    </div>
  )
}
