-- Kolomrechten in plaats van een handgemaakte wachter.
--
-- published_* hoort alleen via approve_page/approve_structure geschreven te worden, maar de grant op
-- pages/structures was tabelbreed: elke redacteur met pages.edit kon die kolommen dus direct zetten en
-- daarmee publiceren zonder site.approve. Dat gat werd gedicht met protect_published_columns — een
-- trigger die zo'n schrijfactie terugdraaide zonder iets te zeggen. Daardoor kon migratie
-- 20260816120000 melden dat hij slaagde terwijl hij alleen de conceptkolom omzette, en bleef
-- /evenementen op het gepubliceerde kanaal kapot zonder één signaal.
--
-- Postgres heeft hier zijn eigen mechanisme voor. Met kolomrechten weigert de database het zelf, met
-- een echte foutmelding, en kunnen de trigger, de functie én de app.approving-sessievlag weg. De
-- approve-functies zijn security definer en draaien als eigenaar, dus die houden hun volle rechten.
-- Een tabelbrede grant omvat alle kolommen, dus intrekken-en-hergeven is de enige weg naar kolomniveau.
--
-- Vervangt 20260816140000, dat dezelfde herbouw alleen luider maakte in plaats van te vervangen.

revoke insert, update on public.pages      from authenticated;
revoke insert, update on public.structures from authenticated;

-- Exact de kolommen die de builder schrijft: pages.upsert({ path, data }), structures.upsert({ id, data }).
grant insert (path, data), update (path, data) on public.pages      to authenticated;
grant insert (id, data),   update (id, data)   on public.structures to authenticated;

drop trigger if exists protect_published_pages      on public.pages;
drop trigger if exists protect_published_structures on public.structures;
drop function if exists public.protect_published_columns();

create or replace function public.approve_page(p_path text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.authorize('site.approve')) then
    raise exception 'site.approve vereist';
  end if;
  update public.pages
    set published_data = data, published_at = now(), published_by = (select auth.uid())
    where path = p_path;
  if not found then raise exception 'Pagina niet gevonden'; end if;
end;
$$;

create or replace function public.approve_structure()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.authorize('site.approve')) then
    raise exception 'site.approve vereist';
  end if;
  update public.structures
    set published_data = data, published_at = now(), published_by = (select auth.uid())
    where id = 1;
end;
$$;

-- De migratie controleert haar eigen uitkomst. Precies het stille half-succes dat hierboven staat
-- beschreven mag hier niet ongemerkt kunnen gebeuren.
do $$
begin
  if has_column_privilege('authenticated', 'public.pages', 'published_data', 'UPDATE')
    or has_column_privilege('authenticated', 'public.structures', 'published_data', 'UPDATE') then
    raise exception 'published_data is nog steeds schrijfbaar voor authenticated';
  end if;

  if not has_column_privilege('authenticated', 'public.pages', 'data', 'UPDATE')
    or not has_column_privilege('authenticated', 'public.structures', 'data', 'UPDATE') then
    raise exception 'de conceptkolom is niet meer schrijfbaar voor authenticated';
  end if;
end;
$$;
