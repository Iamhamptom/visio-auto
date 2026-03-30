import { NextResponse } from 'next/server'
import { LEAD_PRICING, type LeadPackage } from '@/lib/orders/types'
import { createCheckout } from '@/lib/payments/yoco'

export const maxDuration = 30

async function getSupabase() {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    return createServiceClient()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// GET /api/orders — List orders for a dealer
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const dealer_id = url.searchParams.get('dealer_id')
    const status = url.searchParams.get('status')

    const supabase = await getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    let query = supabase
      .from('va_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (dealer_id) query = query.eq('dealer_id', dealer_id)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to list orders'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/orders — Create a new order + Yoco checkout
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dealer_id, package: pkg, notes } = body as {
      dealer_id: string
      package: string
      notes?: string
    }

    if (!dealer_id) {
      return NextResponse.json({ error: 'dealer_id is required' }, { status: 400 })
    }

    const pricing = LEAD_PRICING[pkg as LeadPackage]
    if (!pricing) {
      const validKeys = Object.keys(LEAD_PRICING).join(', ')
      return NextResponse.json(
        { error: `Invalid package. Must be one of: ${validKeys}` },
        { status: 400 },
      )
    }

    const supabase = await getSupabase()

    // Look up dealer name
    let dealer_name = 'Unknown Dealer'
    if (supabase) {
      const { data: dealer } = await supabase
        .from('va_dealers')
        .select('name')
        .eq('id', dealer_id)
        .single()
      if (dealer?.name) dealer_name = dealer.name
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'https://visioauto.visiocorp.co'

    // Create Yoco checkout
    const checkout = await createCheckout({
      amountInCents: pricing.total,
      description: `Visio Auto — ${pricing.label}`,
      successUrl: `${baseUrl}/dashboard?payment=success&package=${pkg}`,
      cancelUrl: `${baseUrl}/dashboard?payment=cancelled`,
      failureUrl: `${baseUrl}/dashboard?payment=failed`,
      metadata: {
        dealer_id,
        package: pkg,
        product: 'visio-auto-leads',
        quantity: String(pricing.quantity),
      },
    })

    // Store order in DB
    let order = {
      id: crypto.randomUUID(),
      dealer_id,
      dealer_name,
      package: pkg,
      quantity: pricing.quantity,
      price_per_lead: pricing.price_per_lead,
      total_amount: pricing.total,
      status: 'pending_payment',
      leads_delivered: 0,
      yoco_checkout_id: checkout.id,
      notes: notes || null,
      created_at: new Date().toISOString(),
    }

    if (supabase) {
      const { data: inserted, error } = await supabase
        .from('va_orders')
        .insert(order)
        .select()
        .single()

      if (error) {
        console.error('Failed to insert order:', error)
      } else if (inserted) {
        order = inserted
      }
    }

    return NextResponse.json({
      order,
      checkout_url: checkout.redirectUrl,
      checkout_id: checkout.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create order'
    console.error('Order creation error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/orders — Update order status
// ---------------------------------------------------------------------------

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { order_id, status, leads_delivered, payment_id, paid_at, delivered_at } = body as {
      order_id: string
      status?: string
      leads_delivered?: number
      payment_id?: string
      paid_at?: string
      delivered_at?: string
    }

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }

    const supabase = await getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const updates: Record<string, unknown> = {}
    if (status) updates.status = status
    if (leads_delivered !== undefined) updates.leads_delivered = leads_delivered
    if (payment_id) updates.payment_id = payment_id
    if (paid_at) updates.paid_at = paid_at
    if (delivered_at) updates.delivered_at = delivered_at

    const { data, error } = await supabase
      .from('va_orders')
      .update(updates)
      .eq('id', order_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update order'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
