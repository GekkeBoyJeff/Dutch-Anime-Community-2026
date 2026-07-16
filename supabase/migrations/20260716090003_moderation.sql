-- Moderation subsystem — SCHEMA ONLY this plan (UI + JSON import come later). All mod_* tables are
-- gated on moderation.view (read) / moderation.manage (write) via public.authorize(). Evidence lives
-- in a PRIVATE bucket (mod-evidence) — sensitive data, never public.
create type public.mod_warn_color as enum ('yellow', 'red');

create table public.mod_subjects (
  id           uuid primary key default gen_random_uuid(),
  discord_id   text unique,
  discord_name text,
  user_id      uuid references auth.users(id) on delete set null,  -- null = shadow profile
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create table public.mod_warnings (
  id         uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.mod_subjects(id) on delete cascade,
  color      public.mod_warn_color not null,
  reason     text not null,
  issued_at  timestamptz not null default now(),
  issued_by  uuid references auth.users(id),
  removed_at timestamptz,
  removed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.mod_evidence (
  id           uuid primary key default gen_random_uuid(),
  warning_id   uuid not null references public.mod_warnings(id) on delete cascade,
  kind         text not null check (kind in ('image','link','text')),
  storage_path text, url text, body text,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now()
);
create table public.mod_notes (
  id         uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.mod_subjects(id) on delete cascade,
  body       text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.mod_subject_links (
  id           uuid primary key default gen_random_uuid(),
  subject_low  uuid not null references public.mod_subjects(id) on delete cascade,
  subject_high uuid not null references public.mod_subjects(id) on delete cascade,
  reason       text,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  constraint mod_link_order check (subject_low < subject_high),  -- no self-link, no A-B/B-A dupes
  unique (subject_low, subject_high)
);

grant select, insert, update, delete on public.mod_subjects      to authenticated;
grant select, insert, update, delete on public.mod_warnings      to authenticated;
grant select, insert, update, delete on public.mod_evidence      to authenticated;
grant select, insert, update, delete on public.mod_notes         to authenticated;
grant select, insert, update, delete on public.mod_subject_links to authenticated;

do $$
declare t text;
begin
  foreach t in array array['mod_subjects','mod_warnings','mod_evidence','mod_notes','mod_subject_links'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($f$create policy "mod view %1$s" on public.%1$I for select to authenticated using ((select public.authorize('moderation.view')))$f$, t);
    execute format($f$create policy "mod insert %1$s" on public.%1$I for insert to authenticated with check ((select public.authorize('moderation.manage')))$f$, t);
    execute format($f$create policy "mod update %1$s" on public.%1$I for update to authenticated using ((select public.authorize('moderation.manage'))) with check ((select public.authorize('moderation.manage')))$f$, t);
    execute format($f$create policy "mod delete %1$s" on public.%1$I for delete to authenticated using ((select public.authorize('moderation.manage')))$f$, t);
  end loop;
end $$;

-- Private evidence bucket (public = false); only moderation roles read/write.
insert into storage.buckets (id, name, public)
values ('mod-evidence', 'mod-evidence', false) on conflict (id) do nothing;

create policy "mod-evidence read"   on storage.objects for select to authenticated using (bucket_id = 'mod-evidence' and (select public.authorize('moderation.view')));
create policy "mod-evidence write"  on storage.objects for insert to authenticated with check (bucket_id = 'mod-evidence' and (select public.authorize('moderation.manage')));
create policy "mod-evidence update" on storage.objects for update to authenticated using (bucket_id = 'mod-evidence' and (select public.authorize('moderation.manage'))) with check (bucket_id = 'mod-evidence' and (select public.authorize('moderation.manage')));
create policy "mod-evidence delete" on storage.objects for delete to authenticated using (bucket_id = 'mod-evidence' and (select public.authorize('moderation.manage')));
