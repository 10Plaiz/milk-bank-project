-- patch: status guards for apply_lab_result_to_batch
--
-- Problem: the passed/failed cases had no status guard, so entering a result
-- for a batch not in the expected predecessor state would either silently
-- leave the batch unchanged (if the status transition guard blocked it) or
-- raise a Postgres exception that propagated to the client as an unhandled
-- error — neither visible to the user.
--
-- Fix: mirror the pattern already used by the pending cases. Each outcome
-- only advances the batch if it is in the exact predecessor state that
-- the lifecycle requires.
--
--   pending (pre)  → needs raw           (was already guarded)
--   passed  (pre)  → needs pre_testing   (was UNGUARDED — fixed here)
--   failed  (pre)  → needs pre_testing   (was UNGUARDED — fixed here)
--   pending (post) → needs pasteurized   (was already guarded)
--   passed  (post) → needs post_testing  (was UNGUARDED — fixed here)
--   failed  (post) → needs post_testing  (was UNGUARDED — fixed here)
--
-- Run once in the Supabase SQL editor. No trigger recreation needed —
-- the existing lab_results_apply_batch_status trigger already points
-- to this function; CREATE OR REPLACE updates it in place.

create or replace function public.apply_lab_result_to_batch()
returns trigger
language plpgsql
as $$
begin
  case
    when new.stage = 'pre_pasteurization'  and new.result = 'pending' then
      update public.batches set status = 'pre_testing'
        where id = new.batch_id and status = 'raw';
    when new.stage = 'pre_pasteurization'  and new.result = 'passed'  then
      update public.batches set status = 'pre_test_passed'
        where id = new.batch_id and status = 'pre_testing';
    when new.stage = 'pre_pasteurization'  and new.result = 'failed'  then
      update public.batches set status = 'discarded',
        discarded_reason = 'failed pre-pasteurization lab test'
        where id = new.batch_id and status = 'pre_testing';
    when new.stage = 'post_pasteurization' and new.result = 'pending' then
      update public.batches set status = 'post_testing'
        where id = new.batch_id and status = 'pasteurized';
    when new.stage = 'post_pasteurization' and new.result = 'passed'  then
      update public.batches set status = 'ready'
        where id = new.batch_id and status = 'post_testing';
    when new.stage = 'post_pasteurization' and new.result = 'failed'  then
      update public.batches set status = 'discarded',
        discarded_reason = 'failed post-pasteurization lab test'
        where id = new.batch_id and status = 'post_testing';
    else null;
  end case;
  return new;
end;
$$;
