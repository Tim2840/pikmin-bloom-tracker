import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ensureSession } from '../lib/auth'

interface AuthState {
  user: User | null
  loading: boolean
  isAnonymous: boolean
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAnonymous: false,

  init: async () => {
    if (!isSupabaseConfigured()) {
      set({ loading: false })
      return
    }

    await ensureSession()

    const { data: { session } } = await supabase.auth.getSession()
    const u = session?.user ?? null
    set({ user: u, isAnonymous: !!u && !u.email, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      set({ user: u, isAnonymous: !!u && !u.email })
    })
  },
}))
