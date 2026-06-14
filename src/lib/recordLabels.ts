import { ItemType, ActionType } from '../types'

// 品項基本資訊（emoji + 名稱）
export const ITEM_META: Record<ItemType, { emoji: string; label: string }> = {
  postcard: { emoji: '📮', label: '明信片' },
  mushroom: { emoji: '🍄', label: '蘑菇' },
}

// 新增紀錄時可選的方向：兩種品項都用「往外 / 往內」雙向
// （helped 為舊資料相容值，不再提供新增）
export const DIRECTIONS: ActionType[] = ['sent', 'received']

// 表單按鈕用的短標籤（品項已在上方選擇，不重複品項名）
export function actionButtonLabel(itemType: ItemType, actionType: ActionType): string {
  if (itemType === 'mushroom') {
    if (actionType === 'received') return '← 他邀請我'
    if (actionType === 'helped') return '協助打'
    return '→ 我邀請他'
  }
  // postcard
  if (actionType === 'received') return '← 對方寄來'
  return '→ 寄給對方'
}

// 列表 / 摘要用的完整語句（含品項脈絡）
export function actionFullLabel(itemType: ItemType, actionType: ActionType): string {
  if (itemType === 'mushroom') {
    if (actionType === 'received') return '← 他邀請我打蘑菇'
    if (actionType === 'helped') return '協助打蘑菇'
    return '→ 我邀請他打蘑菇'
  }
  if (actionType === 'received') return '← 對方寄來明信片'
  return '→ 寄給對方明信片'
}

// 快捷動作按鈕的自動標籤（口語化）
export function buildQuickActionLabel(personName: string, itemType: ItemType, actionType: ActionType): string {
  if (itemType === 'mushroom') {
    return actionType === 'received' ? `${personName} 邀我打蘑菇` : `邀 ${personName} 打蘑菇`
  }
  return actionType === 'received' ? `${personName} 寄明信片來` : `寄明信片給 ${personName}`
}

// pill 背景配色（依方向）
export const ACTION_STYLE: Record<string, string> = {
  sent: 'bg-amber-50 text-amber-700',
  received: 'bg-lime-50 text-lime-700',
  helped: 'bg-violet-50 text-violet-700',
}
