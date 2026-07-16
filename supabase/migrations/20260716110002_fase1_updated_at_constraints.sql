-- Generieke updated_at-bijwerker (ontbrak overal — updated_at werd alleen bij insert gezet).
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

-- Datumsanity: een conventie kan niet eindigen vóór ze begint (beide nullable → alleen checken als
-- beide gezet zijn; NULL maakt de check waar).
alter table public.events drop constraint if exists events_dates_chk;
alter table public.events add constraint events_dates_chk
	check (ends_on is null or starts_on is null or ends_on >= starts_on);
