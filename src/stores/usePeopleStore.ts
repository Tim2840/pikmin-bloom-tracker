import { create } from 'zustand'
import { Person } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface PeopleState {
  people: Person[]
  loading: boolean
  error: string | null
  fetchPeople: () => Promise<void>
  addPerson: (name: string, nickname?: string, color?: string) => Promise<boolean>
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id' | 'createdAt'>>) => Promise<boolean>
  deletePerson: (id: string) => Promise<boolean>
}

// LocalStorage Helper functions
const getLocalPeople = (): Person[] => {
  try {
    const local = localStorage.getItem('piklog_people')
    return local ? JSON.parse(local) : []
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

export const usePeopleStore = create<PeopleState>((set) => ({
  people: getLocalPeople(),
  loading: false,
  error: null,

  fetchPeople: async () => {
    set({ loading: true, error: null })
    
    // 檢查是否設定了 Supabase
    if (!isSupabaseConfigured()) {
      // 沒設定則直接使用 LocalStorage
      const localPeople = getLocalPeople()
      set({ people: localPeople, loading: false })
      return
    }

    try {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const mappedPeople: Person[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          nickname: p.nickname || undefined,
          color: p.color || undefined,
          createdAt: p.created_at,
        }))
        
        // 成功取得後同步備份到 LocalStorage
        saveLocalPeople(mappedPeople)
        set({ people: mappedPeople, loading: false })
      }
    } catch (err: any) {
      console.error('從 Supabase 讀取人物失敗，改用 LocalStorage:', err)
      const localPeople = getLocalPeople()
      set({ 
        people: localPeople, 
        loading: false,
        error: `Supabase 連線失敗，已自動載入本地資料。(${err.message || err})` 
      })
    }
  },

  addPerson: async (name, nickname, color) => {
    set({ loading: true, error: null })
    const newPersonId = crypto.randomUUID()
    const nowIso = new Date().toISOString()
    
    const localNewPerson: Person = {
      id: newPersonId,
      name,
      nickname: nickname || undefined,
      color: color || '#6B7280',
      createdAt: nowIso,
    }

    // 1. 先寫入 LocalStorage，作為樂觀更新與 fallback
    const currentLocal = getLocalPeople()
    const updatedLocal = [localNewPerson, ...currentLocal]
    saveLocalPeople(updatedLocal)

    if (!isSupabaseConfigured()) {
      // 若無 Supabase 設定，就直接更新 store 並返回成功
      set({ people: updatedLocal, loading: false })
      return true
    }

    try {
      const { data, error } = await supabase
        .from('persons')
        .insert([
          {
            id: newPersonId,
            name,
            nickname: nickname || null,
            color: color || '#6B7280',
            created_at: nowIso
          }
        ])
        .select()

      if (error) throw error

      // 成功寫入 Supabase，更新 UI 狀態
      if (data && data[0]) {
        const addedPerson: Person = {
          id: data[0].id,
          name: data[0].name,
          nickname: data[0].nickname || undefined,
          color: data[0].color || undefined,
          createdAt: data[0].created_at,
        }
        
        // 用資料庫返回的實體資料更新 store (特別是 UUID 與時間戳)
        const filteredLocal = getLocalPeople().filter(p => p.id !== newPersonId)
        const finalPeople = [addedPerson, ...filteredLocal]
        saveLocalPeople(finalPeople)
        set({ people: finalPeople, loading: false })
      }
      return true
    } catch (err: any) {
      console.error('寫入 Supabase 失敗，已保留本地變更:', err)
      // 保留 LocalStorage 的寫入，將 loading 關閉並回報錯誤
      set({ 
        people: updatedLocal, 
        loading: false,
        error: `寫入資料庫失敗，已暫存至本地。(${err.message || err})` 
      })
      return true // 仍回傳 true，因為本地已更新
    }
  },

  updatePerson: async (id, updates) => {
    set({ loading: true, error: null })
    
    // 1. 更新本地 LocalStorage
    const currentLocal = getLocalPeople()
    const updatedLocal = currentLocal.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          name: updates.name !== undefined ? updates.name : p.name,
          nickname: updates.nickname !== undefined ? updates.nickname : p.nickname,
          color: updates.color !== undefined ? updates.color : p.color,
        }
      }
      return p
    })
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
        error: `更新資料庫失敗，已儲存於本地。(${err.message || err})`
      })
      return true
    }
  },

  deletePerson: async (id) => {
    set({ loading: true, error: null })

    // 1. 更新本地 LocalStorage
    const currentLocal = getLocalPeople()
    const updatedLocal = currentLocal.filter((p) => p.id !== id)
    saveLocalPeople(updatedLocal)

    if (!isSupabaseConfigured()) {
      set({ people: updatedLocal, loading: false })
      return true
    }

    try {
      const { error } = await supabase
        .from('persons')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({ people: updatedLocal, loading: false })
      return true
    } catch (err: any) {
      console.error('刪除 Supabase 資料失敗，已自本地移除:', err)
      set({
        people: updatedLocal,
        loading: false,
        error: `資料庫刪除失敗，已自本地移除。(${err.message || err})`
      })
      return true
    }
  }
}))
