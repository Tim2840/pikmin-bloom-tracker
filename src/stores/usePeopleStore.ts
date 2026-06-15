import { create } from 'zustand'
import { Person } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSessionUserId } from '../lib/auth'

interface PeopleState {
  people: Person[]
  loading: boolean
  error: string | null
  fetchPeople: () => Promise<void>
  addPerson: (name: string, nickname?: string, color?: string, icon?: string) => Promise<boolean>
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id' | 'createdAt' | 'sortOrder'>>) => Promise<boolean>
  deletePerson: (id: string) => Promise<boolean>
  reorderPerson: (id: string, direction: 'up' | 'down') => void
}

const getLocalPeople = (): Person[] => {
  try {
    const local = localStorage.getItem('piklog_people')
    const people: Person[] = local ? JSON.parse(local) : []
    // migrate: assign sortOrder by index if missing
    return people
      .map((p, i) => ({ ...p, sortOrder: p.sortOrder ?? i }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch (e) {
    console.error('讀取本地 LocalStorage 失敗', e)
    return []
  }
}

const saveLocalPeople = (people: Person[]) => {
  try {
    localStorage.setItem('piklog_people', JSON.stringify(people))
  } catch (e) {
    console.error('儲存本地 LocalStorage 失敗', e)
  }
}

export const usePeopleStore = create<PeopleState>((set, get) => ({
  people: getLocalPeople(),
  loading: false,
  error: null,

  fetchPeople: async () => {
    set({ loading: true, error: null })

    if (!isSupabaseConfigured()) {
      set({ people: getLocalPeople(), loading: false })
      return
    }

    try {
      const userId = await getSessionUserId()
      let query = supabase.from('persons').select('*').order('sort_order', { ascending: true })
      if (userId) query = query.eq('user_id', userId)
      const { data, error } = await query

      if (error) throw error

      if (data) {
        const mappedPeople: Person[] = data.map((p, i) => ({
          id: p.id,
          name: p.name,
          nickname: p.nickname || undefined,
          color: p.color || undefined,
          icon: p.icon || undefined,
          sortOrder: p.sort_order ?? i,
          createdAt: p.created_at,
        }))

        saveLocalPeople(mappedPeople)
        set({ people: mappedPeople, loading: false })
      }
    } catch (err: any) {
      console.error('從 Supabase 讀取人物失敗，改用 LocalStorage:', err)
      set({
        people: getLocalPeople(),
        loading: false,
        error: `Supabase 連線失敗，已自動載入本地資料。(${err.message || err})`,
      })
    }
  },

  addPerson: async (name, nickname, color, icon) => {
    const current = get().people
    if (current.length >= 20) {
      set({ error: '好友名單最多新增 20 位！' })
      return false
    }

    set({ loading: true, error: null })
    const newPersonId = crypto.randomUUID()
    const nowIso = new Date().toISOString()
    const sortOrder = current.length

    const localNewPerson: Person = {
      id: newPersonId,
      name,
      nickname: nickname || undefined,
      color: color || '#6B7280',
      icon: icon || undefined,
      sortOrder,
      createdAt: nowIso,
    }

    const updatedLocal = [...current, localNewPerson]
    saveLocalPeople(updatedLocal)

    if (!isSupabaseConfigured()) {
      set({ people: updatedLocal, loading: false })
      return true
    }

    try {
      const userId = await getSessionUserId()
      const { data, error } = await supabase
        .from('persons')
        .insert([{
          id: newPersonId,
          user_id: userId,
          name,
          nickname: nickname || null,
          color: color || '#6B7280',
          icon: icon || null,
          sort_order: sortOrder,
          created_at: nowIso,
        }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        const addedPerson: Person = {
          id: data[0].id,
          name: data[0].name,
          nickname: data[0].nickname || undefined,
          color: data[0].color || undefined,
          icon: data[0].icon || undefined,
          sortOrder: data[0].sort_order ?? sortOrder,
          createdAt: data[0].created_at,
        }

        const filtered = getLocalPeople().filter(p => p.id !== newPersonId)
        const finalPeople = [...filtered, addedPerson].sort((a, b) => a.sortOrder - b.sortOrder)
        saveLocalPeople(finalPeople)
        set({ people: finalPeople, loading: false })
      }
      return true
    } catch (err: any) {
      console.error('寫入 Supabase 失敗，已保留本地變更:', err)
      set({
        people: updatedLocal,
        loading: false,
        error: `寫入資料庫失敗，已暫存至本地。(${err.message || err})`,
      })
      return true
    }
  },

  updatePerson: async (id, updates) => {
    set({ loading: true, error: null })

    const currentLocal = getLocalPeople()
    const updatedLocal = currentLocal.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    )
    saveLocalPeople(updatedLocal)

    if (!isSupabaseConfigured()) {
      set({ people: updatedLocal, loading: false })
      return true
    }

    try {
      const { error } = await supabase
        .from('persons')
        .update({
          name: updates.name,
          nickname: updates.nickname || null,
          color: updates.color,
          icon: updates.icon || null,
        })
        .eq('id', id)

      if (error) throw error

      set({ people: updatedLocal, loading: false })
      return true
    } catch (err: any) {
      console.error('更新 Supabase 失敗，已保留本地更新:', err)
      set({
        people: updatedLocal,
        loading: false,
        error: `更新資料庫失敗，已儲存於本地。(${err.message || err})`,
      })
      return true
    }
  },

  deletePerson: async (id) => {
    set({ loading: true, error: null })

    const currentLocal = getLocalPeople()
    const updatedLocal = currentLocal.filter((p) => p.id !== id)
    saveLocalPeople(updatedLocal)

    if (!isSupabaseConfigured()) {
      set({ people: updatedLocal, loading: false })
      return true
    }

    try {
      const { error } = await supabase.from('persons').delete().eq('id', id)

      if (error) throw error

      set({ people: updatedLocal, loading: false })
      return true
    } catch (err: any) {
      console.error('刪除 Supabase 資料失敗，已自本地移除:', err)
      set({
        people: updatedLocal,
        loading: false,
        error: `資料庫刪除失敗，已自本地移除。(${err.message || err})`,
      })
      return true
    }
  },

  reorderPerson: (id, direction) => {
    const sorted = [...getLocalPeople()].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(p => p.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const temp = sorted[idx].sortOrder
    sorted[idx] = { ...sorted[idx], sortOrder: sorted[swapIdx].sortOrder }
    sorted[swapIdx] = { ...sorted[swapIdx], sortOrder: temp }
    sorted.sort((a, b) => a.sortOrder - b.sortOrder)

    saveLocalPeople(sorted)
    set({ people: sorted })

    if (isSupabaseConfigured()) {
      Promise.all([
        supabase.from('persons').update({ sort_order: sorted[idx].sortOrder }).eq('id', sorted[idx].id),
        supabase.from('persons').update({ sort_order: sorted[swapIdx].sortOrder }).eq('id', sorted[swapIdx].id),
      ]).catch(err => console.error('排序同步失敗:', err))
    }
  },
}))
