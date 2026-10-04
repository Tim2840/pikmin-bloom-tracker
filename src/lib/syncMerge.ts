// 雲端與本機資料合併：以 id 聯集，同 id 以雲端為準。
// 本機有、雲端沒有的（例如斷線期間或寫入失敗的）會回傳 localOnly，供呼叫端補傳。
// 絕不以雲端結果直接覆蓋本機，避免寫入失敗時資料被清空。
export function mergeWithLocal<T extends { id: string }>(
  cloud: T[],
  local: T[],
): { merged: T[]; localOnly: T[] } {
  const cloudIds = new Set(cloud.map(c => c.id))
  const localOnly = local.filter(l => !cloudIds.has(l.id))
  return { merged: [...cloud, ...localOnly], localOnly }
}
