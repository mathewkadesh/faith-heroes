-- Run this in Supabase SQL Editor after confirming the characters are correct.
-- It publishes existing characters and creates one active product per character
-- when a product does not already exist.

update public.characters
set is_published = true
where name in ('David', 'Noah', 'Moses');

insert into public.products (
  character_id,
  name,
  price,
  currency,
  stock_qty,
  includes,
  is_customisable,
  is_active
)
select
  c.id,
  c.name || ' Collector Gift Box',
  case c.name
    when 'David' then 34.99
    when 'Noah' then 32.99
    when 'Moses' then 36.99
    else 34.99
  end,
  'GBP',
  25,
  '["3D figure", "bookmark", "keychain", "story card", "voice card"]'::jsonb,
  true,
  true
from public.characters c
where not exists (
  select 1
  from public.products p
  where p.character_id = c.id
);
