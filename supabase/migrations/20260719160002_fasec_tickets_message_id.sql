-- Origineel Discord bericht-ID op ticket_messages: nodig om reply-verwijzingen (reply_to_discord_id
-- wijst naar een bericht-ID) in de viewer naar de juiste auteur te resolven. Additief/idempotent.
alter table public.ticket_messages add column if not exists discord_id text;
