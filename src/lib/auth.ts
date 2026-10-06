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

const appUrl = (): string => `${window.location.origin}${import.meta.env.BASE_URL}`

// 匿名帳號「綁定」Google（保留現有資料）。導向 Google 後再回到線上 App。
export async function linkGoogle(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: '尚未設定雲端同步' }
  const { error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: { redirectTo: appUrl() },
  })
  if (error) return { error: error.message }
  return { error: null }
}

// 換裝置：用 Google 登入（以該 Google 帳號身份登入並還原其資料）。
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: '尚未設定雲端同步' }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: appUrl() },
  })
  if (error) return { error: error.message }
  return { error: null }
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return
  await supabase.auth.signOut()
}
