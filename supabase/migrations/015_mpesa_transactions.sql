-- =============================================================================
-- M-Pesa STK Push transaction tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  merchant_request_id TEXT,
  checkout_request_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'paid', 'failed', 'mismatch')),
  result_code INTEGER,
  result_description TEXT,
  mpesa_receipt_number TEXT UNIQUE,
  transaction_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_order
  ON public.mpesa_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status
  ON public.mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_created
  ON public.mpesa_transactions(created_at DESC);

ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mpesa_transactions_select_own" ON public.mpesa_transactions;
CREATE POLICY "mpesa_transactions_select_own"
  ON public.mpesa_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = mpesa_transactions.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP TRIGGER IF EXISTS trg_mpesa_transactions_updated ON public.mpesa_transactions;
CREATE TRIGGER trg_mpesa_transactions_updated
  BEFORE UPDATE ON public.mpesa_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.mpesa_transactions IS
  'Server-managed Safaricom Daraja STK Push records. Writes are performed only by the server callback/initiation routes.';
