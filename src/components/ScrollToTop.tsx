import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 換頁時捲回頂端；否則從長頁面下方點進新頁，會停在新頁的中段
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
