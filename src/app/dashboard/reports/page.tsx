"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Send,
  Loader2,
  Calendar,
  Building2,
  Download,
  ChevronDown,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealerOption {
  id: string;
  name: string;
  area: string;
  email: string | null;
}

interface ReportHistory {
  id: string;
  dealer_name: string;
  period: string;
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsDashboard() {
  const [dealers, setDealers] = useState<DealerOption[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<string>("");
  const [period, setPeriod] = useState<string>("last_month");
  const [loading, setLoading] = useState(false);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [reportJson, setReportJson] = useState<Record<string, unknown> | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [dealersLoading, setDealersLoading] = useState(true);

  // Load dealers
  useEffect(() => {
    fetch("/api/dealers")
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || json.dealers || [];
        setDealers(list);
        if (list.length > 0) setSelectedDealer(list[0].id);
      })
      .catch(console.error)
      .finally(() => setDealersLoading(false));
  }, []);

  const generateReport = async () => {
    if (!selectedDealer) return;
    setLoading(true);
    setReportHtml(null);
    setReportJson(null);
    setSent(false);

    try {
      // Fetch both JSON and HTML
      const [jsonRes, htmlRes] = await Promise.all([
        fetch(`/api/reports/roi?dealer_id=${selectedDealer}&period=${period}&format=json`),
        fetch(`/api/reports/roi?dealer_id=${selectedDealer}&period=${period}&format=html`),
      ]);

      const json = await jsonRes.json();
      const html = await htmlRes.text();

      setReportJson(json.report || json);
      setReportHtml(html);

      // Add to history
      const dealer = dealers.find((d) => d.id === selectedDealer);
      if (dealer) {
        setHistory((prev) => [
          {
            id: `${Date.now()}`,
            dealer_name: dealer.name,
            period,
            generated_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendToClient = async () => {
    if (!selectedDealer) return;
    setSending(true);
    try {
      await fetch(`/api/reports/monthly?dealer_id=${selectedDealer}&email=true`);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error("Failed to send report:", err);
    } finally {
      setSending(false);
    }
  };

  const periodLabels: Record<string, string> = {
    this_month: "This Month",
    last_month: "Last Month",
    last_3_months: "Last 3 Months",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold text-white">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Generate ROI reports for dealers and send them automatically.
        </p>
      </div>

      {/* Generate section */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-emerald-400" />
          Generate Report
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          {/* Dealer select */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Dealer
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <select
                value={selectedDealer}
                onChange={(e) => setSelectedDealer(e.target.value)}
                disabled={dealersLoading}
                className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-9 pr-8 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              >
                {dealersLoading && <option>Loading...</option>}
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.area})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Period select */}
          <div className="w-[180px]">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Period
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-9 pr-8 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generateReport}
            disabled={loading || !selectedDealer}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {reportHtml && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Report Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={sendToClient}
                disabled={sending}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                {sending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : sent ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                {sent ? "Sent!" : sending ? "Sending..." : "Send to Client"}
              </button>
              <a
                href={`/api/reports/roi?dealer_id=${selectedDealer}&period=${period}&format=html`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700/50 transition-colors"
              >
                <Download className="h-3 w-3" />
                Open Full Page
              </a>
            </div>
          </div>
          <iframe
            srcDoc={reportHtml}
            className="w-full rounded-xl border border-zinc-800/50 bg-zinc-900"
            style={{ height: "700px" }}
            title="ROI Report Preview"
          />
        </div>
      )}

      {/* Report JSON summary */}
      {reportJson && (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Report Data</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Leads Delivered", value: (reportJson as Record<string, Record<string, unknown>>).kpis?.leads_delivered || 0 },
              { label: "Close Rate", value: `${(reportJson as Record<string, Record<string, unknown>>).kpis?.close_rate || 0}%` },
              { label: "Revenue", value: `R${((reportJson as Record<string, Record<string, number>>).kpis?.total_revenue || 0).toLocaleString()}` },
              { label: "ROI", value: `${(reportJson as Record<string, Record<string, unknown>>).kpis?.roi_multiple || 0}x` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="mt-1 text-lg font-bold font-mono text-white">{String(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report History */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Report History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">
            No reports generated yet. Select a dealer and period above to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{h.dealer_name}</p>
                  <p className="text-xs text-zinc-500">
                    {periodLabels[h.period] || h.period}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(h.generated_at).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
