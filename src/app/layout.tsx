import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JessChatWidget } from "@/components/jess-chat-widget";
import { JessVoiceWidget } from "@/components/jess-voice-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.visiocorp.co";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Visio Auto — AI Sales Agent for Car Dealerships",
    template: "%s · Visio Auto",
  },
  description:
    "An autonomous AI agent that finds, qualifies, and delivers car buyers to your sales team. Predictive signals, personalised outreach, WhatsApp delivery, POPIA-clean. Built for SA dealerships.",
  applicationName: "Visio Auto",
  authors: [{ name: "VisioCorp", url: "https://visiocorp.co" }],
  generator: "Next.js",
  keywords: [
    "AI auto leads",
    "South Africa car dealership",
    "automotive AI agent",
    "vehicle finance affordability",
    "POPIA car dealer",
    "Visio Auto",
    "Eagle Motor City",
  ],
  openGraph: {
    type: "website",
    siteName: "Visio Auto",
    title: "Visio Auto — AI Sales Agent for Car Dealerships",
    description:
      "Predictive signals, AI-qualified leads, POPIA-clean delivery. Built for SA dealerships.",
    url: APP_URL,
    locale: "en_ZA",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Visio Auto — AI sales agent for car dealerships",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visio Auto — AI Sales Agent for Car Dealerships",
    description: "Predictive signals + AI-qualified leads, POPIA-clean. Built for SA dealerships.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <JessChatWidget />
        <JessVoiceWidget />
      </body>
    </html>
  );
}
