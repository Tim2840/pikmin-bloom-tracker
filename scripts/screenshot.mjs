// UI 自動截圖：用 vite preview 起本機站台，puppeteer-core + @sparticuz/chromium
// （瀏覽器以 npm 套件形式提供，不需外部 CDN）截各頁、各尺寸的畫面到 screenshots/。
//
// 用法：
//   npm run screenshot:setup   # 一次性（每個新容器）安裝截圖用瀏覽器，--no-save 不動 lockfile
//   npm run screenshot         # 重新 build 並截圖
import { preview } from 'vite'
import { mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'screenshots')

let puppeteer, chromium
try {
  puppeteer = (await import('puppeteer-core')).default
  chromium = (await import('@sparticuz/chromium')).default
} catch {
  console.error('\n[screenshot] 缺少截圖用瀏覽器，請先執行：npm run screenshot:setup\n')
  process.exit(1)
}

const ROUTES = [
  ['home', ''],
  ['people', 'people'],
  ['quick-actions', 'people/quick-actions'],
  ['records', 'records'],
  ['calendar', 'calendar'],
  ['stats', 'stats'],
  ['settings', 'settings'],
]

const VIEWS = [
  { name: 'mobile', width: 390, height: 844, dsf: 2, isMobile: true },
  { name: 'desktop', width: 1280, height: 900, dsf: 1, isMobile: false },
]

// 在頁面載入前種入示範資料 + 標記教學已看過（避免自動彈出教學遮罩）
function seedLocalStorage() {
  const now = new Date().toISOString()
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d) }
  const people = [
    { id: 'p1', name: '小美', color: 'red', sortOrder: 0, createdAt: now },
    { id: 'p2', name: '阿明', color: 'blue', sortOrder: 1, createdAt: now },
    { id: 'p3', name: '奶奶', color: 'orange', sortOrder: 2, createdAt: now },
  ]
  const rec = (id, pid, name, date, itemType, actionType) =>
    ({ id, personId: pid, personNameSnapshot: name, date, itemType, actionType, createdAt: now })
  const records = [
    rec('r1', 'p1', '小美', ymd(new Date()), 'postcard', 'sent'),
    rec('r2', 'p2', '阿明', ymd(new Date()), 'mushroom', 'received'),
    rec('r3', 'p1', '小美', ago(1), 'mushroom', 'sent'),
    rec('r4', 'p3', '奶奶', ago(2), 'postcard', 'received'),
    rec('r5', 'p2', '阿明', ago(5), 'postcard', 'sent'),
  ]
  const quickActions = [
    { id: 'q1', label: '小美 寄明信片', personId: 'p1', itemType: 'postcard', actionType: 'sent', useToday: true, sortOrder: 0, createdAt: now },
    { id: 'q2', label: '幫阿明打蘑菇', personId: 'p2', itemType: 'mushroom', actionType: 'sent', useToday: true, sortOrder: 1, createdAt: now },
  ]
  localStorage.setItem('piklog_people', JSON.stringify(people))
  localStorage.setItem('piklog_records', JSON.stringify(records))
  localStorage.setItem('piklog_quick_actions', JSON.stringify(quickActions))
  localStorage.setItem('piklog_tutorial_seen', JSON.stringify({
    home: true, people: true, quickActions: true, records: true, calendar: true, stats: true,
  }))
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const server = await preview({ preview: { port: 4188, strictPort: true } })
const base = server.resolvedUrls.local[0].replace(/\/$/, '')
console.log('[screenshot] preview:', base)

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
})

try {
  for (const v of VIEWS) {
    const page = await browser.newPage()
    await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: v.dsf, isMobile: v.isMobile, hasTouch: v.isMobile })
    await page.evaluateOnNewDocument(seedLocalStorage)
    for (const [name, route] of ROUTES) {
      const url = route ? `${base}/${route}` : `${base}/`
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 500)) // 等動畫穩定
      await page.screenshot({ path: join(OUT, `${v.name}-${name}.png`), fullPage: true })
      console.log('  ✓', `${v.name}-${name}.png`)
    }
    await page.close()
  }
} finally {
  await browser.close()
  await server.close()
}

console.log('\n[screenshot] 完成 →', OUT)
