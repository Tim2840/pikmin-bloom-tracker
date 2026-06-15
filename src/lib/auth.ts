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
export async function linkEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: '尚未設定雲端同步' }
  const { error } = await supabase.auth.updateUser({ email })
  if (error) return { error: error.message }
  return { error: null }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return
  await supabase.auth.signOut()
}
