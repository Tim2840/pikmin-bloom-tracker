// PikLog 自製圖示（A 貼紙風）：原創的小蘑菇、明信片、小芽、愛心、星星。
// 全部由程式畫成 SVG 字串：React 元件（PikIcon）與特效粒子（effects.ts）共用同一組造型。
import { ItemType } from '../types'

export type PikIconName = 'mushroom' | 'mail' | 'sprout' | 'heart' | 'star'
export type PikMood = 'happy' | 'normal' | 'sleepy'

const C = {
  stroke: '#4a3426', sw: 2.6, cap: '#ef5b4a', spot: '#ffffff', stem: '#fff1d1', cheek: '#ff9aa2', eye: '#4a3426',
  leaf: '#6fbf3f', body: '#bfe58a', env: '#fff8e6', flap: '#ffe7a3', heart: '#ef5b4a', star: '#ffc83d', stamp: '#7ac74f',
}
const LINE = `stroke="${C.stroke}" stroke-width="${C.sw}" stroke-linejoin="round" stroke-linecap="round"`
const svg = (inner: string) =>
  `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" focusable="false">${inner}</svg>`
// 貼紙白邊
const under = (shapes: string) =>
  `<g fill="#fff" stroke="#fff" stroke-width="9" stroke-linejoin="round">${shapes}</g>`
const shine = (d: string) =>
  `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`

function face(mood: PikMood, y: number): string {
  let f: string
  if (mood === 'happy') {
    f = `<path d="M23.5 ${y} q2.5 -3.4 5 0 M35.5 ${y} q2.5 -3.4 5 0" fill="none" stroke="${C.eye}" stroke-width="2" stroke-linecap="round"/><path d="M28 ${y + 4} q4 5 8 0 z" fill="${C.eye}"/>`
  } else if (mood === 'sleepy') {
    f = `<path d="M23.5 ${y} h5 M35.5 ${y} h5" stroke="${C.eye}" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="${y + 5}" r="1.8" fill="${C.eye}"/>`
  } else {
    f = `<circle cx="26" cy="${y}" r="1.9" fill="${C.eye}"/><circle cx="38" cy="${y}" r="1.9" fill="${C.eye}"/><path d="M29.5 ${y + 4} q2.5 2.6 5 0" fill="none" stroke="${C.eye}" stroke-width="1.8" stroke-linecap="round"/>`
  }
  return `${f}<circle cx="22" cy="${y + 3}" r="2.6" fill="${C.cheek}" opacity=".6"/><circle cx="42" cy="${y + 3}" r="2.6" fill="${C.cheek}" opacity=".6"/>`
}

function mushroom(mood: PikMood): string {
  // 傘蓋：頂部圓弧，下緣兩端也是圓角
  const capD = 'M6 34 C6 17 18 6 32 6 C46 6 58 17 58 34 C58 38.5 55 41 51 41 L13 41 C9 41 6 38.5 6 34 Z'
  const stem = 'x="20" y="35" width="24" height="25" rx="11"'
  let out = under(`<path d="${capD}"/><rect ${stem}/>`)
  out += `<rect ${stem} fill="${C.stem}" ${LINE}/>`
  out += '<ellipse cx="32" cy="43" rx="12.5" ry="2.8" fill="#000" opacity=".10"/>'
  out += `<path d="${capD}" fill="${C.cap}" ${LINE}/>`
  out += '<path d="M8.5 36 C9.5 38.6 11 39.6 13.5 39.6 L50.5 39.6 C53 39.6 54.5 38.6 55.5 36 C46 38 18 38 8.5 36 Z" fill="#000" opacity=".09"/>'
  out += `<ellipse cx="19" cy="24" rx="4.4" ry="4" fill="${C.spot}"/><ellipse cx="33.5" cy="15.5" rx="3.5" ry="3.2" fill="${C.spot}"/><ellipse cx="46.5" cy="25" rx="4.8" ry="4.2" fill="${C.spot}"/><circle cx="29" cy="31" r="2.3" fill="${C.spot}"/><circle cx="40" cy="33" r="1.8" fill="${C.spot}"/>`
  out += shine('M12 25 C13 18 19 12.5 26 11')
  out += face(mood, 48)
  if (mood === 'sleepy') {
    out += '<text x="47" y="14" font-size="11" font-weight="900" fill="#7a8fd6">z</text><text x="54" y="8" font-size="8" font-weight="900" fill="#7a8fd6">z</text>'
  }
  return out
}

function mail(): string {
  const body = '<rect x="6" y="14" width="52" height="38" rx="8"'
  const flapD = 'M6 22 C6 17.5 9.5 14 14 14 L50 14 C54.5 14 58 17.5 58 22 C58 22 46 37 32 37 C18 37 6 22 6 22 Z'
  let out = under(`${body}/>`) + `${body} fill="${C.env}" ${LINE}/>`
  out += `<path d="M12 45 H25 M12 49.5 H21" stroke="${C.stroke}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`
  out += `<rect x="42" y="39" width="10" height="9" rx="2.2" fill="${C.stamp}" stroke="${C.stroke}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="47" cy="43.5" r="2" fill="#fff" opacity=".85"/>`
  out += `<path d="${flapD}" fill="${C.flap}" ${LINE}/>`
  out += `<path d="M32 44 C25 39 26 32.5 29.5 32.5 C31 32.5 32 33.7 32 34.7 C32 33.7 33 32.5 34.5 32.5 C38 32.5 39 39 32 44Z" fill="${C.heart}" stroke="${C.stroke}" stroke-width="1.8" stroke-linejoin="round"/>`
  return out
}

function sprout(mood: PikMood): string {
  const leafL = 'M32 32 C21 33 15 25 18 15 C28 13 36 21 32 32 Z'
  const leafR = 'M32 32 C43 33 49 25 46 15 C36 13 28 21 32 32 Z'
  const body = '<ellipse cx="32" cy="45" rx="18" ry="15.5"'
  let out = under(`${body}/><path d="${leafL}"/><path d="${leafR}"/>`)
  out += `<path d="${leafL}" fill="${C.leaf}" ${LINE}/><path d="${leafR}" fill="${C.leaf}" ${LINE}/>`
  out += '<path d="M30 28 C26.5 24.5 23.5 20.5 21.5 17.5 M34 28 C37.5 24.5 40.5 20.5 42.5 17.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>'
  out += `${body} fill="${C.body}" ${LINE}/>`
  out += '<ellipse cx="22.5" cy="38.5" rx="4.2" ry="2.4" fill="#fff" opacity=".45" transform="rotate(-30 22.5 38.5)"/>'
  out += face(mood, 46)
  return out
}

function heart(): string {
  const p = 'M32 55 C9 39 12 16 26 16 C30 16 32 19 32 22 C32 19 34 16 38 16 C52 16 55 39 32 55Z'
  return under(`<path d="${p}"/>`) + `<path d="${p}" fill="${C.heart}" ${LINE}/>` + shine('M18 26 C18 22 21 20 24 20')
}

function star(): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 12.5 : 23
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(32 + r * Math.cos(a)).toFixed(1)},${(33.5 + r * Math.sin(a)).toFixed(1)}`)
  }
  const poly = `<polygon points="${pts.join(' ')}"`
  return under(`${poly}/>`) + `${poly} fill="${C.star}" ${LINE}/>`
}

export function pikIcon(name: PikIconName, mood: PikMood = 'happy'): string {
  switch (name) {
    case 'mushroom': return svg(mushroom(mood))
    case 'mail': return svg(mail())
    case 'sprout': return svg(sprout(mood))
    case 'heart': return svg(heart())
    case 'star': return svg(star())
  }
}

/** 品項對應的圖示：明信片 = 信封，蘑菇 = 小蘑菇 */
export const ITEM_ICON: Record<ItemType, PikIconName> = { postcard: 'mail', mushroom: 'mushroom' }
