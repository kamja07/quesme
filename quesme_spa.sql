-- QuesMe — 마사지/네일/스파 버티컬: 마사지사·룸·시술 + 예약(quesme_* only)
-- 기존 quesme_is_staff(slug)/quesme_is_super() 함수 재사용.

-- 1) 담당자 (마사지사·네일리스트·테라피스트)
create table if not exists quesme_providers (
  id          uuid primary key default gen_random_uuid(),
  store_slug  text not null,
  name        text not null,
  login_id    text,                          -- 본인 로그인 아이디(샵이 발급) → login_id@thaimate.app
  role        text default 'therapist',     -- therapist | nailist | ...
  tier        text default 'regular',        -- pretty | regular (등급)
  freelance   boolean not null default false,-- 프리랜서 표시
  outcall_ok  boolean not null default false,-- 출장 가능 마사지사
  bio         text,                          -- 한 줄 소개(전문 분야 등)
  avatar      text,                          -- 프로필 사진 URL/dataURL (선택)
  price_extra int default 0,                 -- 지명 추가요금 THB (프리티 등)
  active      boolean not null default true, -- 재직 on/off (풀에서 숨김)
  sort        int default 0,
  created_at  timestamptz default now()
);

-- 2) 룸 (특정 룸 지정)
create table if not exists quesme_rooms (
  id         uuid primary key default gen_random_uuid(),
  store_slug text not null,
  name       text not null,                 -- 개인룸 1호 / 커플룸 / 공용홀 ...
  type       text not null default 'private', -- private | shared | group
  capacity   int default 1,
  active     boolean not null default true,
  sort       int default 0,
  created_at timestamptz default now()
);

-- 3) 시술 메뉴
create table if not exists quesme_services (
  id           uuid primary key default gen_random_uuid(),
  store_slug   text not null,
  name         text not null,               -- 타이 마사지 / 오일 ...
  duration_min int not null default 60,
  price        int,                          -- THB (선택)
  active       boolean not null default true,
  sort         int default 0,
  created_at   timestamptz default now()
);

-- 4) 예약/대기 (마사지 등 웰니스 전용 — 식당 quesme_entries와 분리)
create table if not exists quesme_bookings (
  id           uuid primary key default gen_random_uuid(),
  store_slug   text not null,
  nick         text not null,
  lang         text default 'en',
  service_id   uuid,
  provider_id  uuid,                          -- null = 아무나(지명 안 함)
  room_id      uuid,
  mode          text not null default 'walkin', -- walkin | reserve
  location_type text not null default 'shop',   -- shop | outcall(출장)
  address       text,                            -- 출장 주소
  travel_fee    int default 0,                   -- 출장비 THB
  book_date     date default current_date,       -- 예약 날짜
  start_time    text,                            -- 'HH:MM' (예약일 때)
  duration_min  int default 60,
  status       text not null default 'waiting', -- waiting | serving | done | cancelled
  cno          int,
  created_at   timestamptz default now()
);

-- 5) 출근/스케줄 (마사지사 풀 → 날짜별 출근)
create table if not exists quesme_shifts (
  id          uuid primary key default gen_random_uuid(),
  store_slug  text not null,
  provider_id uuid not null,
  work_date   date not null default current_date,
  start_time  text default '10:00',
  end_time    text default '22:00',
  avail       text not null default 'shop',    -- shop | outcall | both (그날 가능 장소)
  off         boolean not null default false,  -- 명시적 휴무 표시(행 존재 = 그날 등록됨)
  created_at  timestamptz default now(),
  unique (provider_id, work_date)
);

-- 현재 로그인한 마사지사 본인의 provider 행인지 (login_id ↔ auth 이메일 앞부분)
create or replace function quesme_is_provider(p_provider uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from quesme_providers pr
    where pr.id = p_provider
      and pr.login_id is not null
      and pr.login_id = split_part(auth.jwt() ->> 'email', '@', 1)
  );
$$;

-- ---- RLS ----
alter table quesme_providers enable row level security;
alter table quesme_rooms     enable row level security;
alter table quesme_services  enable row level security;
alter table quesme_bookings  enable row level security;
alter table quesme_shifts    enable row level security;

-- 조회: 누구나(손님이 담당자·룸·시술·현황을 봐야 함)
drop policy if exists quesme_prov_read on quesme_providers;
drop policy if exists quesme_room_read on quesme_rooms;
drop policy if exists quesme_svc_read  on quesme_services;
drop policy if exists quesme_book_read on quesme_bookings;
drop policy if exists quesme_shift_read on quesme_shifts;
create policy quesme_prov_read on quesme_providers for select to anon, authenticated using (true);
create policy quesme_room_read on quesme_rooms     for select to anon, authenticated using (true);
create policy quesme_svc_read  on quesme_services  for select to anon, authenticated using (true);
create policy quesme_book_read on quesme_bookings  for select to anon, authenticated using (true);
create policy quesme_shift_read on quesme_shifts   for select to anon, authenticated using (true);

-- 담당자·룸·시술 쓰기: 해당 매장 직원만
drop policy if exists quesme_prov_staff on quesme_providers;
drop policy if exists quesme_room_staff on quesme_rooms;
drop policy if exists quesme_svc_staff  on quesme_services;
create policy quesme_prov_staff on quesme_providers for all to authenticated using (quesme_is_staff(store_slug)) with check (quesme_is_staff(store_slug));
create policy quesme_room_staff on quesme_rooms     for all to authenticated using (quesme_is_staff(store_slug)) with check (quesme_is_staff(store_slug));
create policy quesme_svc_staff  on quesme_services  for all to authenticated using (quesme_is_staff(store_slug)) with check (quesme_is_staff(store_slug));

-- 예약: 손님(anon)은 생성 + 본인 취소(waiting/cancelled)만, 직원은 전체
drop policy if exists quesme_book_insert on quesme_bookings;
drop policy if exists quesme_book_anon_upd on quesme_bookings;
drop policy if exists quesme_book_staff on quesme_bookings;
create policy quesme_book_insert   on quesme_bookings for insert to anon, authenticated with check (status = 'waiting');
create policy quesme_book_anon_upd on quesme_bookings for update to anon using (status in ('waiting','serving')) with check (status in ('waiting','cancelled'));
create policy quesme_book_staff    on quesme_bookings for all    to authenticated using (quesme_is_staff(store_slug)) with check (quesme_is_staff(store_slug));
-- 마사지사 본인: 자기 예약 진행(시작/완료)
drop policy if exists quesme_book_self on quesme_bookings;
create policy quesme_book_self on quesme_bookings for update to authenticated using (quesme_is_provider(provider_id)) with check (quesme_is_provider(provider_id));

-- 출근표: 직원 전체 + 마사지사 본인
drop policy if exists quesme_shift_staff on quesme_shifts;
drop policy if exists quesme_shift_self  on quesme_shifts;
create policy quesme_shift_staff on quesme_shifts for all to authenticated using (quesme_is_staff(store_slug)) with check (quesme_is_staff(store_slug));
create policy quesme_shift_self  on quesme_shifts for all to authenticated using (quesme_is_provider(provider_id)) with check (quesme_is_provider(provider_id));

-- 마사지사 본인: 자기 프로필(사진·소개) 수정
drop policy if exists quesme_prov_self on quesme_providers;
create policy quesme_prov_self on quesme_providers for update to authenticated using (quesme_is_provider(id)) with check (quesme_is_provider(id));

-- ---- realtime ----
do $$ begin
  begin alter publication supabase_realtime add table quesme_providers; exception when others then null; end;
  begin alter publication supabase_realtime add table quesme_rooms;     exception when others then null; end;
  begin alter publication supabase_realtime add table quesme_services;  exception when others then null; end;
  begin alter publication supabase_realtime add table quesme_bookings;  exception when others then null; end;
  begin alter publication supabase_realtime add table quesme_shifts;    exception when others then null; end;
end $$;

-- ---- 샘플 시드: massage-thonglor (사바이 타이마사지) ----
delete from quesme_providers where store_slug='massage-thonglor';
delete from quesme_rooms      where store_slug='massage-thonglor';
delete from quesme_services   where store_slug='massage-thonglor';

insert into quesme_providers (store_slug, name, login_id, role, tier, freelance, outcall_ok, bio, price_extra, sort) values
  ('massage-thonglor','Ploy','ploy','therapist','pretty',true, true,'Oil & aroma specialist · 5y',150,1),
  ('massage-thonglor','Mint','mint','therapist','pretty',false,false,'Thai & foot · top rated',150,2),
  ('massage-thonglor','Nong Ann','nongann','therapist','regular',false,false,'Thai massage · 10y',0,3),
  ('massage-thonglor','Aoy','aoy','therapist','regular',true, true,'Shoulder & foot focus',0,4);

-- 오늘 출근 시드 (데모): Ploy=샵+출장, Mint=샵, Aoy=출장
insert into quesme_shifts (store_slug, provider_id, work_date, avail)
select 'massage-thonglor', id, current_date,
  case name when 'Ploy' then 'both' when 'Mint' then 'shop' when 'Aoy' then 'outcall' end
from quesme_providers
where store_slug='massage-thonglor' and name in ('Ploy','Mint','Aoy');

insert into quesme_rooms (store_slug, name, type, capacity, sort) values
  ('massage-thonglor','Private Room 1','private',1,1),
  ('massage-thonglor','Private Room 2','private',1,2),
  ('massage-thonglor','Couple Room','private',2,3),
  ('massage-thonglor','Shared Hall','shared',4,4),
  ('massage-thonglor','Group Room','group',8,5);

insert into quesme_services (store_slug, name, duration_min, price, sort) values
  ('massage-thonglor','Thai Massage',60,300,1),
  ('massage-thonglor','Thai Massage',90,450,2),
  ('massage-thonglor','Thai Massage',120,600,3),
  ('massage-thonglor','Oil Massage',60,400,4),
  ('massage-thonglor','Oil Massage',90,550,5),
  ('massage-thonglor','Foot Massage',30,200,6),
  ('massage-thonglor','Foot Massage',60,350,7);
