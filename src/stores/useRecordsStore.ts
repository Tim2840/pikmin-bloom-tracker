import { create } from 'zustand'
import { RecordItem } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface RecordsState {
  records: RecordItem[]
  loading: boolean
  error: string | null
  fetchRecords: () => Promise<void>
  addRecord: (data: Omit<RecordItem, 'id' | 'createdAt'>) => Promise<boolean>
  updateRecord: (id: string, updates: Partial<Omit<RecordItem, 'id' | 'createdAt'>>) => Promise<boolean>
  deleteRecord: (id: string) => Promise<boolean>
}

const getLocalRecords = (): RecordItem[] => {
  try {
    const local = localStorage.getItem('piklog_records')
    return local ? JSON.parse(local) : []
  } catch {
    return []
  }
}

const saveLocalRecords = (records: RecordItem[]) => {
  try {
    localStorage.setItem('piklog_records', JSON.stringify(records))
  } catch {}
}

export const useRecordsStore = create<RecordsState>((set) => ({
  records: getLocalRecords(),
  loading: false,
  error: null,

  fetchRecords: async () => {
    set({ loading: true, error: null })

    if (!isSupabaseConfigured()) {
      set({ records: getLocalRecords(), loading: false })
      return
    }

    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (data) {
        const mapped: RecordItem[] = data.map(r => ({
          id: r.id,
          personId: r.person_id,
          personNameSnapshot: r.person_name_snapshot || '',
          date: r.date,
          itemType: r.item_type,
          actionType: r.action_type,
          note: r.note || undefined,
          createdAt: r.created_at,
        }))
        saveLocalRecords(mapped)
        set({ records: mapped, loading: false })
      }
    } catch (err: any) {
      set({ records: getLocalRecords(), loading: false, error: err.message })
    }
  },

  addRecord: async (data) => {
    set({ loading: true, error: null })
    const id = crypto.randomUUID()
    const nowIso = new Date().toISOString()

    const newRecord: RecordItem = { id, ...data, createdAt: nowIso }
    const current = getLocalRecords()
    const updated = [newRecord, ...current]
    saveLocalRecords(updated)

    if (!isSupabaseConfigured()) {
      set({ records: updated, loading: false })
      return true
    }

    try {
      const { error } = await supabase.from('records').insert([{
        id,
        person_id: data.personId,
        person_name_snapshot: data.personNameSnapshot,
        date: data.date,
        item_type: data.itemType,
        action_type: data.actionType,
        note: data.note || null,
        created_at: nowIso,
      }])

      if (error) throw error

      set({ records: updated, loading: false })
      return true
    } catch (err: any) {
      set({ records: updated, loading: false, error: `寫入資料庫失敗，已暫存至本地。(${err.message})` })
      return true
    }
  },

  updateRecord: async (id, updates) => {
    set({ loading: true, error: null })
    const current = getLocalRecords()
    const updated = current.map(r => (r.id === id ? { ...r, ...updates } : r))
    saveLocalRecords(updated)

    if (!isSupabaseConfigured()) {
      set({ records: updated, loading: false })
      return true
    }

    try {
      const { error } = await supabase
        .from('records')
        .update({
          person_id: updates.personId,
          person_name_snapshot: updates.personNameSnapshot,
          date: updates.date,
          item_type: updates.itemType,
          action_type: updates.actionType,
          note: updates.note || null,
        })
        .eq('id', id)

      if (error) throw error

      set({ records: updated, loading: false })
      return true
    } catch (err: any) {
      set({ records: updated, loading: false, error: `更新資料庫失敗，已暫存至本地。(${err.message})` })
      return true
    }
  },

  deleteRecord: async (id) => {
    set({ loading: true, error: null })
    const current = getLocalRecords()
    const updated = current.filter(r => r.id !== id)
    saveLocalRecords(updated)

    if (!isSupabaseConfigured()) {
      set({ records: updated, loading: false })
      return true
    }

    try {
      const { error } = await supabase.from('records').delete().eq('id', id)
      if (error) throw error
      set({ records: updated, loading: false })
      return true
    } catch (err: any) {
      set({ records: updated, loading: false, error: err.message })
      return true
    }
  },
}))
