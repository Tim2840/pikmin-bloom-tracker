import { create } from 'zustand'
import { RecordItem } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getSessionUserId } from '../lib/auth'
import { mergeWithLocal } from '../lib/syncMerge'

interface RecordsState {
  records: RecordItem[]
  loading: boolean
  error: string | null
  fetchRecords: () => Promise<void>
  addRecord: (data: Omit<RecordItem, 'id' | 'createdAt'>) => Promise<boolean>
  updateRecord: (id: string, updates: Partial<Omit<RecordItem, 'id' | 'createdAt'>>) => Promise<boolean>
  deleteRecord: (id: string) => Promise<boolean>
}

const LOCAL_KEY = 'piklog_records'

const getLocalRecords = (): RecordItem[] => {
  try {
    const local = localStorage.getItem(LOCAL_KEY)
    return local ? JSON.parse(local) : []
  } catch {
    return []
  }
}

const saveLocalRecords = (records: RecordItem[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(records))
  } catch {}
}

// 首次啟用 auth 時，把本地資料 upsert 到 Supabase（只跑一次）
async function migrateLocalToCloud(userId: string, localRecords: RecordItem[]): Promise<void> {
  if (!localRecords.length) return

  const rows = localRecords.map(r => ({
    id: r.id,
    user_id: userId,
    person_id: r.personId,
    person_name_snapshot: r.personNameSnapshot,
    date: r.date,
    item_type: r.itemType,
    action_type: r.actionType,
    note: r.note || null,
    created_at: r.createdAt,
  }))

  const { error } = await supabase
    .from('records')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

  if (error) console.error('本機紀錄補傳雲端失敗:', error)
}

const mapRow = (r: any): RecordItem => ({
  id: r.id,
  personId: r.person_id,
  personNameSnapshot: r.person_name_snapshot || '',
  date: r.date,
  itemType: r.item_type,
  actionType: r.action_type,
  note: r.note || undefined,
  createdAt: r.created_at,
})

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
      const userId = await getSessionUserId()

      // 有 userId 時按 user_id 篩選；遷移舊資料（無 user_id）
      let query = supabase
        .from('records')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200)

      if (userId) query = query.eq('user_id', userId)

      const { data, error } = await query
      if (error) throw error

      if (data) {
        // 與本機合併（不覆蓋）；本機獨有的補傳雲端
        const { merged, localOnly } = mergeWithLocal(data.map(mapRow), getLocalRecords())
        if (userId && localOnly.length) await migrateLocalToCloud(userId, localOnly)

        const finalRecords = merged.sort((a, b) =>
          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
        saveLocalRecords(finalRecords)
        set({ records: finalRecords, loading: false })
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
      const userId = await getSessionUserId()
      const { error } = await supabase.from('records').insert([{
        id,
        user_id: userId,
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
