# 🍄 Pikmin Bloom Tracker

長輩友善的 Pikmin Bloom 互動紀錄工具，快速記錄好友明信片收發與蘑菇互動。

## 功能

- ⚡ 一鍵新增紀錄（人名 + 日期 + 品項）
- 📋 歷史紀錄列表，支援依人名/品項篩選
- 👥 常用人物管理
- 📊 簡單互動統計

## 技術棧

| 層級 | 技術 |
|------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Supabase (DB + Auth) |
| Deploy | Vercel |

## 本地開發

```bash
# 安裝依賴
npm install

# 複製環境變數
cp .env.local.example .env.local
# 填入你的 Supabase 金鑰

# 啟動開發伺服器
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## 環境變數

參考 `.env.local.example`

## 資料庫 Schema

參考 `supabase/migrations/`

## 專案結構

```
src/
├── app/              # Next.js App Router pages
├── components/       # 共用元件
├── lib/              # 工具函式、Supabase client
├── stores/           # Zustand stores
└── types/            # TypeScript types
supabase/
└── migrations/       # SQL migration 檔案
openspec/             # 功能規格文件 (OpenSpec)
```
