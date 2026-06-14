import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyFontScale, getLocalSettings } from './stores/useSettingsStore'
import './lib/pwaInstall' // 早期註冊 beforeinstallprompt 監聽

// 開機即套用使用者的介面縮放，避免畫面先以預設大小閃一下
applyFontScale(getLocalSettings().fontScale)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
