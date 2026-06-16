# tools/ — 開發輔助工具

專案開發用的工具，**與線上 App 無關、不影響 GitHub Pages 部署**。

## `install-webshot.sh` — 全域 UI 截圖工具安裝器

一支**自包含**安裝器，會在目前機器安裝跨專案的 `webshot` CLI 與 `screenshot-app`
Claude 技能，讓開發時能對任何正在跑的本機站台自動截圖（手機/桌面）。

- 瀏覽器使用 npm 內含的 chromium（`@sparticuz/chromium` + `puppeteer-core`），
  **不需外部 CDN**，可在限制網路 egress 的環境（如 Claude Code on the web）運作。
- 安裝位置：`~/.claude/tools/webshot/`、`~/.local/bin/webshot`、`~/.claude/skills/screenshot-app/`。

### 安裝
```bash
bash tools/install-webshot.sh
```

### 持久化（跨 session / 新容器）
雲端容器是用完即丟的；要讓每個新 session 都自動有 `webshot`，把這支腳本的內容
（或 `bash .../install-webshot.sh`）加入 **Claude Code on the web 的環境設定 / 啟動腳本**。
參考：https://code.claude.com/docs/en/claude-code-on-the-web

### 用法
```bash
# 先在另一個終端起站台，例如：npm run preview
webshot --url http://localhost:4173/pikmin-bloom-tracker --routes "/,settings,stats" --out /tmp/shots
# 選項：--views mobile,desktop  --seed seed.js  --wait 800  --no-full
```

> 注意：`position: fixed` 元素在整頁截圖會定格在頁面中段，屬正常現象；要看固定元素實際位置用 `--no-full`。
