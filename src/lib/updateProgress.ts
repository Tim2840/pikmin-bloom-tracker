// 更新進度條的進度計算。
// 新版其實在背景就下載完了（畫面出現「有新版本」時已完成），按下「更新」後只剩切換與重新載入，
// 本身只要不到一秒。所以進度是「更新動作」的進度：真正切換完成前最多跑到 90%，完成後衝到 100%，
// 並且至少顯示 MIN_UPDATE_MS，讓使用者看得到正在更新，而不是畫面突然一閃。
export const MIN_UPDATE_MS = 1200
/** 新版遲遲沒有接管時的上限，到了就直接重新載入，避免卡在進度畫面 */
export const GIVE_UP_MS = 6000
const HOLD_AT = 90

/** 是否可以衝到 100%：新版已接管且已顯示足夠久，或等太久放棄等待 */
export const isUpdateFinished = (controlled: boolean, elapsedMs: number): boolean =>
  (controlled && elapsedMs >= MIN_UPDATE_MS) || elapsedMs >= GIVE_UP_MS

/** 每隔一小段時間（約 50 毫秒）呼叫一次，回傳下一個進度，範圍 0 到 100，只增不減 */
export function nextProgress(current: number, finished: boolean): number {
  const target = finished ? 100 : HOLD_AT
  const step = Math.max(finished ? 4 : 0.5, (target - current) * (finished ? 0.35 : 0.04))
  return Math.min(target, Math.max(current, current + step))
}
