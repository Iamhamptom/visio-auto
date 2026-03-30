import { createAgentUIStreamResponse, UIMessage } from 'ai'
import { createDealerAgent } from '@/lib/agents/visio-agent'

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    messages,
    dealer_id,
  }: { messages: UIMessage[]; dealer_id?: string } = await req.json()

  // Fetch dealer info if we have an ID, otherwise use defaults
  let dealer = {
    id: dealer_id || 'unknown',
    name: 'Dealer',
    brands: [] as string[],
    area: 'Gauteng',
    tier: 'starter',
  }

  if (dealer_id) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'https://visio-auto.vercel.app'
      const res = await fetch(`${baseUrl}/api/dealers?id=${dealer_id}`)
      if (res.ok) {
        const data = await res.json()
        const d = Array.isArray(data) ? data[0] : data
        if (d) {
          dealer = {
            id: d.id,
            name: d.name || 'Dealer',
            brands: d.brands || [],
            area: d.area || 'Gauteng',
            tier: d.tier || 'starter',
          }
        }
      }
    } catch {
      // Fall through with defaults
    }
  }

  const agent = createDealerAgent(dealer)

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  })
}
