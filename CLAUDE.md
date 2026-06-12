# PikLog（Pikmin Bloom Tracker）

長輩友善的明信片收發與打蘑菇互動紀錄工具。繁體中文介面。

## 技術棧與指令

- **Stack**：Vite + React 18 + TypeScript + Tailwind + Zustand + Supabase + react-router-dom
- **開發**：`npm run dev`
- **驗證（改完務必跑）**：`npx tsc --noEmit`（快速型別檢查）或 `npm run build`（完整：`tsc -b && vite build`）
- `dist/` 為 build 產物，已加入 `.gitignore`，**不要 commit**

## 規格來源

`openspec/sprints.md` 是 sprint 範圍與驗收標準的**單一事實來源**，實作前先對照。

## 核心慣例

### 資料層：Store 雙寫模式
所有 store（`usePeopleStore`、`useRecordsStore`、`useQuickActionsStore`）採同一模式：
- 先寫 LocalStorage（樂觀更新 + 離線 fallback），再嘗試同步 Supabase
- 用 `isSupabaseConfigured()` 判斷是否有設定金鑰；沒有就純本地模式
- Supabase 失敗時保留本地變更並回報 error，**不** rollback
- 新增 store 請沿用此模式

### 文案集中管理
品項與方向的所有顯示文字集中在 `src/lib/recordLabels.ts`，三個頁面共用。
要調整任何標籤文案，**只改這個檔案**，不要散落在各頁。

### 互動方向模型
- 明信片與蘑菇都用 `sent`（往外）/ `received`（往內）兩個方向
- `helped` 為**舊資料相容值**，不再用於新紀錄；編輯舊資料時自動正規化為 `sent`

### 長輩友善規則（這是產品核心，勿違反）
- 可點擊元素套 `.accessible-target`（最小 48×48px）
- 標籤字級 ≥ 16px、按鈕字級 ≥ 18px
- 高對比色塊，避免細小或低對比元素
- 破壞性操作（刪除）需二次確認 Modal

## Git / Commit

- 中文 **conventional commits**（例：`feat(records): ...`、`fix:`、`chore:`、`docs:`）
- commit 前先 `git diff` 確認範圍
- 提交多行訊息時，這個 Bash 工具是 **bash**（非 PowerShell），用 heredoc：
  `git commit -F - <<'EOF' ... EOF`，**不要**用 PowerShell here-string（`@'...'@` 會把 `@` 混進訊息）

## 推薦的審查時機

- commit 前：`/code-review`
- 動到 UI / 文案：`design:accessibility-review`、`design:ux-copy`
