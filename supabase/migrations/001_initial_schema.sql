-- 人物表
create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  color text default '#6B7280',
  created_at timestamptz default now()
);

-- 紀錄表
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references persons(id) on delete cascade,
  date date not null default current_date,
  item_type text not null check (item_type in ('postcard', 'mushroom')),
  action_type text not null check (action_type in ('sent', 'received', 'helped')),
  note text,
  created_at timestamptz default now()
);

-- 快捷動作表
create table if not exists quick_actions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  person_id uuid references persons(id) on delete cascade,
  item_type text not null check (item_type in ('postcard', 'mushroom')),
  action_type text not null check (action_type in ('sent', 'received', 'helped')),
  use_today boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- index 加速查詢
create index if not exists idx_records_person_id on records(person_id);
create index if not exists idx_records_date on records(date desc);
