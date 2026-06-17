import { supabase, isSupabaseConfigured } from './supabase'

// 從快取 session 取 user_id，不發送網路請求
export async function getSessionUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

// App 啟動時呼叫：若無 session 就自動匿名登入（使用者無感）
export async function ensureSession(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    await supabase.auth.signInAnonymously()
  }
}

// 傳送 Email 確認信，匿名帳號升格為記名帳號（資料不丟失）
// 明確指定 emailRedirectTo 導回「線上 App」，避免落到 Supabase 預設的 localhost。
// （注意：此網址仍須在 Supabase Auth 的 Site URL / Redirect URLs 允許清單內才會生效）
export async function linkEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: '尚未設定雲端同步' }
  const emailRedirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`
  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo })
  if (error) return { error: error.message }
  return { error: null }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return
  await supabase.auth.signOut()
}
