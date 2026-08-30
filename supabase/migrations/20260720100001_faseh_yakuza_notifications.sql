-- Fase H (H3a) — yakuza gains notifications.send. Owner decision: the yakuza role runs the convention
-- floor and must be able to message members, so it joins admin in holding notifications.send. Additive
-- and idempotent, mirroring the existing role_permissions seed pattern (20260716110005 et al.).
--
-- No code change is needed alongside this: the Meldingen section (dashboard-sections.ts), the ⌘K
-- "Melding sturen" action and the Systeem nav group are all gated on notifications.send through the
-- existing permission plumbing, and send-push re-checks notifications.send via my_permissions() — there
-- is no hardcoded admin check anywhere around it. Granting the permission surfaces all of it for yakuza.
insert into public.role_permissions (role, permission) values
	('yakuza', 'notifications.send')
on conflict (role, permission) do nothing;
