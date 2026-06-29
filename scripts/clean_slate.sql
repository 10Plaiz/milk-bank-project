-- ============================================================
-- MHMBMS Clean-Slate Script
-- Removes all operational data and resets identity sequences.
-- Run this in the Supabase SQL Editor.
--
-- What this does:
--   · Truncates all 14 operational tables in FK-safe order
--   · Resets all identity sequences (CTN, DTN, batch numbers, etc.)
--   · Re-inserts the default pricing config row (required for dispensing)
--   · Does NOT touch auth.users or public.profiles
--     (your login credentials are preserved)
--
-- What this does NOT do:
--   · Delete Supabase Auth users (do that in Auth > Users if needed)
--   · Drop or alter any schema, triggers, or functions
-- ============================================================

BEGIN;

-- Disable audit triggers temporarily so truncate doesn't fire thousands
-- of audit log writes for row deletions (they wouldn't work on TRUNCATE anyway,
-- but this makes intent explicit)

-- Step 1: Truncate all operational tables.
-- ORDER matters — most-dependent tables first.
-- RESTART IDENTITY resets CTN, DTN, batch number, bottle number sequences.
-- CASCADE handles any remaining FK references automatically.
TRUNCATE TABLE
  public.dispensing_items,
  public.email_notifications,
  public.dispensing_records,
  public.bottles,
  public.inquiries,
  public.lab_results,
  public.pasteurization_records,
  public.batch_collections,
  public.batches,
  public.collections,
  public.donor_screenings,
  public.donors,
  public.beneficiaries,
  public.audit_logs,
  public.pricing_config
RESTART IDENTITY CASCADE;

-- Step 2: Re-insert the default pricing configuration.
-- dispensing_records.total_fee is a generated column that reads from
-- dispensing_records.fee_per_ml — the pricing_config row is referenced
-- when a new dispense is created. Without it, the dispense wizard will fail.
INSERT INTO public.pricing_config (price_per_ml, bottle_deposit_amount, effective_from)
VALUES (2.00, 0.00, now());

COMMIT;

-- ============================================================
-- OPTIONAL: Wipe staff accounts too
--
-- Only do this if you want to start with zero users.
-- After running, you will be signed out immediately.
-- Re-register from the login page to create a new admin account
-- (first account registered auto-gets 'staff' role — change it
-- to 'admin' in Supabase > Table Editor > profiles).
--
-- Run these SEPARATELY, AFTER the block above commits:
-- ============================================================
--
-- TRUNCATE TABLE public.profiles RESTART IDENTITY CASCADE;
--
-- Then go to Supabase Dashboard → Authentication → Users
-- and delete the remaining auth.users entries there.
-- (auth.users cannot be truncated via SQL from client connections)
