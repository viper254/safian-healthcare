-- =============================================================================
-- Rename 'whatsapp' payment method to 'till' (M-Pesa Till Number)
-- =============================================================================

-- Step 1: Drop the old constraint first
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Step 2: Add new constraint that includes BOTH 'whatsapp' and 'till' temporarily
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'whatsapp', 'till'));

-- Step 3: Update existing orders with 'whatsapp' payment method to 'till'
UPDATE public.orders 
SET payment_method = 'till' 
WHERE payment_method = 'whatsapp';

-- Step 4: Drop the temporary constraint
ALTER TABLE public.orders DROP CONSTRAINT orders_payment_method_check;

-- Step 5: Add final constraint with only 'till' (no 'whatsapp')
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'till'));

-- Step 6: Add comment
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: mpesa (automated), card, cash_on_delivery, bank_transfer, till (M-Pesa Till Number 5517358 - SAFIAN SUPPLIES)';
