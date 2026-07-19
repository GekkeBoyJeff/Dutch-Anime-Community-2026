-- Fase D1 — Mijn profiel. Additief: profielvelden voor latere publieke surfacing (donateurspagina),
-- een publieke avatars-bucket (owner-map), admin-bewerkt-iedereen, en een beheer-gecureerde donatienotitie.
-- Privacy: we bewaren `age` (leeftijd) i.p.v. geboortejaar/-datum — dat is het minst identificerende veld
-- (geen exacte geboortedatum, grover en verouderend); de eigenaar kan 'm zelf bijwerken.

alter table public.profiles
	add column if not exists photo_path  text,
	add column if not exists public_name text,
	add column if not exists age         smallint,
	add column if not exists instagram   text,
	add column if not exists about       text;

-- Admin (roles.manage) mag ieders profiel bewerken; naast de bestaande "profiles self update".
-- Meerdere permissive UPDATE-policies worden geOR'd, dus de eigenaar houdt zijn eigen self-update.
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated
	using ((select public.authorize('roles.manage')))
	with check ((select public.authorize('roles.manage')));

-- Publieke avatars-bucket (pad <user_id>/…): de eigenaar schrijft/leest/wist alléén de eigen map
-- (foldername[1] = auth.uid()), roles.manage mag overal (admin-bewerken van andermans foto). Publiek
-- leesbaar (getPublicUrl, geen signed URL) — bedoeld voor latere publieke surfacing. Upsert = insert+update.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
	values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
	on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars write" on storage.objects;
create policy "avatars write" on storage.objects for insert to authenticated with check (
	bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.authorize('roles.manage'))));
drop policy if exists "avatars update" on storage.objects;
create policy "avatars update" on storage.objects for update to authenticated
	using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.authorize('roles.manage'))))
	with check (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.authorize('roles.manage'))));
drop policy if exists "avatars delete" on storage.objects;
create policy "avatars delete" on storage.objects for delete to authenticated
	using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.authorize('roles.manage'))));

-- Donatienotities: beheer-gecureerde vrije notitie (wat/wanneer, bv. Ko-fi) per profiel, bron voor de
-- latere publieke donateurspagina. Eigenaar leest read-only; alléén roles.manage schrijft — consistent met
-- admin-bewerkt-profiel. GEEN publieke rendering nu.
create table if not exists public.donation_notes (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null references auth.users(id) on delete cascade,
	note       text not null,
	source     text,
	noted_on   date,
	created_by uuid references auth.users(id),
	created_at timestamptz not null default now()
);
create index if not exists donation_notes_user on public.donation_notes (user_id, created_at desc);

grant select, insert, update, delete on public.donation_notes to authenticated, service_role;
alter table public.donation_notes enable row level security;

drop policy if exists "donation_notes read" on public.donation_notes;
create policy "donation_notes read" on public.donation_notes for select to authenticated
	using (user_id = (select auth.uid()) or (select public.authorize('roles.manage')));
drop policy if exists "donation_notes insert" on public.donation_notes;
create policy "donation_notes insert" on public.donation_notes for insert to authenticated
	with check ((select public.authorize('roles.manage')));
drop policy if exists "donation_notes update" on public.donation_notes;
create policy "donation_notes update" on public.donation_notes for update to authenticated
	using ((select public.authorize('roles.manage'))) with check ((select public.authorize('roles.manage')));
drop policy if exists "donation_notes delete" on public.donation_notes;
create policy "donation_notes delete" on public.donation_notes for delete to authenticated
	using ((select public.authorize('roles.manage')));
