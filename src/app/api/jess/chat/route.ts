import { createAgentUIStreamResponse, UIMessage } from 'ai'
import { createJessAgentForModel, pickJessModel } from '@/lib/agents/jess-agent'

export const maxDuration = 60

function extractText(msg: UIMessage): string {
  const anyMsg = msg as unknown as {
    content?: unknown
    parts?: Array<{ type?: string; text?: string }>
  }
  if (typeof anyMsg.content === 'string') return anyMsg.content
  if (Array.isArray(anyMsg.parts)) {
    return anyMsg.parts
      .filter((p) => p && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text as string)
      .join('\n')
  }
  if (Array.isArray(anyMsg.content)) {
    return (anyMsg.content as Array<{ type?: string; text?: string }>)
      .filter((p) => p && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text as string)
      .join('\n')
  }
  return ''
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const text = lastUser ? extractText(lastUser) : ''
  const tier = pickJessModel(text, text.length / 4)
  const agent = createJessAgentForModel(tier)

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  })
}
