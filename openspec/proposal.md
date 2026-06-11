# Pikmin Bloom Tracker — Proposal

**Author:** Tim  
**Date:** 2026-06-12  
**Status:** Draft

---

## Problem Statement

Pikmin Bloom 玩家（尤其是長輩）需要一個簡單的工具來追蹤與好友的互動紀錄，包含明信片收發與蘑菇合作。目前沒有官方紀錄工具，玩家只能靠記憶或手動筆記，容易遺漏。

## User Stories

- As a 長輩玩家, I want to 一鍵記錄今天誰送了我明信片, so that 我不會忘記要回寄。
- As a 長輩玩家, I want to 一鍵記錄今天跟誰一起打蘑菇, so that 我能追蹤好友互動頻率。
- As a 長輩玩家, I want to 查看歷史紀錄, so that 我能確認哪位好友已回寄、哪位還沒。
- As a 長輩玩家, I want to 看簡單統計, so that 我知道誰最常跟我互動。

## Functional Requirements

1. 使用者可新增常用人物（名稱、暱稱、顏色標籤）。
2. 使用者可透過首頁快速新增一筆紀錄（人名 + 日期 + 品項 + 方向）。
3. 使用者可設定常用快捷動作，首頁一按即記錄。
4. 使用者可查看所有歷史紀錄，並依人名/品項/日期篩選。
5. 使用者可編輯或刪除任何一筆紀錄。
6. 使用者可查看每位好友的互動次數統計。

## Non-Functional Requirements

- 介面字體 ≥ 16px，按鈕高度 ≥ 44px（老人友善）。
- 首頁操作流程不超過 3 步驟。
- 手機優先設計（375px~）。
- 本地 LocalStorage fallback（離線仍可用）。

## Tech Stack

| 層級 | 技術 | 說明 |
|------|------|------|
| Framework | Next.js 14 (App Router) + TypeScript | 路由、SSR、API Route |
| UI | Tailwind CSS + shadcn/ui | 樣式與元件庫 |
| Icons | **Lucide React** | 統一圖示庫，輕量、語意清晰，與 shadcn/ui 原生整合 |
| State | Zustand | 全域狀態管理 |
| Backend | Supabase (DB + Auth) | 資料庫、即時查詢 |
| Deploy | Vercel | CI/CD 部署 |

### Lucide React 使用規範

- 安裝：`npm install lucide-react`
- 所有 icon 統一從 `lucide-react` import，不混用其他圖示庫。
- icon-only 按鈕必須加 `aria-label`，確保無障礙。
- 常用 icon 對照：
  - 🍄 蘑菇互動 → `Swords` 或 `Users`
  - 💌 明信片 → `Mail` 或 `Send`
  - ➕ 新增紀錄 → `Plus`
  - 🗑️ 刪除 → `Trash2`
  - ✏️ 編輯 → `Pencil`
  - 📋 歷史紀錄 → `ClipboardList`
  - 📊 統計 → `BarChart2`
  - 👤 人物管理 → `UserRound`
  - ✅ 確認 → `Check`
  - ← 返回 → `ChevronLeft`

## Out of Scope (MVP)

- 使用者登入 / 多帳號管理。
- OCR 截圖辨識。
- 語音輸入。
- 推播提醒。

## Acceptance Criteria

- [ ] 首頁可在 3 步驟內完成一筆紀錄。
- [ ] 人名顯示在首頁快捷區，最多 8 個。
- [ ] 歷史紀錄頁可依人名、品項、日期篩選。
- [ ] 儲存成功後顯示確認 toast。
- [ ] 統計頁正確顯示每位好友的明信片/蘑菇次數。
- [ ] 手機版（375px）操作無障礙，無元素溢出。
- [ ] 所有 icon 統一使用 Lucide React，icon-only 按鈕皆有 `aria-label`。

## Open Questions

- 是否需要支援家庭共用（多人共用一個紀錄本）？
- 資料是否需要匯出 CSV / Excel？
