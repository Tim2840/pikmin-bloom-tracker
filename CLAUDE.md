# PikLog（Pikmin Bloom Tracker）

長輩友善的明信片收發與打蘑菇互動紀錄工具。繁體中文介面。

## 技術棧與指令

- **Stack**：Vite + React 18 + TypeScript + Tailwind + Zustand + Supabase + react-router-dom
- **開發**：`npm run dev`
- **驗證（改完務必跑）**：`npx tsc -b`（型別檢查；**不要只跑 `tsc --noEmit`**，它不檢查 app 的 tsconfig，會漏掉未使用變數與型別錯誤）、`npm test`，或 `npm run build`（完整：`tsc -b && vite build`）
- `dist/` 為 build 產物，已加入 `.gitignore`，**不要 commit**

## 規格來源

`openspec/sprints.md` 是 sprint 範圍與驗收標準的**單一事實來源**，實作前先對照。

## 專案現況（記憶檔，跨 session 必讀）

`docs/PROJECT_STATUS.md` 記錄「現在做到哪、帳號/同步功能怎麼運作、Supabase 後端狀態、待辦」。
- **每個新對話開頭先讀它**，才能無縫接續。
- **每次告一段落（commit/部署後）要順手更新它**，保持新鮮——這份的維護責任在 AI，不該丟給使用者。

## 核心慣例

### 資料層：Store 雙寫模式
所有 store（`usePeopleStore`、`useRecordsStore`、`useQuickActionsStore`）採同一模式：
- 先寫 LocalStorage（樂觀更新 + 離線 fallback），再嘗試同步 Supabase
- 用 `isSupabaseConfigured()` 判斷是否有設定金鑰；沒有就純本地模式
- Supabase 失敗時保留本地變更並回報 error，**不** rollback
- 新增 store 請沿用此模式

### 圖示與特效
- 品項（明信片／蘑菇）圖示一律用 `components/PikIcon` 的 `ItemIcon`，**不要再用 📮🍄 emoji**；圖示造型集中在 `src/lib/pikIcons.ts`（A 貼紙風，原創造型，不仿官方角色）。
- 記錄成功的慶祝用 `lib/effects.ts` 的 `celebrate(button)`，里程碑用 `lib/milestones.ts` 的 `checkMilestone(總筆數)`。特效一律不接收點擊、不到 1 秒（里程碑約 2.6 秒）、遵守系統「減少動態」與設定頁「特效」開關。

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
- 所有彈窗一律用 `components/ModalShell`（鎖住背景捲動、點背景空白處或按 Esc 關閉），**不要再自己寫 `fixed inset-0` 的外框**

### 介面文字精簡規則（使用者要求，新做的畫面一律遵守）
- 畫面上**不放括號或註解式的補充文字**，使用者不需要知道那麼多。
- 選填欄位**不標記**，只在必填欄位保留紅色星號。
- 數量用標題旁的小標籤（`CountPill`，例如「好友名冊 12 人」），不用括號包。
- 頁面副標一句話就好，不重述標題。
- 例外（照常保留說明）：教學導覽與安裝步驟、錯誤與失敗訊息、空狀態的引導、刪除確認視窗。

## Git / Commit

- 中文 **conventional commits**（例：`feat(records): ...`、`fix:`、`chore:`、`docs:`）
- commit 前先 `git diff` 確認範圍
- 提交多行訊息時，這個 Bash 工具是 **bash**（非 PowerShell），用 heredoc：
  `git commit -F - <<'EOF' ... EOF`，**不要**用 PowerShell here-string（`@'...'@` 會把 `@` 混進訊息）

## GitHub Pages 部署規則（血淚教訓，勿跳過）

### Lockfile 紀律（部署成敗關鍵）
CI 的安裝步驟為 `npm ci || npm install`：`npm ci` 嚴格、可重現，但只要
`package-lock.json` 缺失或與 `package.json` 不同步就直接中止。**血淚教訓**：
教學功能曾因 lockfile 不同步導致部署整批失敗、線上停在舊版。

- 只要改了 `package.json`（新增/移除/升降版相依），**立刻** `npm install`
  重新產生 `package-lock.json`，並把**兩個檔放在同一個 commit**一起 push。
- **不要**手改 `package-lock.json`；它由 `npm install` 產生。
- `package-lock.json` **要 commit**（不可加入 `.gitignore`），CI 才能重現安裝。
- 改完跑一次 `npm run build` 本地驗證（確認 lockfile + 相依可成功打包）再 push。

### push 前五步 SOP
1. `git status` → 確認沒有漏 add 的檔案，也沒有誤加 `dist/`、`.env*`、暫存檔。
2. `git diff` → 逐一確認變更範圍與內容；改過 `package.json` 就確認 lockfile 也一起進來。
3. `npx tsc --noEmit`（快）或 `npm run build`（完整）→ 型別與打包都要綠燈。
4. 用中文 conventional commit 提交（heredoc 多行訊息）。
5. push 後到 GitHub Actions 確認 **Deploy to GitHub Pages** 這條 run 為
   success；失敗就抓 build job log 對症處理，**不要**放著不管讓線上停在舊版。

### 常見地雷
- **新增頁面/檔案**：`git add -A` 或逐一確認，App.tsx 加了 import 但忘 add 新檔案 → CI 必死
- **新裝套件**：一律 `npm install <pkg>`（不要只 `npm i`），確認 package.json 更新後立刻 commit
- **vite.config.ts**：必須有 `base: '/pikmin-bloom-tracker/'`，少了這行 JS/CSS 全 404
- **react-router-dom**：`<Router basename="/pikmin-bloom-tracker">` 必須與 vite base 一致
- **沙盒讀檔**：不要 `rsync` 或 `cat` 從 `/sessions/.../mnt/` 讀大檔案，會截斷；改用 Read tool 讀 Windows 原始路徑

### GitHub Token
- 有效期設 **No expiration** 或至少 90 天，1 天 token 跨日就廢
- 必要 scope：`repo` + `workflow`（少 workflow 無法 push `.github/workflows/`）

### 部署機制備忘
- `.github/workflows/deploy.yml` 在 **push 到 `main`** 時觸發；feature 分支不會部署。
- `vite.config.ts` 的 `base: '/pikmin-bloom-tracker/'` 是 GitHub Pages 子路徑，勿移除。
- workflow 會 `cp dist/index.html dist/404.html` 支援 SPA 路由，勿刪。
