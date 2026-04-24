-- Add 'whatsapp' as a valid payment method

-- Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Add new constraint with 'whatsapp' included
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('mpesa','card','cash_on_delivery','bank_transfer','whatsapp'));

-- Also make customer_email and customer_phone nullable for WhatsApp orders
ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN customer_phone DROP NOT NULL;
