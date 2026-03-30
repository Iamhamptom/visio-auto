-- Visio Auto — Orders Table Migration
-- Lead packs + subscription orders with Yoco payment integration

CREATE TABLE IF NOT EXISTS va_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES va_dealers(id),
  dealer_name TEXT,
  package TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_lead INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'paid', 'in_progress', 'delivered', 'partial', 'cancelled'
  )),
  leads_delivered INTEGER DEFAULT 0,
  payment_id TEXT,
  yoco_checkout_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_va_orders_dealer ON va_orders(dealer_id);
CREATE INDEX IF NOT EXISTS idx_va_orders_status ON va_orders(status);
CREATE INDEX IF NOT EXISTS idx_va_orders_checkout ON va_orders(yoco_checkout_id);
