-- CMS content store. RLS gated on CMS permissions via public.authorize() (wrapped in a subselect so
-- Postgres evaluates it once per query). The static build reads with the service-role key (bypasses RLS).
create table public.pages (
  path       text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.structures (
  id         int primary key default 1,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint structures_singleton check (id = 1)
);

grant select, insert, update, delete on public.pages      to authenticated;
grant select, insert, update, delete on public.structures to authenticated;

alter table public.pages      enable row level security;
alter table public.structures enable row level security;

create policy "read pages"   on public.pages for select to authenticated using ((select public.authorize('pages.edit')));
create policy "insert pages"  on public.pages for insert to authenticated with check ((select public.authorize('pages.edit')));
create policy "update pages"  on public.pages for update to authenticated using ((select public.authorize('pages.edit'))) with check ((select public.authorize('pages.edit')));
create policy "delete pages"  on public.pages for delete to authenticated using ((select public.authorize('pages.delete')));

create policy "read structures"   on public.structures for select to authenticated using ((select public.authorize('structures.edit')));
create policy "insert structures" on public.structures for insert to authenticated with check ((select public.authorize('structures.edit')));
create policy "update structures" on public.structures for update to authenticated using ((select public.authorize('structures.edit'))) with check ((select public.authorize('structures.edit')));

-- Public media bucket (bucket-served images).
insert into storage.buckets (id, name, public)
values ('media', 'media', true) on conflict (id) do update set public = excluded.public;

create policy "media editors upload" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.authorize('media.manage')));
create policy "media editors update" on storage.objects for update to authenticated using (bucket_id = 'media' and (select public.authorize('media.manage'))) with check (bucket_id = 'media' and (select public.authorize('media.manage')));
create policy "media editors delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.authorize('media.manage')));
create policy "media public read"    on storage.objects for select to public using (bucket_id = 'media');
