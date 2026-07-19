-- Media usage guard. Page content lives in public.pages.data (jsonb); a bucket image is referenced by
-- its public URL, whose tail is the object name. So "is this image used?" is a substring test of the
-- object name against every page's serialized data. Both helpers are SECURITY DEFINER so they read
-- public.pages regardless of the caller's RLS (a media manager need not hold pages.edit), and both
-- self-gate on media.manage since a SECURITY DEFINER function in public is callable by every role.

-- True when the object name occurs in any page's content. There is no separate draft store — pages is
-- the single published content table — so any hit means the image is live and must not be deleted.
create or replace function public.media_is_used(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select public.authorize('media.manage'))
     and coalesce(p_name, '') <> ''
     and exists (select 1 from public.pages pg where strpos(pg.data::text, p_name) > 0);
$$;
grant execute on function public.media_is_used(text) to authenticated;

-- Per-path usage: for each object name, the pages that reference it (path + human title). Batches the
-- whole visible media list in one call. Returns nothing when the caller lacks media.manage.
create or replace function public.media_usage(paths text[])
returns table(media_path text, page_path text, page_title text)
language sql stable security definer set search_path = '' as $$
  select p.path, pg.path, coalesce(nullif(pg.data->'meta'->>'title', ''), pg.path)
  from unnest(paths) as p(path)
  join public.pages pg on p.path <> '' and strpos(pg.data::text, p.path) > 0
  where (select public.authorize('media.manage'));
$$;
grant execute on function public.media_usage(text[]) to authenticated;

-- Enforce the guard at the storage layer: a used image cannot be deleted even via a direct storage
-- API call, not just in the UI. Replaces the media.manage-only delete policy with one that also
-- requires the object to be unreferenced.
drop policy if exists "media editors delete" on storage.objects;
create policy "media editors delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'media'
  and (select public.authorize('media.manage'))
  and not public.media_is_used(name)
);
