import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasConfig = !!supabaseUrl && !!supabaseAnonKey

if (!hasConfig) {
  console.warn(
    'Supabase URL 或 Anon Key 未設定於環境變數中。\n' +
    '系統將自動降級（Fallback）使用 LocalStorage 本地儲存。'
  )
}

// 初始化 client，若缺金鑰則以 placeholder 避免崩潰，但執行操作前會做 isSupabaseConfigured 檢查
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export const isSupabaseConfigured = (): boolean => {
  return hasConfig && supabaseUrl !== 'https://placeholder.supabase.co'
}
