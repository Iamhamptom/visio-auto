// ---------------------------------------------------------------------------
// Webhook Dispatch Logic
// Finds registered hooks for a dealer + event, sends payloads with retry
// ---------------------------------------------------------------------------

export type WebhookEvent = 'new_lead' | 'signal_detected' | 'lead_scored' | 'test_drive_booked'

interface WebhookRegistration {
  id: string
  dealer_id: string
  url: string
  events: WebhookEvent[]
  is_active: boolean
  created_at: string
}

interface DispatchResult {
  url: string
  status: 'delivered' | 'failed'
  http_status?: number
  attempts: number
  error?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// retryWebhook — POST payload to URL with exponential backoff
// ---------------------------------------------------------------------------

export async function retryWebhook(
  url: string,
  payload: Record<string, unknown>,
  attempt: number = 1
): Promise<{ success: boolean; http_status?: number; error?: string }> {
  const maxAttempts = 3
  const timeoutMs = 10000

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VisioAuto-Webhook': '1.0',
        'X-VisioAuto-Attempt': String(attempt),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (response.ok) {
      return { success: true, http_status: response.status }
    }

    // Non-2xx — retry if attempts remain
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000 // 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryWebhook(url, payload, attempt + 1)
    }

    return { success: false, http_status: response.status, error: `HTTP ${response.status}` }
  } catch (err) {
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryWebhook(url, payload, attempt + 1)
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ---------------------------------------------------------------------------
// dispatchWebhook — Find registered hooks and send to each
// ---------------------------------------------------------------------------

export async function dispatchWebhook(
  event: WebhookEvent,
  dealerId: string,
  payload: Record<string, unknown>
): Promise<{ event: string; dealer_id: string; results: DispatchResult[] }> {
  const results: DispatchResult[] = []
  const supabase = await getSupabase()

  if (!supabase) {
    console.warn('[webhooks] Supabase unavailable — cannot dispatch webhooks')
    return { event, dealer_id: dealerId, results }
  }

  // Fetch all active webhook registrations for this dealer that include this event
  const { data: hooks, error } = await supabase
    .from('va_webhooks')
    .select('*')
    .eq('dealer_id', dealerId)
    .eq('is_active', true)

  if (error || !hooks) {
    console.error('[webhooks] Failed to fetch hooks:', error?.message)
    return { event, dealer_id: dealerId, results }
  }

  // Filter hooks that are registered for this specific event
  const matchingHooks = hooks.filter((hook: WebhookRegistration) => {
    const events = Array.isArray(hook.events) ? hook.events : []
    return events.includes(event)
  })

  if (matchingHooks.length === 0) {
    return { event, dealer_id: dealerId, results }
  }

  // Dispatch to all matching hooks in parallel
  const webhookPayload = {
    event,
    dealer_id: dealerId,
    timestamp: new Date().toISOString(),
    data: payload,
  }

  const dispatches = await Promise.allSettled(
    matchingHooks.map(async (hook: WebhookRegistration) => {
      const result = await retryWebhook(hook.url, webhookPayload)

      // Log delivery status
      try {
        await supabase.from('va_webhook_logs').insert({
          webhook_id: hook.id,
          dealer_id: dealerId,
          event,
          url: hook.url,
          status: result.success ? 'delivered' : 'failed',
          http_status: result.http_status ?? null,
          error: result.error ?? null,
          payload: webhookPayload,
        })
      } catch {
        // Logging failure is non-fatal
      }

      return {
        url: hook.url,
        status: result.success ? 'delivered' : 'failed',
        http_status: result.http_status,
        attempts: result.success ? 1 : 3,
        error: result.error,
      } as DispatchResult
    })
  )

  for (const dispatch of dispatches) {
    if (dispatch.status === 'fulfilled') {
      results.push(dispatch.value)
    } else {
      results.push({
        url: 'unknown',
        status: 'failed',
        attempts: 3,
        error: dispatch.reason instanceof Error ? dispatch.reason.message : String(dispatch.reason),
      })
    }
  }

  return { event, dealer_id: dealerId, results }
}
