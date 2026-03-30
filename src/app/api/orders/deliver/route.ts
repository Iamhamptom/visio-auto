import { NextResponse } from 'next/server'

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
// POST /api/orders/deliver — Deliver leads against an order
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const { order_id } = (await request.json()) as { order_id: string }

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }

    const supabase = await getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // Fetch the order
    const { data: order, error: orderErr } = await supabase
      .from('va_orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is cancelled' }, { status: 400 })
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ error: 'Order already fully delivered' }, { status: 400 })
    }

    const remaining = order.quantity - (order.leads_delivered || 0)
    if (remaining <= 0) {
      return NextResponse.json({ error: 'All leads already delivered' }, { status: 400 })
    }

    // Find the dealer to get their brands and area for matching
    const { data: dealer } = await supabase
      .from('va_dealers')
      .select('brands, area, city')
      .eq('id', order.dealer_id)
      .single()

    // Find unassigned leads that match the dealer's area/brands
    let leadQuery = supabase
      .from('va_leads')
      .select('*')
      .is('assigned_dealer_id', null)
      .in('status', ['new', 'qualified'])
      .order('ai_score', { ascending: false })
      .limit(remaining)

    if (dealer?.area) {
      leadQuery = leadQuery.eq('area', dealer.area)
    }

    const { data: leads, error: leadsErr } = await leadQuery

    if (leadsErr) {
      return NextResponse.json({ error: leadsErr.message }, { status: 500 })
    }

    const matchedLeads = leads ?? []

    if (matchedLeads.length === 0) {
      // Try broader search without area filter
      const { data: broaderLeads } = await supabase
        .from('va_leads')
        .select('*')
        .is('assigned_dealer_id', null)
        .in('status', ['new', 'qualified'])
        .order('ai_score', { ascending: false })
        .limit(remaining)

      if (broaderLeads && broaderLeads.length > 0) {
        matchedLeads.push(...broaderLeads)
      }
    }

    if (matchedLeads.length === 0) {
      return NextResponse.json({
        message: 'No unassigned leads available for delivery right now. Our signal agents are actively finding new buyers.',
        leads_delivered: 0,
        remaining,
      })
    }

    // Assign leads to the dealer
    const leadIds = matchedLeads.map((l) => l.id)
    const { error: assignErr } = await supabase
      .from('va_leads')
      .update({ assigned_dealer_id: order.dealer_id })
      .in('id', leadIds)

    if (assignErr) {
      return NextResponse.json({ error: assignErr.message }, { status: 500 })
    }

    // Update order
    const newDelivered = (order.leads_delivered || 0) + matchedLeads.length
    const isComplete = newDelivered >= order.quantity
    const newStatus = isComplete ? 'delivered' : 'partial'

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('va_orders')
      .update({
        leads_delivered: newDelivered,
        status: newStatus,
        ...(isComplete ? { delivered_at: new Date().toISOString() } : {}),
      })
      .eq('id', order_id)
      .select()
      .single()

    if (updateErr) {
      console.error('Failed to update order after delivery:', updateErr)
    }

    return NextResponse.json({
      message: isComplete
        ? `All ${newDelivered} leads delivered!`
        : `Delivered ${matchedLeads.length} leads (${newDelivered}/${order.quantity} total). More being sourced.`,
      order: updatedOrder ?? { ...order, leads_delivered: newDelivered, status: newStatus },
      leads_delivered_now: matchedLeads.length,
      leads_delivered_total: newDelivered,
      remaining: order.quantity - newDelivered,
      leads: matchedLeads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        area: l.area,
        budget_min: l.budget_min,
        budget_max: l.budget_max,
        preferred_brand: l.preferred_brand,
        ai_score: l.ai_score,
        score_tier: l.score_tier,
      })),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delivery failed'
    console.error('Lead delivery error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
