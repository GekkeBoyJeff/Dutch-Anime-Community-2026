-- protect_published_columns draaide een directe schrijfactie op published_* stilletjes terug. Daardoor
-- kon migratie 20260816120000 melden dat hij slaagde terwijl hij alleen de conceptkolom omzette, en
-- bleef /evenementen op het gepubliceerde kanaal kapot zonder één signaal — niet in de migratie, niet
-- in de build, niet op de site.
--
-- Zelfde regel, nu luid: buiten approve_page/approve_structure faalt een poging om published_* te
-- wijzigen in plaats van te verdwijnen. Een gewone UPDATE die die kolommen niet noemt geeft dezelfde
-- waarden door, is dus niet "distinct" en raakt de check niet — de builder (upsert van path + data)
-- en het seed-script merken hier niets van.

create or replace function public.protect_published_columns()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if current_setting('app.approving', true) = '1' then return new; end if;

  if tg_op = 'INSERT' then
    if new.published_data is not null or new.published_at is not null or new.published_by is not null then
      raise exception 'published_* zetten kan alleen via approve_page/approve_structure (tabel %)', tg_table_name;
    end if;
    return new;
  end if;

  if new.published_data is distinct from old.published_data
    or new.published_at is distinct from old.published_at
    or new.published_by is distinct from old.published_by then
    raise exception 'published_* wijzigen kan alleen via approve_page/approve_structure (tabel %)', tg_table_name;
  end if;

  return new;
end;
$$;
