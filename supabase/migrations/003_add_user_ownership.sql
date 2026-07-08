-- Sprint B: 加入 user_id ownership + Row Level Security
-- 執行前請先在 Supabase Dashboard → Authentication → Providers 啟用 Anonymous sign-ins

-- 1. 加 user_id 欄位（nullable：允許舊有無帳號資料，待 app 端遷移後改為 NOT NULL）
ALTER TABLE persons      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users ON DELETE CASCADE;
ALTER TABLE records      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users ON DELETE CASCADE;
ALTER TABLE quick_actions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users ON DELETE CASCADE;

-- 2. 建立 index 加速 user_id 查詢
CREATE INDEX IF NOT EXISTS idx_persons_user_id       ON persons(user_id);
CREATE INDEX IF NOT EXISTS idx_records_user_id       ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_actions_user_id ON quick_actions(user_id);

-- 3. 啟用 Row Level Security
ALTER TABLE persons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy：每位使用者只能存取自己的資料
--    App 端會在首次 auth session 後把舊資料 upsert 並補上 user_id，
--    補完後舊資料（user_id IS NULL）自然不再可見。
CREATE POLICY "persons: own data only" ON persons
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "records: own data only" ON records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "quick_actions: own data only" ON quick_actions
  FOR ALL USING (auth.uid() = user_id);
