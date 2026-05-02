-- =============================================================================
-- Add 'mpesa_till' as a payment method (replacing 'whatsapp')
-- =============================================================================

-- Drop the old constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Add new constraint with 'mpesa_till' included
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'mpesa_till', 'card', 'cash_on_delivery', 'bank_transfer'));

-- Update any existing 'whatsapp' payment methods to 'mpesa_till'
UPDATE public.orders 
SET payment_method = 'mpesa_till' 
WHERE payment_method = 'whatsapp';

COMMENT ON CONSTRAINT orders_payment_method_check ON public.orders IS 'Valid payment methods: mpesa (PayBill), mpesa_till (Buy Goods Till Number 5517358), card, cash_on_delivery, bank_transfer';
