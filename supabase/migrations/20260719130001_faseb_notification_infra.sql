-- Phase B — notification infra: configurable types, sent history, and scheduled shift reminders
-- (~30 and ~5 min before a shift). Additive + idempotent; this ships only the data model + scheduler,
-- the UI screens (history, type management) come in a later phase.
--
-- Security boundary: RLS + SECURITY DEFINER. run_shift_reminders() runs via pg_cron and delivers
-- web-push by calling the send-push Edge Function (auth:'secret') through pg_net — never a public,
-- unauthenticated push path. The service key and function URL live in Vault, not here.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- 1. notification_types — admin-configurable notification types (management UI: later phase).
create table if not exists public.notification_types (
	key         text primary key,
	label       text not null,
	description text,
	enabled     boolean not null default true,
	created_at  timestamptz not null default now(),
	updated_at  timestamptz not null default now()
);
drop trigger if exists set_updated_at on public.notification_types;
create trigger set_updated_at before update on public.notification_types for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.notification_types to authenticated, service_role;
alter table public.notification_types enable row level security;

-- Read and manage via the notifications permission the Notifications section already uses (notifications.send).
drop policy if exists "notification types read" on public.notification_types;
create policy "notification types read" on public.notification_types for select to authenticated
	using ((select public.authorize('notifications.send')));
drop policy if exists "notification types manage" on public.notification_types;
create policy "notification types manage" on public.notification_types for all to authenticated
	using ((select public.authorize('notifications.send'))) with check ((select public.authorize('notifications.send')));

insert into public.notification_types (key, label, description) values
	('handmatige-melding', 'Handmatige melding', 'Bericht dat een beheerder handmatig naar leden stuurt.'),
	('shift-reminder-30',  'Shift-herinnering (30 min)', 'Automatische push ~30 minuten voor een shift begint.'),
	('shift-reminder-5',   'Shift-herinnering (5 min)',  'Automatische push ~5 minuten voor een shift begint.')
on conflict (key) do nothing;

-- 2. notification_history — sent notifications. Inserts come only from the service role (send-push
-- Edge Function, manual) or run_shift_reminders() (SECURITY DEFINER); hence no insert policy for
-- authenticated. Read via the same notifications.send permission.
create table if not exists public.notification_history (
	id             uuid primary key default gen_random_uuid(),
	type_key       text references public.notification_types(key) on delete set null,
	title          text not null,
	body           text,
	sender_user_id uuid references auth.users(id) on delete set null,   -- null = system/cron
	audience       jsonb,                                               -- e.g. {kind, shift_id, window_minutes, user_count}
	sent_at        timestamptz not null default now()
);
create index if not exists notification_history_sent_at on public.notification_history (sent_at desc);

grant select on public.notification_history to authenticated;
grant select, insert, update, delete on public.notification_history to service_role;
alter table public.notification_history enable row level security;

drop policy if exists "notification history read" on public.notification_history;
create policy "notification history read" on public.notification_history for select to authenticated
	using ((select public.authorize('notifications.send')));

-- 3. shift_reminder_sends — dedup marker per (shift, window, recipient) so each reminder fires exactly
-- once even if the cron cadence and window overlap. Internal bookkeeping: RLS on, no policies for
-- authenticated (only the SECURITY DEFINER function and service_role touch it).
create table if not exists public.shift_reminder_sends (
	shift_id       uuid not null references public.event_shifts(id) on delete cascade,
	window_minutes int  not null,
	user_id        uuid not null references auth.users(id) on delete cascade,
	sent_at        timestamptz not null default now(),
	primary key (shift_id, window_minutes, user_id)
);
grant select, insert, delete on public.shift_reminder_sends to service_role;
alter table public.shift_reminder_sends enable row level security;

-- 4. run_shift_reminders() — finds shifts whose start falls in the 30- or 5-min window, targets the
-- assigned person of that shift, prevents duplicate sends, respects notification_types.enabled, writes
-- history + in-app bell, and triggers web-push via send-push. SECURITY DEFINER (runs under pg_cron).
create or replace function public.run_shift_reminders()
returns void language plpgsql security definer set search_path = '' as $$
declare
	v_url  text;
	v_key  text;
	w      int;
	rec    record;
	v_type text;
	v_title text;
	v_body  text;
begin
	-- Push transport is optional: without Vault config we still write history + the in-app bell,
	-- only the web-push is skipped.
	select decrypted_secret into v_url from vault.decrypted_secrets where name = 'send_push_url';
	select decrypted_secret into v_key from vault.decrypted_secrets where name = 'send_push_secret_key';

	foreach w in array array[30, 5] loop
		v_type := case when w = 30 then 'shift-reminder-30' else 'shift-reminder-5' end;
		if not exists (select 1 from public.notification_types t where t.key = v_type and t.enabled) then
			continue;
		end if;

		for rec in
			select s.id as shift_id, s.starts_at, s.station, e.name as event_name, ms.user_id as recipient
			from public.event_shifts s
			join public.events e on e.id = s.event_id
			join public.mod_subjects ms on ms.id = s.subject_id
			where s.subject_id is not null
				and ms.user_id is not null
				and s.starts_at > now() + make_interval(mins => w - 5)
				and s.starts_at <= now() + make_interval(mins => w)
				and not exists (
					select 1 from public.shift_reminder_sends d
					where d.shift_id = s.id and d.window_minutes = w and d.user_id = ms.user_id
				)
		loop
			-- Dedup marker first (race-safe via PK); skip if a parallel run just inserted it.
			begin
				insert into public.shift_reminder_sends (shift_id, window_minutes, user_id)
				values (rec.shift_id, w, rec.recipient);
			exception when unique_violation then
				continue;
			end;

			v_title := 'Herinnering: shift over ' || w || ' min';
			v_body := coalesce(rec.event_name, 'Conventie')
				|| coalesce(' — ' || rec.station, '')
				|| ' start om ' || to_char(rec.starts_at at time zone 'Europe/Amsterdam', 'HH24:MI');

			-- History (system send: sender null).
			insert into public.notification_history (type_key, title, body, sender_user_id, audience)
			values (v_type, v_title, v_body, null,
				jsonb_build_object('kind', 'shift-reminder', 'shift_id', rec.shift_id, 'window_minutes', w, 'user_count', 1));

			-- In-app bell (realtime) for the recipient.
			insert into public.notifications (user_id, kind, title, body, payload)
			values (rec.recipient, 'shift-reminder', v_title, v_body, jsonb_build_object('url', '/dashboard'));

			-- Web-push via send-push (auth:'secret', push-only) — only if Vault is configured.
			if v_url is not null and v_key is not null then
				perform net.http_post(
					url := v_url,
					headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', v_key),
					body := jsonb_build_object(
						'system', true,
						'user_ids', jsonb_build_array(rec.recipient),
						'title', v_title,
						'body', v_body,
						'url', '/dashboard'
					)
				);
			end if;
		end loop;
	end loop;
end;
$$;

-- SECURITY DEFINER in public is executable by PUBLIC by default; this is a system function. Only the
-- owner (pg_cron) and service_role (manual test/ops) may run it.
revoke execute on function public.run_shift_reminders() from public;
grant execute on function public.run_shift_reminders() to service_role;

-- 5. pg_cron — every 5 minutes. Idempotent: unschedule the existing job first if present.
do $$
begin
	if exists (select 1 from cron.job where jobname = 'shift-reminders') then
		perform cron.unschedule('shift-reminders');
	end if;
	perform cron.schedule('shift-reminders', '*/5 * * * *', 'select public.run_shift_reminders()');
end $$;
