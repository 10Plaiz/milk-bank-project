-- Patch: notification_templates table
--
-- Moves email notification templates from browser localStorage to the database
-- so that admin edits propagate to all users and persist across devices.
--
-- Run once against the live Supabase project.
-- Safe to re-run (idempotent).

begin;

create table if not exists public.notification_templates (
  id          text        primary key,
  body        text        not null,
  updated_by  uuid        references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

create or replace trigger notification_templates_set_updated_at
before update on public.notification_templates
for each row execute function public.set_updated_at();

alter table public.notification_templates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'notification_templates'
      and policyname = 'staff_select_notification_templates'
  ) then
    create policy staff_select_notification_templates
      on public.notification_templates for select
      using (public.current_profile_is_staff());
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'notification_templates'
      and policyname = 'admin_manage_notification_templates'
  ) then
    create policy admin_manage_notification_templates
      on public.notification_templates for all
      using (public.current_profile_is_admin())
      with check (public.current_profile_is_admin());
  end if;
end;
$$;

-- Seed defaults — will not overwrite rows already customised by admins.
insert into public.notification_templates (id, body) values
  (
    'milkAvailable',
    'Magandang araw po! Ang hinihintay na gatas para kay [BABY_NAME] ay handa na. Pumunta po kayo sa Makati Human Milk Bank sa 1126 Rodriguez Ave., Brgy. Bangkal, Makati City para sa dispensing. Para sa katanungan, tawagan po kami sa 8888-7777.'
  ),
  (
    'dispensingConfirmation',
    'Kumpirmasyon: [VOLUME]mL ng pasteurized na gatas ay inilabas na para kay [BABY_NAME]. Kabuuang bayad: ₱[TOTAL_FEE]. Maraming salamat sa inyong tiwala sa Makati Human Milk Bank.'
  ),
  (
    'statusUpdate',
    'Update sa inyong application: [STATUS]. Para sa karagdagang impormasyon, makipag-ugnayan po sa Makati Human Milk Bank sa 8888-7777.'
  )
on conflict (id) do nothing;

commit;
