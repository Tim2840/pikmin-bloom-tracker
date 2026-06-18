# PikLog — 專案現況（PROJECT STATUS）

> 這是跨 session 的「導航頁／記憶檔」。新對話開頭請先讀這份 + `CLAUDE.md`。
> 詳細歷史看 `git log`；這裡只記「現在在哪、怎麼運作、下一步」。
> **最後更新：2025（ownership/帳號功能完成並上線後）**

## 一句話
長輩友善的明信片收發與打蘑菇互動紀錄工具（繁中、PWA）。Vite + React + TS + Tailwind + Zustand + Supabase，部署在 GitHub Pages。

## 線上 / 分支
- 線上：https://tim2840.github.io/pikmin-bloom-tracker/ （push `main` 自動部署）
- `main` 與功能分支 `claude/event-model-ownership-refactor-eid42h` 目前同步、皆已上線。
- 部署綠燈驗證：`mcp__github__actions_list`（deploy.yml）→ conclusion=success。

## 目前最近完成的大功能：多使用者 / 資料歸屬（帳號）
**全部已實作並部署。** 設計如下：

- **匿名優先**：開 App 自動 `signInAnonymously()`（`src/lib/auth.ts` / `useAuthStore`），使用者無感即有帳號與 `user_id` 歸屬。
- **資料歸屬 + RLS**：三張表加 `user_id`、開 Row Level Security（`supabase/migrations/003_add_user_ownership.sql`）。每人只看自己的資料。
- **本機資料遷移**：首次有 session 時把 localStorage 既有資料 upsert 上雲（見各 store 的 `migrateLocalToCloud`，旗標 `piklog_cloud_synced_<uid>`）。
- **帳號（設定頁「帳號與同步」+ 首次提醒 Modal）**：
  - **「用 Google 繼續」一顆按鈕**（`linkGoogle` = linkIdentity 綁定為主）。若該 Google 已綁過、OAuth 導回帶 error → `AuthHashNotice` **自動觸發 `signInWithGoogle` 取回**，以 `sessionStorage['piklog_auth_auto_restore']` 旗標防無限跳轉。
  - **Email 備援**：`綁定 Email`(linkEmail) / `換裝置取回`(signInWithEmail，magic link)。
  - **登出**：清本機資料 + signOut + reload → 回到新匿名帳號 + 提示（含二次確認）。
- **用語慣例**：用「綁定 / 取回資料」，**不要用「備份 / 登入」**。換裝置動作叫「取回資料」。
- 關鍵檔：`src/lib/auth.ts`、`src/stores/useAuthStore.ts`、`src/components/AuthHashNotice.tsx`、`src/components/EmailBackupModal.tsx`、`src/components/BackupReminderModal.tsx`、`src/pages/SettingsPage.tsx`。

## Supabase 後端（使用者已自行設定完成）
- 專案 ref：`qmamrtarojiyqzfrmmav`（URL `https://qmamrtarojiyqzfrmmav.supabase.co`）。
- ✅ migrations 001/002/003 已套用（含 user_id + RLS policy「own data only」）。
- ✅ Authentication → **Anonymous sign-ins** 已開。
- ✅ **Google provider** 已開（Google Cloud OAuth client，redirect URI = `https://qmamrtarojiyqzfrmmav.supabase.co/auth/v1/callback`）。
- ✅ **URL Configuration**：Site URL = 線上網址；Redirect URLs 含 `https://tim2840.github.io/pikmin-bloom-tracker/**`。
- ✅ GitHub repo secrets：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（部署 build 時注入）。
- anon key 為公開金鑰（受 RLS 保護）；`service_role` 不可外洩。

## 待驗收 / 已知事項
- 🔲 使用者實機驗收「用 Google 繼續」自動取回流程（沙箱連不到 Google/Supabase，無法代測）。已綁過情境會閃一下 Google 第二次跳轉（自動取回）。
- ℹ️ npm audit 5 個漏洞**全為 dev 相依**（`npm audit --omit=dev` = 0），不影響線上。
- ℹ️ PWA 蘑菇圖示需「刪舊捷徑 → 清快取 → 重新安裝」才會更新。
- 💤 之前提過、未做：把測試綁進部署 CI、async session hook、Apple 登入（需 $99/年）。

## 開發指令
- 型別/打包：`npx tsc --noEmit`、`npm run build`（`tsc -b && vite build`）。
- 測試：`npm test`（Vitest；測試在 `src/lib/*.test.ts`）。
- UI 截圖（看畫面）：`npm run screenshot:setup`（每容器一次）→ 或全域 `webshot --url <preview> --routes "/,settings" --out /tmp/x`。詳見 `tools/README.md`。
- 部署：push `main` 觸發 `deploy.yml`；CI 用 `npm ci || npm install`。改 `package.json` 必同步 `package-lock.json` 一起 commit。

## 重要雲端/帳號慣例（勿違反）
- 所有 user-facing 文案用「綁定 / 取回資料」，避免「備份 / 登入」。
- Google 入口只留一顆「用 Google 繼續」；不要再加獨立「取回」按鈕（自動處理）。
- 動 auth 流程時，務必保留：匿名 fallback、本機資料遷移、AuthHashNotice 的防跳轉旗標。
