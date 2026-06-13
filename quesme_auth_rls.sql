-- QuesMe — staff auth + hardened RLS (quesme_* only; thaimate untouched)
-- Staff are scoped by email per store. Customers stay anonymous but limited.

create table if not exists quesme_staff (
  email      text not null,
  store_slug text not null,
  created_at timestamptz default now(),
  primary key (email, store_slug)
);
alter table quesme_staff enable row level security;
drop policy if exists quesme_staff_self on quesme_staff;
create policy quesme_staff_self on quesme_staff for select to authenticated
  using (email = (auth.jwt() ->> 'email'));

-- is the current logged-in user a staff member of this store?
create or replace function quesme_is_staff(p_slug text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from quesme_staff s where s.store_slug = p_slug and s.email = (auth.jwt() ->> 'email'));
$$;

-- ===== ENTRIES =====
drop policy if exists quesme_entries_all on quesme_entries;
drop policy if exists quesme_entries_select on quesme_entries;
drop policy if exists quesme_entries_insert on quesme_entries;
drop policy if exists quesme_entries_update_cust on quesme_entries;
drop policy if exists quesme_entries_update_staff on quesme_entries;
drop policy if exists quesme_entries_delete_staff on quesme_entries;
create policy quesme_entries_select       on quesme_entries for select to anon, authenticated using (true);
create policy quesme_entries_insert       on quesme_entries for insert to anon, authenticated with check (status = 'waiting');
create policy quesme_entries_update_cust  on quesme_entries for update to anon using (true) with check (status in ('waiting','cancelled'));
create policy quesme_entries_update_staff on quesme_entries for update to authenticated using (quesme_is_staff(store_slug)) with check (quesme_is_staff(store_slug));
create policy quesme_entries_delete_staff on quesme_entries for delete to authenticated using (quesme_is_staff(store_slug));

-- ===== STORES =====
drop policy if exists quesme_stores_all on quesme_stores;
drop policy if exists quesme_stores_select on quesme_stores;
drop policy if exists quesme_stores_write_staff on quesme_stores;
create policy quesme_stores_select      on quesme_stores for select to anon, authenticated using (true);
create policy quesme_stores_write_staff on quesme_stores for all    to authenticated using (quesme_is_staff(slug)) with check (quesme_is_staff(slug));

-- ===== RESERVATIONS (customer-managed) =====
drop policy if exists quesme_reservations_all on quesme_reservations;
drop policy if exists quesme_reservations_select on quesme_reservations;
drop policy if exists quesme_reservations_insert on quesme_reservations;
drop policy if exists quesme_reservations_delete on quesme_reservations;
create policy quesme_reservations_select on quesme_reservations for select to anon, authenticated using (true);
create policy quesme_reservations_insert on quesme_reservations for insert to anon, authenticated with check (true);
create policy quesme_reservations_delete on quesme_reservations for delete to anon, authenticated using (true);

-- seed: kamja07@gmail.com is staff of every existing store
insert into quesme_staff (email, store_slug)
select 'kamja07@gmail.com', slug from quesme_stores
on conflict do nothing;
