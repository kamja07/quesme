-- QuesMe schema — runs inside the thaimate Supabase project, fully namespaced (quesme_*),
-- no foreign keys to thaimate tables → can be dumped out to its own project later.
-- MVP RLS: anon may do everything on quesme_* tables ONLY (no sensitive data; staff auth = later hardening).

create table if not exists quesme_stores (
  slug       text primary key,
  names      jsonb not null default '{}'::jsonb,
  tagline    text,
  logo       text,
  updated_at timestamptz not null default now()
);

create table if not exists quesme_entries (
  id         uuid primary key default gen_random_uuid(),
  store_slug text not null,
  qno        int  not null default 0,           -- sequential ticket (internal)
  cno        int  not null default 0,           -- random customer number (shown on board)
  nick       text not null default '-',
  party_size int  not null default 1,
  lang       text not null default 'en',        -- customer's chosen language
  status     text not null default 'waiting',   -- waiting | called | done | cancelled
  priority   boolean not null default false,
  passes     int  not null default 0,
  reserved   boolean not null default false,
  sort_at    double precision not null default 0, -- ordering key (lower = earlier); yields/priority adjust this
  created_at timestamptz not null default now(),
  called_at  timestamptz,
  done_at    timestamptz
);
create index if not exists quesme_entries_store_idx on quesme_entries (store_slug, status);

create table if not exists quesme_reservations (
  id         uuid primary key default gen_random_uuid(),
  store_slug text not null,
  num        text,
  nick       text,
  party_size int,
  lang       text,
  cno        int,
  time       text,
  created_at timestamptz not null default now()
);
create index if not exists quesme_res_store_idx on quesme_reservations (store_slug);

-- Row Level Security (lock to quesme_* only; thaimate tables untouched)
alter table quesme_stores       enable row level security;
alter table quesme_entries      enable row level security;
alter table quesme_reservations enable row level security;

drop policy if exists quesme_stores_all on quesme_stores;
drop policy if exists quesme_entries_all on quesme_entries;
drop policy if exists quesme_reservations_all on quesme_reservations;
create policy quesme_stores_all       on quesme_stores       for all to anon using (true) with check (true);
create policy quesme_entries_all      on quesme_entries      for all to anon using (true) with check (true);
create policy quesme_reservations_all on quesme_reservations for all to anon using (true) with check (true);

-- Realtime (ignore errors if already added)
do $$ begin
  begin alter publication supabase_realtime add table quesme_stores; exception when others then null; end;
  begin alter publication supabase_realtime add table quesme_entries; exception when others then null; end;
  begin alter publication supabase_realtime add table quesme_reservations; exception when others then null; end;
end $$;

-- Seed the pilot store
insert into quesme_stores (slug, names, tagline) values (
  'gangnam',
  '{"ko":"강남바베큐 라끄라방점","en":"Gangnam BBQ Latkrabang","th":"กังนัมบาร์บีคิว ลาดกระบัง","zh":"江南烤肉 拉甲邦店","ja":"江南バーベキュー ラートクラバン店","hi":"गंगनाम बीबीक्यू लातक्राबांग","ru":"Каннам Барбекю Латкрабанг"}'::jsonb,
  '한국식 BBQ 무한리필 · 11:00–22:00'
) on conflict (slug) do nothing;
