-- Add 'whatsapp' to payment_method enum
-- This is a critical fix for the checkout flow

-- Drop the existing constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Add new constraint with 'whatsapp' included
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'whatsapp'));

-- Update any existing orders that might have failed
-- (This is safe even if no rows exist)
UPDATE public.orders 
SET payment_method = 'whatsapp' 
WHERE payment_method NOT IN ('mpesa', 'card', 'cash_on_delivery', 'bank_transfer', 'whatsapp');
