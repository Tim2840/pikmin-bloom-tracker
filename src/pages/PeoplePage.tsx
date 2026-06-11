import { useEffect, useState } from 'react'
import { usePeopleStore } from '../stores/usePeopleStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { UserPlus, Edit2, Trash2, X, Check, AlertTriangle, AlertCircle } from 'lucide-react'

// 預設的高對比亮麗 Pikmin 色系，長輩易點選與辨識
const COLOR_PRESETS = [
  { value: '#EF4444', label: '紅皮敏' },
  { value: '#FBBF24', label: '黃皮敏' },
  { value: '#3B82F6', label: '藍皮敏' },
  { value: '#EC4899', label: '粉皮敏' },
  { value: '#8B5CF6', label: '紫皮敏' },
  { value: '#10B981', label: '綠皮敏' },
  { value: '#F97316', label: '橘皮敏' },
  { value: '#6B7280', label: '灰皮敏' }
]

export default function PeoplePage() {
  const { people, loading, error, fetchPeople, addPerson, updatePerson, deletePerson } = usePeopleStore()

  // 表單狀態
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value)

  // 編輯與刪除狀態
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNickname, setEditNickname] = useState('')
  const [editColor, setEditColor] = useState('')

  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null)

  // 提示訊息
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchPeople()
  }, [fetchPeople])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // 新增處理
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('請輸入名字！', 'error')
      return
    }
    const success = await addPerson(name.trim(), nickname.trim(), selectedColor)
    if (success) {
      setName('')
      setNickname('')
      setSelectedColor(COLOR_PRESETS[0].value)
      showToast(`成功新增好友：${name}`)
    } else {
      showToast('新增失敗', 'error')
    }
  }

  // 開始編輯
  const startEdit = (person: any) => {
    setEditingPersonId(person.id)
    setEditName(person.name)
    setEditNickname(person.nickname || '')
    setEditColor(person.color || COLOR_PRESETS[0].value)
  }

  // 儲存編輯
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      showToast('名字不能為空！', 'error')
      return
    }
    if (!editingPersonId) return

    const success = await updatePerson(editingPersonId, {
      name: editName.trim(),
      nickname: editNickname.trim(),
      color: editColor
    })

    if (success) {
      setEditingPersonId(null)
      showToast('修改成功！')
    } else {
      showToast('修改失敗', 'error')
    }
  }

  // 刪除處理
  const handleDelete = async (id: string, name: string) => {
    const success = await deletePerson(id)
    if (success) {
      setDeletingPersonId(null)
      showToast(`已刪除好友：${name}`)
    } else {
      showToast('刪除失敗', 'error')
    }
  }

  const isDBOnline = isSupabaseConfigured()

  return (
    <div className="pb-12">
      {/* 頂部標題 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-850 tracking-tight flex items-center">
            👥 人物管理
          </h1>
          <p className="text-stone-500 text-sm">新增並設定常用好友名單</p>
        </div>
      </div>

      {/* 離線/本地模式提示橫幅 */}
      {!isDBOnline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start text-amber-800 shadow-sm">
          <AlertTriangle className="w-6 h-6 mr-3 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-base">目前使用「本地儲存模式」</h4>
            <p className="text-sm text-amber-700 mt-1">
              因為尚未填寫 Supabase 連線金鑰，資料目前會存放在此手機/瀏覽器中，離線也能使用！
            </p>
          </div>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start text-rose-800 shadow-sm">
          <AlertCircle className="w-6 h-6 mr-3 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Toast 提示浮窗 */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-base font-bold shadow-lg z-50 flex items-center transition-all animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-lime-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {toastMessage.text}
        </div>
      )}

      {/* 新增人物表單 */}
      <section className="glass-card rounded-3xl p-5 mb-8">
        <h2 className="text-lg font-extrabold text-stone-850 mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-lime-600" />
          建立新人物
        </h2>
        
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1.5">
              好友姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="例如：王小明"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white text-base text-stone-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1.5">
              小名 / 暱稱 <span className="text-stone-400 text-xs font-normal">(選填)</span>
            </label>
            <input
              type="text"
              placeholder="例如：阿明 (顯示於首頁快捷區)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 bg-white text-base text-stone-800"
            />
          </div>

          {/* 色彩選擇器 — 超大按鈕 */}
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-2">
              代表顏色 <span className="text-stone-400 text-xs font-normal">(大按鈕易於點選)</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedColor(preset.value)}
                  className="accessible-target relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200"
                  style={{
                    backgroundColor: `${preset.value}15`, // 透明背景
                    borderColor: selectedColor === preset.value ? preset.value : 'transparent',
                    borderWidth: '2px'
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center text-white"
                    style={{ backgroundColor: preset.value }}
                  >
                    {selectedColor === preset.value && <Check className="w-4 h-4" />}
                  </span>
                  <span 
                    className="text-[11px] mt-1 font-bold"
                    style={{ color: preset.value }}
                  >
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-4 bg-lime-600 hover:bg-lime-700 active:scale-98 text-white font-extrabold text-base rounded-2xl transition-all shadow-md shadow-lime-600/20 flex items-center justify-center"
          >
            建立新人物
          </button>
        </form>
      </section>

      {/* 人物名冊清單 */}
      <section>
        <h2 className="text-lg font-extrabold text-stone-850 mb-4">
          👥 好友名冊 ({people.length} 人)
        </h2>

        {loading && people.length === 0 ? (
          // 骨架屏載入中
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-stone-200/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : people.length === 0 ? (
          // 空狀態
          <div className="glass-card rounded-3xl p-8 text-center text-stone-500">
            <span className="text-4xl block mb-2">👋</span>
            <p className="font-bold text-stone-700">目前名冊空空的喔！</p>
            <p className="text-xs text-stone-400 mt-1">請使用上方表單新增第一位好友吧！</p>
          </div>
        ) : (
          // 名單渲染
          <div className="space-y-3">
            {people.map((person) => (
              <div
                key={person.id}
                className="glass-card rounded-2xl p-4 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  {/* 大彩色頭像 */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                    style={{ backgroundColor: person.color || '#6B7280' }}
                  >
                    {(person.nickname || person.name).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-stone-800 leading-tight">
                      {person.name}
                    </h3>
                    {person.nickname && (
                      <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                        暱稱：{person.nickname}
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作按鈕（大尺寸防誤觸） */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(person)}
                    className="accessible-target flex items-center justify-center p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    title="編輯"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeletingPersonId(person.id)}
                    className="accessible-target flex items-center justify-center p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="刪除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 編輯 Dialog 彈窗 */}
      {editingPersonId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl border border-stone-100 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-stone-850">✏️ 編輯好友資料</h3>
              <button 
                onClick={() => setEditingPersonId(null)}
                className="accessible-target flex items-center justify-center text-stone-400 hover:text-stone-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1">好友姓名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1">小名 / 暱稱</label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-lime-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">代表顏色</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setEditColor(preset.value)}
                      className="accessible-target relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200"
                      style={{
                        backgroundColor: `${preset.value}15`,
                        borderColor: editColor === preset.value ? preset.value : 'transparent',
                        borderWidth: '2px'
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full shadow-inner flex items-center justify-center text-white"
                        style={{ backgroundColor: preset.value }}
                      >
                        {editColor === preset.value && <Check className="w-3 h-3" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingPersonId(null)}
                  className="flex-1 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 h-12 rounded-xl bg-lime-600 text-white font-extrabold hover:bg-lime-700 transition-colors shadow-sm"
                >
                  儲存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 Dialog 彈窗 (長輩防誤觸) */}
      {deletingPersonId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl border border-stone-100 text-center animate-scale-up">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-stone-850 mb-2">確定要刪除嗎？</h3>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              您確定要將好友 <strong className="text-rose-600 text-base">{
                people.find(p => p.id === deletingPersonId)?.name
              }</strong> 自名冊中移除嗎？<br />
              所有與他相關的互動紀錄也將一併被刪除，此動作將無法復原！
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setDeletingPersonId(null)}
                className="flex-1 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = people.find(p => p.id === deletingPersonId)
                  if (target) handleDelete(target.id, target.name)
                }}
                className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition-colors shadow-sm"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
