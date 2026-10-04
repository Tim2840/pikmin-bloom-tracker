-- 人物新增「國家」欄位（ISO 3166-1 alpha-2，例如 TW、JP）
alter table persons add column if not exists country text;
