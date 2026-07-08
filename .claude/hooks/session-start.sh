#!/bin/bash
set -euo pipefail

# 僅在 Claude Code on the web 遠端環境執行（本機開發不需要）
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$ROOT"

# 1) 安裝專案相依（讓 tsc / build / vite preview 在新容器即可用）
#    用 npm install（非 npm ci）以利容器快取，且可容忍 lockfile 些微差異
npm install

# 2) 安裝全域 webshot UI 截圖工具（idempotent：已存在就跳過）
#    瀏覽器走 npm 內含的 chromium，不需外部 CDN
if [ ! -x "$HOME/.local/bin/webshot" ]; then
  bash "$ROOT/tools/install-webshot.sh"
fi
