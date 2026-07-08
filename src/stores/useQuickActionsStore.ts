import { create } from 'zustand'
import { QuickAction } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSessionUserId } from '../lib/auth'

interface QuickActionsState {
  quickActions: QuickAction[]
  loading: boolean
  error: string | null
  fetchQuickActions: () => Promise<void>
  addQuickAction: (data: Omit<QuickAction, 'id' | 'createdAt' | 'sortOrder'>) => Promise<boolean>
  deleteQuickAction: (id: string) => Promise<boolean>
  reorderQuickAction: (id: string, direction: 'up' | 'down') => void
}

const LOCAL_KEY = 'piklog_quick_actions'

const getLocalQuickActions = (): QuickAction[] => {
  try {
    const local = localStorage.getItem(LOCAL_KEY)
    const actions: QuickAction[] = local ? JSON.parse(local) : []
    return actions
      .map((a, i) => ({ ...a, sortOrder: a.sortOrder ?? i }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    return []
  }
}

const saveLocalQuickActions = (actions: QuickAction[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(actions))
  } catch {}
}

async function migrateLocalToCloud(userId: string, localActions: QuickAction[]): Promise<void> {
  if (!localActions.length) return
  const flag = 'piklog_cloud_synced_qa_' + userId
  if (localStorage.getItem(flag)) return

  const rows = localActions.map(a => ({
    id: a.id,
    user_id: userId,
    label: a.label,
    person_id: a.personId,
    item_type: a.itemType,
    action_type: a.actionType,
    use_today: a.useToday,
    sort_order: a.sortOrder,
    created_at: a.createdAt,
  }))

  const { error } = await supabase
    .from('quick_actions')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

  if (!error) localStorage.setItem(flag, '1')
}

export const useQuickActionsStore = create<QuickActionsState>((set) => ({
  quickActions: getLocalQuickActions(),
  loading: false,
  error: null,

  fetchQuickActions: async () => {
    set({ loading: true, error: null })

    if (!isSupabaseConfigured()) {
      set({ quickActions: getLocalQuickActions(), loading: false })
      return
    }

    try {
      const userId = await getSessionUserId()
      let query = supabase.from('quick_actions').select('*').order('sort_order', { ascending: true })
      if (userId) query = query.eq('user_id', userId)
      const { data, error } = await query

      if (error) throw error

      if (data) {
        if (data.length === 0 && userId) {
          await migrateLocalToCloud(userId, getLocalQuickActions())
          const { data: migrated } = await supabase
            .from('quick_actions')
            .select('*')
            .eq('user_id', userId)
            .order('sort_order', { ascending: true })
          if (migrated?.length) {
            const mapped: QuickAction[] = migrated.map((a, i) => ({
              id: a.id,
              label: a.label,
              personId: a.person_id,
              itemType: a.item_type,
              actionType: a.action_type,
              useToday: a.use_today,
              sortOrder: a.sort_order ?? i,
              createdAt: a.created_at,
            }))
            saveLocalQuickActions(mapped)
            set({ quickActions: mapped, loading: false })
            return
          }
        }

        const mapped: QuickAction[] = data.map((a, i) => ({
          id: a.id,
          label: a.label,
          personId: a.person_id,
          itemType: a.item_type,
          actionType: a.action_type,
          useToday: a.use_today,
          sortOrder: a.sort_order ?? i,
          createdAt: a.created_at,
        }))
        saveLocalQuickActions(mapped)
        set({ quickActions: mapped, loading: false })
      }
    } catch (err: any) {
      set({ quickActions: getLocalQuickActions(), loading: false, error: err.message })
    }
  },

  addQuickAction: async (data) => {
    set({ loading: true, error: null })
    const current = getLocalQuickActions()
    const id = crypto.randomUUID()
    const nowIso = new Date().toISOString()
    const sortOrder = current.length

    const newAction: QuickAction = { id, ...data, sortOrder, createdAt: nowIso }
    const updated = [...current, newAction]
    saveLocalQuickActions(updated)

    if (!isSupabaseConfigured()) {
      set({ quickActions: updated, loading: false })
      return true
    }

    try {
      const userId = await getSessionUserId()
      const { error } = await supabase.from('quick_actions').insert([{
        id,
        user_id: userId,
        label: data.label,
        person_id: data.personId,
        item_type: data.itemType,
        action_type: data.actionType,
        use_today: data.useToday,
        sort_order: sortOrder,
        created_at: nowIso,
      }])

      if (error) throw error

      set({ quickActions: updated, loading: false })
      return true
    } catch (err: any) {
      set({ quickActions: updated, loading: false, error: err.message })
      return true
    }
  },

  deleteQuickAction: async (id) => {
    set({ loading: true, error: null })
    const current = getLocalQuickActions()
    const updated = current.filter(a => a.id !== id)
    saveLocalQuickActions(updated)

    if (!isSupabaseConfigured()) {
      set({ quickActions: updated, loading: false })
      return true
    }

    try {
      const { error } = await supabase.from('quick_actions').delete().eq('id', id)
      if (error) throw error
      set({ quickActions: updated, loading: false })
      return true
    } catch (err: any) {
      set({ quickActions: updated, loading: false, error: err.message })
      return true
    }
  },

  reorderQuickAction: (id, direction) => {
    const sorted = [...getLocalQuickActions()].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(a => a.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const temp = sorted[idx].sortOrder
    sorted[idx] = { ...sorted[idx], sortOrder: sorted[swapIdx].sortOrder }
    sorted[swapIdx] = { ...sorted[swapIdx], sortOrder: temp }
    sorted.sort((a, b) => a.sortOrder - b.sortOrder)

    saveLocalQuickActions(sorted)
    set({ quickActions: sorted })

    if (isSupabaseConfigured()) {
      Promise.all([
        supabase.from('quick_actions').update({ sort_order: sorted[idx].sortOrder }).eq('id', sorted[idx].id),
        supabase.from('quick_actions').update({ sort_order: sorted[swapIdx].sortOrder }).eq('id', sorted[swapIdx].id),
      ]).catch(err => console.error('快捷動作排序同步失敗:', err))
    }
  },
}))
