-- Sprint 2: add sort_order + icon to persons, add person_name_snapshot to records

alter table persons
  add column if not exists sort_order integer default 0,
  add column if not exists icon text;

-- records: add person_name_snapshot, change cascade to set null
alter table records
  add column if not exists person_name_snapshot text not null default '';

alter table records
  drop constraint if exists records_person_id_fkey;

alter table records
  add constraint records_person_id_fkey
    foreign key (person_id) references persons(id) on delete set null;

-- index for quick_actions sort
create index if not exists idx_persons_sort_order on persons(sort_order asc);
create index if not exists idx_quick_actions_sort_order on quick_actions(sort_order asc);
