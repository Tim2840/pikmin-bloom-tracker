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
  - **Email 綁定功能已移除**（只留 Google）。先前用 Email 綁定的帳號，改用同一個 Gmail 的 Google 登入即可取回（Supabase 會依相同 email 對應）。`AuthHashNotice` 仍保留 Email 連結導回的處理（舊信件相容）。
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

## 人物「國家」（取代代表顏色）
- 人物表單改選國家（`src/lib/countries.ts`，ISO 代碼 → 旗幟 + 繁中國名）；移除顏色選擇器與「紅/綠皮敏」文案。
- `color` 欄位保留，由國家代碼自動對應（供首頁/月曆/統計區分好友），舊資料沿用原色。
- 🔲 **需在 Supabase SQL Editor 執行 `supabase/migrations/004_add_person_country.sql`**，否則寫入雲端時 `country` 欄位不存在（本地仍正常）。

## 同步合併（防資料消失）
- 修正：舊版 `fetch*` 在雲端有/無資料時會**直接覆蓋本機**；若寫入雲端失敗（斷線、專案暫停、缺 `country` 欄位）重新整理後本機資料會被清空。
- 現在改為 `src/lib/syncMerge.ts` 聯集合併（同 id 雲端為準），本機獨有的資料自動補傳雲端。三個 store 皆適用。
- 好友上限 20 → 100（`MAX_PEOPLE`，在 `usePeopleStore.ts`）。
- 取捨：A 裝置刪除、B 裝置本機仍有時，B 重新整理會把它補傳回來（寧可多不可少）。

## 互動紀錄：連續新增
- 「新增紀錄」儲存後**不關視窗**，停在同一位好友／品項／方向／日期，只清空備註；按「完成」才關閉（`RecordForm` 的 `continuous` 模式，編輯模式不受影響）。
- 儲存失敗時不重設表單；儲存中按鈕 disabled 防連點重複新增。
- **編輯紀錄**只顯示該筆的好友（不列全部名冊）；僅當好友已被刪除時才退回選單。
- **日期欄位**改為「年／月／日」三個下拉（`src/components/DateSelect.tsx`），取代原生 `<input type="date">`——手機上選完年月選單會自動關閉、日期得重開再選。不可選未來日期，改年月時日數自動夾回合法範圍（3/31 → 2 月 = 2/28）。

## 新增紀錄的好友下拉 / 資料匯出
- 「新增互動紀錄」選好友改為下拉選單（好友多時不必滑很久）；編輯仍只顯示該筆好友。
- 設定頁「匯出資料」：匯出好友名單、互動紀錄為 CSV（UTF-8 含 BOM，Excel / Google 試算表可開）。邏輯在 `src/lib/exportData.ts`（含測試）；開頭為 `= + - @` 的文字會加單引號防公式注入。
- 檔名刻意用英文（`PikLog_people_日期.csv`、`PikLog_records_日期.csv`）：部分瀏覽器會吃掉非 ASCII 檔名。
- 匯出前會先 `fetchPeople/fetchRecords` 同步一次。目前沒有「匯入」。

## 好友往來 / 搜尋 / 久未互動 / 測試閘門
- **好友上限 450**（`MAX_PEOPLE`，對齊遊戲好友上限；原 100）。
- **好友往來頁** `/people/:id`（`FriendDetailPage`）：人物管理點頭像／姓名進入；顯示四個累計數字、最近互動（幾天前）、完整時間軸（30 筆一頁、可「顯示更多」）。`/people/quick-actions` 仍為獨立靜態路由。
- **好友搜尋**：人物管理好友 ≥ 6 位時出現搜尋框（姓名／暱稱／國家名）；搜尋中停用排序鈕（排序以全名單為準）。
- **很久沒互動**：統計頁底部，門檻 30 天、不受上方時間範圍影響；從沒紀錄的好友排最後。點名字進往來頁。
- 純邏輯在 `src/services/peopleService.ts`（`filterPeople`、`findInactiveFriends`、`recordsOfPerson`），皆有單元測試。
- **自動測試閘門**：`deploy.yml` 的 build job 在打包前跑 `npm test`；測試失敗 → build 失敗 → 不部署。**CI 紅燈先看是不是測試掛了。**
- 目前測試皆為純函式單元測試（無 jsdom / 元件測試；要加需新增相依，須先問使用者）。

## 後續想法（待使用者決定）
- 首頁「今天還沒寄給誰」清單；快捷鈕誤點「復原」與同日重複寄出提醒；匯入 CSV；字級修正（仍有數處 `text-xs`，低於 16px 規則）。

## 新版本通知（已上線）
- PWA 更新策略由 `autoUpdate` 改為 `prompt`（`vite.config.ts` 的 `registerType`）。偵測到新版時，畫面下方出現「有新版本［更新］」（`components/UpdatePrompt.tsx`，用 `virtual:pwa-register/react`）；按「更新」才換上並重新載入，不會自己重新整理，所以不會打斷輸入。
- 主動檢查：每小時一次，以及使用者切回 App（`visibilitychange`）時各檢查一次；離線時略過。常駐桌面的 App 因此也會知道有新版。
- 提示 `z-40`（低於彈窗）、手機在底部導覽上方（`bottom-24`）、電腦在右下（`md:bottom-6`）。
- **已驗證的流程**：舊版開著 → 重新打包出新版 → 切回 App → 出現提示 → 按「更新」→ 載入新 CSS、提示消失。腳本做法：先 build、起 `vite preview`、在頁面載入並讓 SW 接管，再改一條樣式重新 build，觸發 `visibilitychange` 後檢查。
- **注意**：這次上線前就在用舊版的人**看不到**這次的提示（他們手上的版本還沒有這個元件），會照舊在下次完整重開時靜默換新；從這個版本開始才會有提示。
- 提示的 `animate-scale-up` 會覆蓋 `transform`，所以置中不能用 `-translate-x-1/2`，要用 `inset-x-0 mx-auto w-max`。
- 桌面捷徑的圖示不在這個機制內（系統快取，需重新加入）。

## 彈窗行為（已上線）
- 所有彈窗共用 `components/ModalShell`：開啟時用 `lib/scrollLock.ts` 把頁面定住（`position: fixed`，iOS 也擋得住），關閉後捲回原位；點背景空白處或按 Esc 關閉；要「按下與放開都在背景」才關，避免在輸入框拖曳選字時誤關。
- 共 7 個彈窗已套用：新增／編輯／刪除紀錄、編輯／刪除好友、刪除快捷動作、首頁新增紀錄；首次登入提醒（`BackupReminderModal`）點背景 = 按「稍後」。
- 點背景關閉時不會儲存也不會刪除，輸入到一半的內容會丟掉。
- `TutorialOverlay`（教學導覽）不是這種彈窗，沒有改。
- 這部分是瀏覽器行為，目前只有手動／腳本實測，沒有放進 CI 自動測試。

## 自製圖示與特效（已上線）
- **圖示**：`src/lib/pikIcons.ts` 畫 SVG 字串（A 貼紙風：小蘑菇、信封明信片、小芽、愛心、星星），`PikIcon` / `ItemIcon` 元件使用。已取代各頁品項 emoji（首頁、紀錄、月曆、統計、往來頁、快捷動作、導覽列 logo）。好友「代表圖樣」仍是原本 8 個 Lucide 圖示（資料相容）；底部導覽圖示尚未重畫。
- **桌面／App 圖示**：`public/` 的 `pwa-192/512.png`、`pwa-maskable-512.png`（蘑菇縮到中央 60%，落在遮罩安全圈內）、`apple-touch-icon.png`、`icons/icon-*.png` 都已換成新小蘑菇（綠底＋貼紙風蘑菇）。這些 PNG 由 `pikIcon('mushroom','happy')` 渲染而成；日後改造型要重新產生這幾張。
- **首頁吉祥物**：蘑菇依 `mascotMood` 換表情——今天有互動開心、1–6 天沒互動普通、7 天以上打瞌睡。
- **小慶祝**：快捷鈕與紀錄表單（連續新增）儲存成功時圖示彈一下＋飄愛心星星（9 個，1.2 秒內連點減為 3 個）；`pointer-events: none`、不到 1 秒。
- **里程碑**：累計 10／50／100／200／500／1000 筆時一次性彩帶＋「第 N 筆！」（約 2.6 秒、不接收點擊），已慶祝的記在 `piklog_milestones_shown`，刪除再補回不重複。
- **開關**：設定頁「特效」可整個關閉（`settings.effects`，預設開）；系統「減少動態」時只留柔和光圈、無彩帶。
- 測試：`pikIcons`、`effects`（粒子減量）、`milestones`、`mascotMood`。
- **驗證指令注意**：`npx tsc --noEmit` 會漏錯，請用 `npx tsc -b`。

## 介面文字精簡（已套用）
- 規則寫在 `CLAUDE.md`「介面文字精簡規則」。已套用：人物管理、快捷動作、月曆、統計、設定匯出、好友往來頁、新增／編輯紀錄表單。
- 數量一律用 `CountPill`（`src/components/CountPill.tsx`）；匯出完成訊息不再顯示檔名；往來頁「最近互動」只顯示幾天前。
- 月曆選日的標題仍是「10月24日 (六)」，星期的括號是日期格式（`formatDateLong`），暫時保留；若要統一可改成「週六」。
- 教學（`tutorialData`）、安裝步驟、錯誤訊息、空狀態引導、刪除確認不在精簡範圍。

## 統計頁：雙向明細
- 摘要卡拆為：寄出明信片／收到明信片／我邀請他打蘑菇／他邀請我打蘑菇（原本「寄出明信片」「打蘑菇」把兩個方向混算）。
- 「每位好友明細」每人顯示四個數字（📮寄出／收到、🍄我邀他／他邀我）。
- 計數邏輯在 `recordService.countByDirection`（含測試）；文案在 `recordLabels.STAT_LABELS`；舊資料 `helped` 算往外。

## 協作分工（主管制，省 token）
- 主 session 兼「主管」：統整、驗證、向使用者報告，並負責最後合併與確認部署。
- 預設**不另開 session**：單一頁面／小型修改由主 session 直接做（讀檔 → 改 → tsc/test/build → 實測 → 合併）。
- 只有符合「跨多個獨立面向」或「需長時間獨立驗證」才開子 session，且每個子 session 角色固定：
  1. **功能實作**：UI／頁面／store 改動。
  2. **驗證 QA**：長輩友善規則（48px、字級、確認 Modal）檢查＋手機視窗實測＋回歸測試。
  3. **後端同步**：Supabase migration、RLS、同步合併邏輯（沙箱連不到 Supabase，只能做程式面）。
- 子 session 一律在各自分支開發、只回報結果摘要；合併到 `main` 與部署確認由主管做。

## 發佈規則（使用者長期授權）
- 使用者已授權：**修好（bug 修正、使用者要求的小功能）後，驗證通過就直接開 PR、squash 合併到 `main` 並確認 Deploy 成功，再向使用者回報**，不必每次先問。
- 前提：`npx tsc --noEmit`、`npm test`、`npm run build` 都綠燈；有畫面改動要先實測。
- 仍須先問的情況：改 `package.json` 相依、動 auth／資料遷移／Supabase 結構、刪除資料或其他不易回復的動作。

## 待驗收 / 已知事項
- 🔴 線上「Supabase 連線失敗 (TypeError: Failed to fetch)」：瀏覽器連不到 Supabase 主機。最常見原因＝免費專案閒置 7 天被**暫停**（Dashboard → Restore project）；其次是 GitHub secret `VITE_SUPABASE_URL` 填錯。沙箱連不到 Supabase，無法代測。
- 🔲 使用者實機驗收「用 Google 繼續」自動取回流程（沙箱連不到 Google/Supabase，無法代測）。已綁過情境會閃一下 Google 第二次跳轉（自動取回）。
- ℹ️ npm audit 5 個漏洞**全為 dev 相依**（`npm audit --omit=dev` = 0），不影響線上。
- ℹ️ 已安裝的桌面捷徑圖示是系統快取的：需「刪舊捷徑 → 重新加入主畫面」才會換成新圖示（網頁本身重開即可更新）。
- 💤 之前提過、未做：async session hook、Apple 登入（需 $99/年）。（測試已綁進部署 CI。）

## 開發指令
- 型別/打包：`npx tsc --noEmit`、`npm run build`（`tsc -b && vite build`）。
- 測試：`npm test`（Vitest；測試在 `src/lib/*.test.ts`）。
- UI 截圖（看畫面）：`npm run screenshot:setup`（每容器一次）→ 或全域 `webshot --url <preview> --routes "/,settings" --out /tmp/x`。詳見 `tools/README.md`。
- 部署：push `main` 觸發 `deploy.yml`；CI 用 `npm ci || npm install`。改 `package.json` 必同步 `package-lock.json` 一起 commit。

## 重要雲端/帳號慣例（勿違反）
- 所有 user-facing 文案用「綁定 / 取回資料」，避免「備份 / 登入」。
- Google 入口只留一顆「用 Google 繼續」；不要再加獨立「取回」按鈕（自動處理）。不要再加回 Email 綁定。
- iPhone：Safari 與「加到主畫面」的 App 儲存/登入各自獨立，同時用兩邊會變成兩個帳號；建議只用一邊。
- 動 auth 流程時，務必保留：匿名 fallback、本機資料遷移、AuthHashNotice 的防跳轉旗標。
