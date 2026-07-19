-- Generic updated_at updater (was missing everywhere — updated_at was only ever set on insert).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
	new.updated_at := now();
	return new;
end;
$$;

do $$
declare t text;
begin
	foreach t in array array['profiles', 'mod_subjects', 'inventory_items', 'events'] loop
		execute format('drop trigger if exists set_updated_at on public.%I', t);
		execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
	end loop;
end $$;

-- Date sanity: a convention can't end before it starts (both nullable → only check when both are
-- set; NULL makes the check true).
alter table public.events drop constraint if exists events_dates_chk;
alter table public.events add constraint events_dates_chk
	check (ends_on is null or starts_on is null or ends_on >= starts_on);
