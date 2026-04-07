"use client";

import Script from "next/script";
import React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { "agent-id"?: string },
        HTMLElement
      >;
    }
  }
}

/**
 * JessVoiceWidget — the ElevenLabs Conversational AI widget.
 *
 * Renders a floating "Call Jess" pill in the bottom-right that opens a
 * full-duplex voice conversation with the ElevenLabs agent. The agent is
 * Jess, voice = Claire (native SA), brain = Gemini 2.0 Flash with the
 * full Visio Auto system prompt, tools = webhooks to /api/jess/tools.
 *
 * Public agent id is injected via env at build time. Secret key stays
 * server-side.
 */
export function JessVoiceWidget() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_JESS_AGENT_ID;
  if (!agentId) return null;

  return (
    <>
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
        async
      />
    </>
  );
}
