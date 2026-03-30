import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/payments/yoco'

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
// POST /api/orders/webhook — Yoco payment confirmation for lead orders
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('webhook-signature') || ''

    // Verify webhook signature
    if (process.env.YOCO_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(rawBody, signature)) {
        console.error('Orders webhook: signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody)
    const { type, payload } = body

    const supabase = await getSupabase()
    if (!supabase) {
      console.error('Orders webhook: database not available')
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    if (type === 'payment.succeeded') {
      const metadata = payload?.metadata as Record<string, string> | undefined
      const checkoutId = payload?.checkoutId || payload?.id

      if (metadata?.product === 'visio-auto-leads' && checkoutId) {
        // Find the order by checkout ID
        const { data: order, error: findErr } = await supabase
          .from('va_orders')
          .select('*')
          .eq('yoco_checkout_id', checkoutId)
          .single()

        if (findErr || !order) {
          console.error('Orders webhook: order not found for checkout', checkoutId)
          return NextResponse.json({ status: 'order_not_found' })
        }

        // Update order to paid
        const { error: updateErr } = await supabase
          .from('va_orders')
          .update({
            status: 'paid',
            payment_id: payload?.paymentId || checkoutId,
            paid_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        if (updateErr) {
          console.error('Orders webhook: failed to update order:', updateErr)
        } else {
          console.log(`Orders webhook: order ${order.id} paid — ${order.quantity} leads for ${order.dealer_name}`)
        }

        // Trigger immediate lead delivery
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://visioauto.visiocorp.co'
          await fetch(`${baseUrl}/api/orders/deliver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: order.id }),
          })
          console.log(`Orders webhook: delivery triggered for order ${order.id}`)
        } catch (deliverErr) {
          console.error('Orders webhook: delivery trigger failed:', deliverErr)
          // Not fatal — delivery can be retried
        }

        // Send WhatsApp notification
        try {
          const { data: dealer } = await supabase
            .from('va_dealers')
            .select('whatsapp_number, phone')
            .eq('id', order.dealer_id)
            .single()

          const phone = dealer?.whatsapp_number || dealer?.phone
          if (phone) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://visioauto.visiocorp.co'
            await fetch(`${baseUrl}/api/whatsapp/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone,
                message: `Payment confirmed! Your ${order.quantity} AI-qualified leads are being prepared. We'll deliver to your dashboard within 24 hours. Track your order at ${baseUrl}/dashboard`,
              }),
            })
          }
        } catch (whatsappErr) {
          console.error('Orders webhook: WhatsApp notification failed:', whatsappErr)
        }
      }
    }

    if (type === 'payment.failed') {
      const checkoutId = payload?.checkoutId || payload?.id
      if (checkoutId) {
        await supabase
          .from('va_orders')
          .update({ status: 'cancelled' })
          .eq('yoco_checkout_id', checkoutId)
      }
    }

    return NextResponse.json({ status: 'processed' })
  } catch (error) {
    console.error('Orders webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
