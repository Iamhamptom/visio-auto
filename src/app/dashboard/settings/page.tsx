"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MessageCircle,
  Users,
  Bell,
  Link2,
  CreditCard,
  Key,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={saving}
      className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      size="sm"
    >
      {saving ? (
        <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Save className="mr-2 h-3.5 w-3.5" />
      )}
      {saving ? "Saving..." : "Save"}
    </Button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-emerald-500/10 p-2">
        <Icon className="h-4 w-4 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const [autoReply, setAutoReply] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  async function handleSave(section: string) {
    setSavingSection(section);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setSavingSection(null);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText("va_live_xxxxxxxxxxxxxxxx");
    } catch { /* clipboard not available */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400">
          Configure your dealer profile, notifications, and integrations
        </p>
      </div>

      {/* 1. Dealer Profile */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={Building2}
              title="Dealer Profile"
              description="Your dealership information"
            />
            <SaveButton
              onClick={() => handleSave("profile")}
              saving={savingSection === "profile"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Dealer Name</Label>
              <Input
                defaultValue="Sandton Motor Group"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Group Name</Label>
              <Input
                defaultValue="Sandton Auto Holdings"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Brands</Label>
              <Input
                defaultValue="Toyota, BMW, VW, Mercedes, Hyundai"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
              <p className="text-xs text-zinc-600">Comma-separated</p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Area</Label>
              <Input
                defaultValue="Sandton, Gauteng"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-zinc-300">Phone</Label>
              <Input
                defaultValue="+27 11 784 2000"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                defaultValue="leads@sandtonmotors.co.za"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Website</Label>
              <Input
                defaultValue="https://sandtonmotors.co.za"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. WhatsApp Settings */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={MessageCircle}
              title="WhatsApp Settings"
              description="Configure WhatsApp Business integration"
            />
            <SaveButton
              onClick={() => handleSave("whatsapp")}
              saving={savingSection === "whatsapp"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Business Number</Label>
              <Input
                defaultValue="+27 82 456 7890"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Language Preferences</Label>
              <Select defaultValue="en">
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="af">Afrikaans</SelectItem>
                  <SelectItem value="zu">isiZulu</SelectItem>
                  <SelectItem value="st">Sesotho</SelectItem>
                  <SelectItem value="xh">isiXhosa</SelectItem>
                  <SelectItem value="ts">Xitsonga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">Auto-Reply</p>
              <p className="text-xs text-zinc-500">
                Automatically respond to new leads via WhatsApp
              </p>
            </div>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Lead Preferences */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={Users}
              title="Lead Preferences"
              description="Define what leads you want to receive"
            />
            <SaveButton
              onClick={() => handleSave("leads")}
              saving={savingSection === "leads"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-zinc-300">Min Budget (R)</Label>
              <Input
                type="number"
                defaultValue="200000"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Preferred Brands</Label>
              <Input
                defaultValue="Toyota, BMW, VW"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
              <p className="text-xs text-zinc-600">Comma-separated, or leave empty for all</p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Max Leads Per Day</Label>
              <Select defaultValue="50">
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="10">10 leads</SelectItem>
                  <SelectItem value="25">25 leads</SelectItem>
                  <SelectItem value="50">50 leads</SelectItem>
                  <SelectItem value="100">100 leads</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Notification Settings */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={Bell}
              title="Notification Settings"
              description="Choose how you receive alerts"
            />
            <SaveButton
              onClick={() => handleSave("notifications")}
              saving={savingSection === "notifications"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">WhatsApp Alerts</p>
              <p className="text-xs text-zinc-500">
                Receive new lead notifications via WhatsApp
              </p>
            </div>
            <Switch checked={whatsappAlerts} onCheckedChange={setWhatsappAlerts} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">Email Alerts</p>
              <p className="text-xs text-zinc-500">
                Daily digest and high-score lead alerts
              </p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">SMS Alerts</p>
              <p className="text-xs text-zinc-500">
                SMS for hot leads (score 80+). Additional charges may apply.
              </p>
            </div>
            <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* 5. Inventory Feed */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={Link2}
              title="Inventory Feed"
              description="Sync your inventory automatically from an external feed"
            />
            <SaveButton
              onClick={() => handleSave("inventory")}
              saving={savingSection === "inventory"}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Feed URL</Label>
              <Input
                defaultValue="https://sandtonmotors.co.za/api/inventory.json"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
              <p className="text-xs text-zinc-600">
                JSON or XML feed. We support AutoTrader, Cars.co.za, and custom formats.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Sync Frequency</Label>
              <Select defaultValue="6h">
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="1h">Every hour</SelectItem>
                  <SelectItem value="6h">Every 6 hours</SelectItem>
                  <SelectItem value="12h">Every 12 hours</SelectItem>
                  <SelectItem value="24h">Once daily</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400">
              Last synced: 2 hours ago — 15 vehicles imported
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 6. Subscription */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <SectionHeader
            icon={CreditCard}
            title="Subscription"
            description="Your current plan and billing"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Growth Plan</h4>
                <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  Active
                </Badge>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Up to 200 leads/month, Signal Engine, WhatsApp integration, analytics dashboard
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                R4,999<span className="text-xs font-normal text-zinc-500">/month</span>
              </p>
            </div>
            <Link href="/get-started">
              <Button
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                Upgrade
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { tier: "Starter", price: "R1,999", leads: "50 leads/month", current: false },
              { tier: "Growth", price: "R4,999", leads: "200 leads/month", current: true },
              { tier: "Pro", price: "R9,999", leads: "Unlimited leads", current: false },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={cn(
                  "rounded-lg border p-3",
                  plan.current
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-800/50 bg-zinc-900/30"
                )}
              >
                <p className="text-xs font-semibold text-zinc-300">{plan.tier}</p>
                <p className="text-lg font-bold text-white">{plan.price}</p>
                <p className="text-xs text-zinc-500">{plan.leads}</p>
                {plan.current && (
                  <Badge className="mt-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    Current
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7. API Keys */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={Key}
              title="API Keys"
              description="For external CRM/DMS integrations"
            />
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Live API Key</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  readOnly
                  type={showApiKey ? "text" : "password"}
                  value={showApiKey ? "Your key will appear here" : "********************************"}
                  className="border-zinc-800 bg-zinc-900 pr-10 font-mono text-xs text-zinc-200"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="border-zinc-800 text-zinc-400 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-zinc-600">
              Use this key to push leads or sync inventory from your CRM/DMS.
              Never share this key publicly.
            </p>
          </div>
          <Separator className="bg-zinc-800/50" />
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Last used: 4 hours ago</span>
            <span>Created: 15 Jan 2026</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
