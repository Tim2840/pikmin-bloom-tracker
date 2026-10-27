// 彈窗開啟時鎖住背景捲動。
// 單用 overflow: hidden 在 iOS Safari 擋不住背景滑動，所以用 position: fixed 把頁面定住，
// 關閉時還原並捲回原本位置。用計數處理多個彈窗疊在一起的情況。
let locks = 0
let saved: { y: number; position: string; top: string; left: string; right: string; overflow: string; paddingRight: string } | null = null

export function lockScroll(): () => void {
  const body = document.body.style
  if (locks === 0) {
    const y = window.scrollY
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    saved = { y, position: body.position, top: body.top, left: body.left, right: body.right, overflow: body.overflow, paddingRight: body.paddingRight }
    body.position = 'fixed'
    body.top = `-${y}px`
    body.left = '0'
    body.right = '0'
    body.overflow = 'hidden'
    if (scrollbar > 0) body.paddingRight = `${scrollbar}px` // 桌機捲軸消失時避免版面跳動
  }
  locks++

  let released = false
  return () => {
    if (released) return
    released = true
    locks--
    if (locks === 0 && saved) {
      const s = saved
      saved = null
      body.position = s.position
      body.top = s.top
      body.left = s.left
      body.right = s.right
      body.overflow = s.overflow
      body.paddingRight = s.paddingRight
      window.scrollTo(0, s.y)
    }
  }
}
