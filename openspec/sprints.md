# Sprint Plan — Pikmin Bloom Tracker

**Author:** Tim (郭宣廷)  
**Date:** 2026-06-12  
**Status:** Active  
**Stack:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Zustand + Supabase  

> This document defines the full sprint breakdown for the Pikmin Bloom Tracker MVP.  
> All agents (Engineer, QA, Designer) should reference this as the source of truth for task scope and acceptance criteria.

---

## Sprint 1 — Quick Record (快速紀錄)

**Goal:** A user can open the app and log a record (who + what + when) in under 3 seconds.

**Duration:** 1 week  
**Priority:** Must-Ship

---

### Epic: 一鍵新增紀錄

#### Task 1: 建立首頁快速紀錄表單

- [ ] Subtask 1.1: 建立人名快捷按鈕區（從 Supabase `persons` 表撈資料渲染）
- [ ] Subtask 1.2: 建立品項選擇按鈕（`postcard` / `mushroom`，大型可點擊按鈕）
- [ ] Subtask 1.3: 建立方向選擇（`sent` / `received` / `helped`）
- [ ] Subtask 1.4: 建立日期選擇器，預設今天，快捷可選「今天 / 昨天 / 前天」
- [ ] Subtask 1.5: 按「儲存」後寫入 Supabase `records` 表，顯示成功 toast

#### Task 2: 建立紀錄列表頁 `/records`

- [ ] Subtask 2.1: 顯示最近 30 筆紀錄，依日期降序排列
- [ ] Subtask 2.2: 每筆紀錄顯示：人名、品項 emoji、方向、日期
- [ ] Subtask 2.3: 支援依人名與品項篩選
- [ ] Subtask 2.4: 支援刪除單筆紀錄（含二次確認）
- [ ] Subtask 2.5: 支援編輯單筆紀錄（Modal 表單）

---

### Acceptance Criteria — Sprint 1

- [ ] 從首頁選擇人名 → 品項 → 日期 → 按儲存，全流程在 3 秒內可完成
- [ ] 儲存成功後顯示確認訊息，內容為「已記錄：[人名] / [日期] / [品項]」
- [ ] 紀錄列表在 375px（手機）與 1280px（桌機）均正常顯示
- [ ] 刪除紀錄後列表即時更新，不需重新整理頁面
- [ ] 所有互動元素（按鈕、選擇器）touch target 最小 44x44px
- [ ] TypeScript：無 `any`，無型別錯誤

**Tech Notes:**
- 資料來源：Supabase（`persons` + `records` 表）
- State：Zustand store 管理目前選取的 personId、itemType、actionType、date
- 表單送出後重置 store 狀態
- 字體大小：所有標籤 ≥ 16px，按鈕字體 ≥ 18px（長輩友善模式）

---

## Sprint 2 — Person Management (人物管理)

**Goal:** User can manage a contact list and configure one-tap quick actions on the home screen.

**Duration:** 1 week  
**Priority:** Must-Ship

---

### Epic: 管理常用人物名單

#### Task 1: 建立人物管理頁 `/persons`

- [ ] Subtask 1.1: 顯示所有已新增的人物（名字 + 暱稱 + 顏色標籤）
- [ ] Subtask 1.2: 新增人物（名字、暱稱、顏色選擇 — 6 色色塊）
- [ ] Subtask 1.3: 編輯人物（inline 或 Modal 編輯）
- [ ] Subtask 1.4: 刪除人物（含確認，刪除後不影響既有紀錄）
- [ ] Subtask 1.5: 人物排序（拖拉或上下箭頭）

#### Task 2: 建立快捷動作設定 `/persons/quick-actions`

- [ ] Subtask 2.1: 使用者可建立「一鍵動作」：指定人名 + 品項 + 方向 + 是否用今天日期
- [ ] Subtask 2.2: 快捷動作可設定自訂標籤（例如：「AJ 寄明信片」）
- [ ] Subtask 2.3: 首頁渲染快捷動作按鈕（依使用者設定的順序）
- [ ] Subtask 2.4: 點擊快捷動作後直接新增一筆紀錄，不需逐步選擇
- [ ] Subtask 2.5: 支援刪除與排序快捷動作

---

### Acceptance Criteria — Sprint 2

- [ ] 可新增最多 20 位常用人物
- [ ] 人物顏色標籤正確顯示在首頁快捷按鈕上
- [ ] 快捷動作按鈕點擊後 1 秒內完成紀錄新增，顯示成功 toast
- [ ] 刪除人物後，該人物的歷史紀錄仍可在紀錄列表中看到（人名顯示為原始名稱，不刪除）
- [ ] 快捷動作排序在重新載入頁面後仍然保留
- [ ] 所有表單驗證錯誤訊息以中文顯示

**Tech Notes:**
- `persons` 表新增 `sortOrder: number` 欄位
- `quickActions` 新表：`id`, `label`, `personId`, `itemType`, `actionType`, `useToday`, `sortOrder`
- 快捷動作首頁區塊用 `useQuickActionsStore()` 管理
- 刪除人物時，`records` 表中對應紀錄的 `personId` 改為 null，人名 fallback 顯示 `persons.name`（建議存 snapshot）

---

## Sprint 3 — Stats & History (統計與回顧)

**Goal:** User can see interaction history at a glance — who they've exchanged with, what was sent, and when.

**Duration:** 1 week  
**Priority:** Should-Ship

---

### Epic: 統計頁與月曆檢視

#### Task 1: 建立統計頁 `/stats`

- [ ] Subtask 1.1: 每人送出明信片次數（本月 / 全部）
- [ ] Subtask 1.2: 每人幫打蘑菇次數（本月 / 全部）
- [ ] Subtask 1.3: 每人最近互動日期
- [ ] Subtask 1.4: 全體互動排行（互動次數最多的前 5 人）
- [ ] Subtask 1.5: 切換時間範圍：本月 / 近 30 天 / 全部

#### Task 2: 建立月曆檢視 `/calendar`

- [ ] Subtask 2.1: 顯示當月日曆，有紀錄的日期標記小圓點或 emoji
- [ ] Subtask 2.2: 點擊日期展開該日所有紀錄（inline 展開，不跳頁）
- [ ] Subtask 2.3: 支援切換上下個月
- [ ] Subtask 2.4: 當日有多筆紀錄時，顯示摘要（例如：「3 筆」）

---

### Acceptance Criteria — Sprint 3

- [ ] 統計頁在資料為空時顯示 empty state（不能只是空白）
- [ ] 月曆標記在 375px 手機上清楚可見、不重疊
- [ ] 時間範圍切換後統計數字立即更新，無需重新整理
- [ ] 點擊日期後紀錄明細在 300ms 內展開
- [ ] 統計數字用 `tabular-nums` font feature 對齊
- [ ] 所有空狀態（0 筆紀錄）提供友善提示文字

**Tech Notes:**
- 統計資料用 Supabase query 加 `count` + `group by` 處理，避免 client-side 全表掃描
- 月曆用純 CSS Grid 自刻，不要引入日曆套件（保持輕量）
- 日期格式統一用 `date-fns`，locale 設 `zh-TW`
- 月曆點擊展開用 Zustand 管理 `selectedDate` 狀態

---

## Schema Reference

```ts
// persons
interface Person {
  id: string;           // uuid
  name: string;
  nickname?: string;
  color?: string;       // 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
  sortOrder: number;
  createdAt: string;
}

// records
interface RecordItem {
  id: string;           // uuid
  personId: string | null;
  personNameSnapshot: string; // 存入當時人名，防止刪除人物後資料消失
  date: string;         // YYYY-MM-DD
  itemType: 'postcard' | 'mushroom';
  actionType: 'sent' | 'received' | 'helped';
  note?: string;
  createdAt: string;
}

// quick_actions
interface QuickAction {
  id: string;           // uuid
  label: string;
  personId: string;
  itemType: 'postcard' | 'mushroom';
  actionType: 'sent' | 'received' | 'helped';
  useToday: boolean;
  sortOrder: number;
  createdAt: string;
}
```

---

## Out of Scope (MVP)

- 使用者登入 / 多帳號
- 截圖 OCR 自動辨識
- 語音輸入
- 推播通知
- 多語言（先只做繁體中文）
- 匯出 CSV / Excel
- 好友之間的資料同步
