-- Original Discord message ID on ticket_messages: needed to resolve reply references
-- (reply_to_discord_id points to a message ID) to the right author in the viewer.
alter table public.ticket_messages add column if not exists discord_id text;
