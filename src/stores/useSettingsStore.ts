import { create } from 'zustand'

export interface AppSettings {
  /** 介面整體縮放：1.0 = 100%（基準 16px） */
  fontScale: number
}

const LOCAL_KEY = 'piklog_settings'

const DEFAULT_SETTINGS: AppSettings = { fontScale: 1.0 }

/** 縮放範圍護欄（與設定頁滑桿一致） */
export const MIN_SCALE = 0.85
export const MAX_SCALE = 1.4

const clampScale = (n: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number.isFinite(n) ? n : 1))

export const getLocalSettings = (): AppSettings => {
  try {
    const local = localStorage.getItem(LOCAL_KEY)
    if (!local) return DEFAULT_SETTINGS
    const parsed = JSON.parse(local) as Partial<AppSettings>
    return { fontScale: clampScale(parsed.fontScale ?? 1) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

const saveLocalSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings))
  } catch {
    /* 私密模式或容量滿時忽略 */
  }
}

/** 套用介面縮放到 <html>（Tailwind 採 rem，會等比縮放字級與間距） */
export const applyFontScale = (scale: number) => {
  document.documentElement.style.fontSize = `${16 * clampScale(scale)}px`
}

interface SettingsState {
  settings: AppSettings
  setFontScale: (scale: number) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: getLocalSettings(),

  setFontScale: (scale) => {
    const fontScale = clampScale(scale)
    const next = { fontScale }
    saveLocalSettings(next)
    applyFontScale(fontScale)
    set({ settings: next })
  },

  reset: () => {
    saveLocalSettings(DEFAULT_SETTINGS)
    applyFontScale(DEFAULT_SETTINGS.fontScale)
    set({ settings: DEFAULT_SETTINGS })
  },
}))
