-- QuesMe — store registration requests + super-admin helpers (quesme_* only)

-- 슈퍼관리자 판별: quesme_staff 에 store_slug='*' 행이 있으면 슈퍼관리자
create or replace function quesme_is_super() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from quesme_staff s where s.store_slug = '*' and s.email = (auth.jwt() ->> 'email'));
$$;

-- quesme_staff: 슈퍼관리자는 모든 직원행 관리(승인 시 직원 추가 등)
drop policy if exists quesme_staff_admin on quesme_staff;
create policy quesme_staff_admin on quesme_staff for all to authenticated
  using (quesme_is_super()) with check (quesme_is_super());

-- 매장 등록 신청
create table if not exists quesme_store_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  category     text,
  area         text,
  contact      text,
  desired_slug text,
  login_id     text,
  status       text not null default 'pending',   -- pending | approved | rejected
  note         text,
  created_at   timestamptz default now()
);
alter table quesme_store_requests enable row level security;
drop policy if exists quesme_req_insert on quesme_store_requests;
drop policy if exists quesme_req_admin  on quesme_store_requests;
create policy quesme_req_insert on quesme_store_requests for insert to anon, authenticated with check (status = 'pending');
create policy quesme_req_admin  on quesme_store_requests for all    to authenticated using (quesme_is_super()) with check (quesme_is_super());

do $$ begin
  begin alter publication supabase_realtime add table quesme_store_requests; exception when others then null; end;
end $$;
