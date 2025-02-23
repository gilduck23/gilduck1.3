/*
  # Add price adjustment column to variants table

  1. Changes
    - Add `price_adjustment` column to `variants` table with numeric type and default value of 0
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'variants' AND column_name = 'price_adjustment'
  ) THEN
    ALTER TABLE variants ADD COLUMN price_adjustment numeric DEFAULT 0;
  END IF;
END $$;
