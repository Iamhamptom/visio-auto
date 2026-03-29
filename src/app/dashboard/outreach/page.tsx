"use client";

import { useState } from "react";
import {
  Send,
  Mail,
  Link2,
  MessageSquare,
  FileText,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Users,
  Clock,
  MailOpen,
  Reply,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OutreachType = "cold_email" | "follow_up" | "linkedin_dm" | "whatsapp" | "brief";

interface GeneratedContent {
  subject?: string;
  body?: string;
  messages?: Array<{ step: number; label: string; content: string }>;
  title?: string;
  summary?: string;
  signals?: string[];
  action_items?: string[];
  type: string;
  generated_at: string;
}

interface QueueItem {
  id: string;
  dealer_name: string;
  dealer_id: string;
  type: OutreachType;
  subject?: string;
  status: "pending" | "sent" | "opened" | "replied";
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Demo dealers
// ---------------------------------------------------------------------------

const DEALERS = [
  { id: "d-001", name: "Motus Toyota Kempton Park", brands: "Toyota", area: "Kempton Park" },
  { id: "d-002", name: "BMW Bryanston (JSN Motors)", brands: "BMW", area: "Bryanston" },
  { id: "d-003", name: "Audi Centre Sandton", brands: "Audi", area: "Sandton" },
  { id: "d-004", name: "Mercedes-Benz Sandton", brands: "Mercedes-Benz", area: "Sandton" },
  { id: "d-005", name: "Hatfield VW", brands: "Volkswagen", area: "Hatfield" },
  { id: "d-006", name: "NTT Toyota Menlyn", brands: "Toyota", area: "Menlyn" },
  { id: "d-007", name: "CMH Kia Sandton", brands: "Kia", area: "Sandton" },
  { id: "d-008", name: "Pharoah Auto", brands: "Porsche, Ferrari, Lamborghini", area: "Sandton" },
  { id: "d-009", name: "Halfway Toyota Fourways", brands: "Toyota", area: "Fourways" },
  { id: "d-010", name: "SMH BMW Oakdene", brands: "BMW", area: "Oakdene" },
];

const TYPE_OPTIONS: Array<{ value: OutreachType; label: string; icon: typeof Mail }> = [
  { value: "cold_email", label: "Cold Email", icon: Mail },
  { value: "follow_up", label: "Follow-Up Email", icon: Reply },
  { value: "linkedin_dm", label: "LinkedIn DM", icon: Link2 },
  { value: "whatsapp", label: "WhatsApp Campaign", icon: MessageSquare },
  { value: "brief", label: "Dealer Brief", icon: FileText },
];

// Demo campaign history
const CAMPAIGN_HISTORY: QueueItem[] = [
  { id: "out-1", dealer_name: "Motus Toyota Kempton Park", dealer_id: "d-001", type: "cold_email", subject: "AI-Qualified Toyota Buyers Delivered to Your WhatsApp", status: "opened", generated_at: "2026-03-28T09:00:00Z" },
  { id: "out-2", dealer_name: "BMW Bryanston (JSN Motors)", dealer_id: "d-002", type: "cold_email", subject: "BMW Buyers in Bryanston — We Found 12 This Week", status: "replied", generated_at: "2026-03-27T14:30:00Z" },
  { id: "out-3", dealer_name: "Audi Centre Sandton", dealer_id: "d-003", type: "linkedin_dm", subject: "LinkedIn DM — Michael Fourie", status: "sent", generated_at: "2026-03-27T10:15:00Z" },
  { id: "out-4", dealer_name: "Mercedes-Benz Sandton", dealer_id: "d-004", type: "whatsapp", subject: "4-Message WhatsApp Sequence", status: "pending", generated_at: "2026-03-26T16:00:00Z" },
  { id: "out-5", dealer_name: "Hatfield VW", dealer_id: "d-005", type: "follow_up", subject: "Quick follow-up — VW buyers in Hatfield", status: "opened", generated_at: "2026-03-25T08:45:00Z" },
];

// ---------------------------------------------------------------------------
// KPI stats
// ---------------------------------------------------------------------------

const OUTREACH_KPIS = [
  { label: "Campaigns Sent", value: "47", icon: Send, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Open Rate", value: "62%", icon: MailOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Reply Rate", value: "18%", icon: Reply, color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Dealers Reached", value: "23", icon: Users, color: "text-amber-400", bg: "bg-amber-400/10" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OutreachDashboard() {
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [outreachType, setOutreachType] = useState<OutreachType>("cold_email");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>(CAMPAIGN_HISTORY);

  // Toggle dealer selection
  function toggleDealer(dealerId: string) {
    setSelectedDealers((prev) =>
      prev.includes(dealerId)
        ? prev.filter((id) => id !== dealerId)
        : [...prev, dealerId]
    );
  }

  // Select all / none
  function toggleAll() {
    if (selectedDealers.length === DEALERS.length) {
      setSelectedDealers([]);
    } else {
      setSelectedDealers(DEALERS.map((d) => d.id));
    }
  }

  // Generate outreach
  async function handleGenerate() {
    if (selectedDealers.length === 0) return;
    setGenerating(true);
    setGeneratedContent(null);

    try {
      if (selectedDealers.length === 1) {
        // Single dealer — use /api/outreach/generate
        const res = await fetch("/api/outreach/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dealer_id: selectedDealers[0],
            type: outreachType,
          }),
        });
        const json = await res.json();
        if (json.success && json.content) {
          setGeneratedContent({ ...json.content, type: outreachType });
          // Add to queue
          const dealer = DEALERS.find((d) => d.id === selectedDealers[0]);
          const newItem: QueueItem = {
            id: `out-${Date.now().toString(36)}`,
            dealer_name: dealer?.name || "Unknown",
            dealer_id: selectedDealers[0],
            type: outreachType,
            subject: json.content.subject || json.content.title || outreachType,
            status: "pending",
            generated_at: new Date().toISOString(),
          };
          setQueue((prev) => [newItem, ...prev]);
        }
      } else {
        // Multiple dealers — use /api/outreach/bulk
        const res = await fetch("/api/outreach/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dealer_ids: selectedDealers,
            type: outreachType,
          }),
        });
        const json = await res.json();
        if (json.success && json.results?.length > 0) {
          // Show first result in preview
          const first = json.results[0];
          setGeneratedContent({ ...first.email, type: outreachType });
          // Add all to queue
          const newItems: QueueItem[] = json.results.map(
            (r: { dealer_id: string; dealer_name: string; email: { subject: string } }) => ({
              id: `out-${Date.now().toString(36)}-${r.dealer_id}`,
              dealer_name: r.dealer_name,
              dealer_id: r.dealer_id,
              type: outreachType,
              subject: r.email.subject,
              status: "pending" as const,
              generated_at: new Date().toISOString(),
            })
          );
          setQueue((prev) => [...newItems, ...prev]);
        }
      }
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  // Copy to clipboard
  async function handleCopy() {
    if (!generatedContent) return;
    const text = generatedContent.body || generatedContent.messages?.map((m) => m.content).join("\n\n") || generatedContent.summary || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Status badge colors
  function statusBadge(status: QueueItem["status"]) {
    const styles: Record<string, string> = {
      pending: "bg-zinc-500/10 text-zinc-400",
      sent: "bg-blue-500/10 text-blue-400",
      opened: "bg-emerald-500/10 text-emerald-400",
      replied: "bg-purple-500/10 text-purple-400",
    };
    return (
      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  // Type icon
  function typeIcon(type: OutreachType) {
    const icons: Record<OutreachType, typeof Mail> = {
      cold_email: Mail,
      follow_up: Reply,
      linkedin_dm: Link2,
      whatsapp: MessageSquare,
      brief: FileText,
    };
    const Icon = icons[type] || Mail;
    return <Icon className="h-3.5 w-3.5 text-zinc-500" />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">AI Outreach</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Claude-powered personalized dealer outreach — emails, LinkedIn DMs, WhatsApp campaigns
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/10">
          <Sparkles className="mr-1 h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OUTREACH_KPIS.map((kpi) => (
          <Card key={kpi.label} className="border-zinc-800/50 bg-zinc-900/50">
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-white">{kpi.value}</p>
                  <p className="text-xs text-zinc-500">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800/50">
          <TabsTrigger value="create" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            Campaign Creator
          </TabsTrigger>
          <TabsTrigger value="queue" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            Queue ({queue.filter((q) => q.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            History
          </TabsTrigger>
        </TabsList>

        {/* ---- Campaign Creator Tab ---- */}
        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left: Dealer Selection + Type */}
            <Card className="border-zinc-800/50 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Select Dealers</span>
                  <button
                    onClick={toggleAll}
                    className="text-xs font-normal text-emerald-400 hover:text-emerald-300"
                  >
                    {selectedDealers.length === DEALERS.length ? "Deselect All" : "Select All"}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Dealer list */}
                <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
                  {DEALERS.map((dealer) => {
                    const selected = selectedDealers.includes(dealer.id);
                    return (
                      <button
                        key={dealer.id}
                        onClick={() => toggleDealer(dealer.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          selected
                            ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                            : "hover:bg-zinc-800/50"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-zinc-700"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate font-medium ${selected ? "text-emerald-400" : "text-zinc-300"}`}>
                            {dealer.name}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {dealer.brands} — {dealer.area}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Outreach type selector */}
                <div className="border-t border-zinc-800/50 pt-3">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Outreach Type
                  </label>
                  <Select
                    value={outreachType}
                    onValueChange={(v) => setOutreachType(v as OutreachType)}
                  >
                    <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900">
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-zinc-300">
                          <div className="flex items-center gap-2">
                            <opt.icon className="h-3.5 w-3.5 text-zinc-500" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate button */}
                <Button
                  onClick={handleGenerate}
                  disabled={selectedDealers.length === 0 || generating}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating with Claude...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate for {selectedDealers.length} Dealer{selectedDealers.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>

                {selectedDealers.length > 1 && outreachType !== "cold_email" && (
                  <p className="text-xs text-amber-400">
                    Bulk generation currently supports cold emails only. Other types will use individual generation.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Right: Preview Panel */}
            <Card className="border-zinc-800/50 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Preview</span>
                  {generatedContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-zinc-400 hover:text-white"
                    >
                      {copied ? (
                        <Check className="mr-1 h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="mr-1 h-3 w-3" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedContent && !generating && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                      <Sparkles className="h-5 w-5 text-zinc-500" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">
                      Select dealers and click Generate to create AI-powered outreach
                    </p>
                  </div>
                )}

                {generating && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    <p className="mt-3 text-sm text-zinc-400">
                      Claude is writing personalised outreach...
                    </p>
                  </div>
                )}

                {generatedContent && !generating && (
                  <div className="space-y-4">
                    {/* Email-type content */}
                    {(generatedContent.type === "cold_email" ||
                      generatedContent.type === "follow_up" ||
                      generatedContent.type === "linkedin_dm") && (
                      <>
                        {generatedContent.subject && (
                          <div>
                            <label className="text-xs font-medium text-zinc-500">Subject</label>
                            <p className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
                              {generatedContent.subject}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-zinc-500">
                            {generatedContent.type === "linkedin_dm" ? "Message" : "Body"}
                          </label>
                          <div className="mt-1 max-h-[400px] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans leading-relaxed">
                              {generatedContent.body}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}

                    {/* WhatsApp sequence */}
                    {generatedContent.type === "whatsapp" && generatedContent.messages && (
                      <div className="space-y-3">
                        {generatedContent.messages.map((msg) => (
                          <div
                            key={msg.step}
                            className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                          >
                            <div className="mb-1.5 flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                                {msg.step}
                              </span>
                              <span className="text-xs font-medium text-zinc-400">
                                {msg.label}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dealer brief */}
                    {generatedContent.type === "brief" && (
                      <div className="space-y-3">
                        {generatedContent.title && (
                          <h3 className="text-sm font-semibold text-white">
                            {generatedContent.title}
                          </h3>
                        )}
                        {generatedContent.summary && (
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {generatedContent.summary}
                          </p>
                        )}
                        {generatedContent.signals && generatedContent.signals.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-zinc-500">Signals</label>
                            <ul className="mt-1 space-y-1">
                              {generatedContent.signals.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                  <Zap className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {generatedContent.action_items && generatedContent.action_items.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-zinc-500">Action Items</label>
                            <ul className="mt-1 space-y-1">
                              {generatedContent.action_items.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                  <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-amber-400 rotate-[-90deg]" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-2 border-t border-zinc-800/50 pt-2">
                      <Clock className="h-3 w-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-600">
                        Generated {new Date(generatedContent.generated_at).toLocaleString("en-ZA")}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- Queue Tab ---- */}
        <TabsContent value="queue">
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Campaign Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="text-zinc-500">Type</TableHead>
                    <TableHead className="text-zinc-500">Dealer</TableHead>
                    <TableHead className="text-zinc-500">Subject</TableHead>
                    <TableHead className="text-zinc-500">Status</TableHead>
                    <TableHead className="text-zinc-500">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue
                    .filter((q) => q.status === "pending")
                    .map((item) => (
                      <TableRow key={item.id} className="border-zinc-800/30 hover:bg-zinc-800/30">
                        <TableCell>{typeIcon(item.type)}</TableCell>
                        <TableCell className="font-medium text-zinc-200">{item.dealer_name}</TableCell>
                        <TableCell className="max-w-[240px] truncate text-zinc-400">{item.subject}</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {new Date(item.generated_at).toLocaleDateString("en-ZA")}
                        </TableCell>
                      </TableRow>
                    ))}
                  {queue.filter((q) => q.status === "pending").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                        No pending outreach. Generate a campaign to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- History Tab ---- */}
        <TabsContent value="history">
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Campaign History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="text-zinc-500">Type</TableHead>
                    <TableHead className="text-zinc-500">Dealer</TableHead>
                    <TableHead className="text-zinc-500">Subject</TableHead>
                    <TableHead className="text-zinc-500">Status</TableHead>
                    <TableHead className="text-zinc-500">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => (
                    <TableRow key={item.id} className="border-zinc-800/30 hover:bg-zinc-800/30">
                      <TableCell>{typeIcon(item.type)}</TableCell>
                      <TableCell className="font-medium text-zinc-200">{item.dealer_name}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-zinc-400">{item.subject}</TableCell>
                      <TableCell>{statusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        {new Date(item.generated_at).toLocaleDateString("en-ZA")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
