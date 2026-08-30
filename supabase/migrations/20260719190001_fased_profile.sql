-- Phase D1 — My profile. Additive: profile fields for later public surfacing (a donor page), a
-- public avatars bucket (owner folder), admin-edits-everyone, and a staff-curated donation note.
-- Privacy: we store `age` instead of birth year/date — the least identifying field — and the owner can update it themselves.

alter table public.profiles
	add column if not exists photo_path  text,
	add column if not exists public_name text,
	add column if not exists age         smallint,
	add column if not exists instagram   text,
	add column if not exists about       text;

-- Admin (roles.manage) may edit anyone's profile, alongside the existing "profiles self update".
-- Multiple permissive UPDATE policies are OR'd, so the owner keeps their own self-update.
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated
	using ((select public.authorize('roles.manage')))
	with check ((select public.authorize('roles.manage')));

-- Public avatars bucket (path <user_id>/…): the owner writes/reads/deletes only their own folder
-- (foldername[1] = auth.uid()), roles.manage may act anywhere (admin editing someone else's photo).
-- Publicly readable (getPublicUrl, no signed URL) for later public surfacing. Upsert = insert+update.
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

-- Donation notes: a staff-curated free-form note (what/when, e.g. Ko-fi) per profile, the source for
-- the later public donor page. Owner reads read-only; only roles.manage writes — consistent with
-- admin-edits-profile. No public rendering yet.
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
