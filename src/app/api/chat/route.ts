import { createAgentUIStreamResponse, UIMessage } from 'ai'
import { visioAgent } from '@/lib/agents/visio-agent'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  return createAgentUIStreamResponse({
    agent: visioAgent,
    uiMessages: messages,
  })
}
