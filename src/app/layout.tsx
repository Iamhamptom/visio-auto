import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JessChatWidget } from "@/components/jess-chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visio Auto — AI Sales Agent for Car Dealerships",
  description:
    "An autonomous AI agent that finds, qualifies, and delivers car buyers to your sales team. 23 predictive signals, personalised outreach, calendar booking, and WhatsApp delivery in under 30 seconds.",
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
      </body>
    </html>
  );
}
