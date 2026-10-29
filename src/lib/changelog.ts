// 更新紀錄：使用者在「設定 > 更新紀錄」查閱。最新的放最前面。
// 每次有使用者看得到的改動上線，就在最前面新增一筆（版本號一起往上加）。
// 寫法：白話、簡短、不用括號或註解（介面文字精簡規則）。
export interface ChangelogEntry {
  version: string
  date: string // YYYY-MM-DD
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  { version: '1.12.1', date: '2026-10-29', items: ['首頁的本月足跡縮小，三個數字並排一眼看完'] },
  { version: '1.12.0', date: '2026-10-29', items: ['新增紀錄時可以搜尋好友', '選好友後會收成一列名字，按「更換」可以重選'] },
  { version: '1.11.0', date: '2026-10-29', items: ['更新時會顯示進度條和百分比'] },
  { version: '1.10.0', date: '2026-10-29', items: ['更新完成後，會告訴你這次更新了什麼'] },
  { version: '1.9.0', date: '2026-10-29', items: ['新增更新紀錄，可以隨時查看每次更新了什麼', '換頁時會自動回到最上面'] },
  { version: '1.8.0', date: '2026-10-29', items: ['有新版本時，畫面下方會提醒你，按「更新」就能換上'] },
  { version: '1.7.2', date: '2026-10-28', items: ['App 桌面圖示換成新的小蘑菇'] },
  { version: '1.7.1', date: '2026-10-28', items: ['彈窗開著時，背景不會再跟著滑動', '點彈窗外的空白處就能關閉'] },
  {
    version: '1.7.0',
    date: '2026-10-28',
    items: [
      '全新的蘑菇與明信片圖示',
      '首頁的蘑菇會依互動狀況換表情',
      '記錄成功時有小小的慶祝動畫',
      '記到第 10、50、100 筆等里程碑會灑彩帶',
      '設定頁可以關閉特效',
    ],
  },
  { version: '1.6.0', date: '2026-10-27', items: ['畫面文字更簡潔，拿掉多餘的說明'] },
  {
    version: '1.5.0',
    date: '2026-10-26',
    items: ['好友名單最多可以加到 450 位', '點好友可以看和他的完整往來', '人物管理可以搜尋好友', '統計頁列出很久沒互動的好友'],
  },
  { version: '1.4.1', date: '2026-10-21', items: ['新增紀錄的好友選單只顯示名字'] },
  { version: '1.4.0', date: '2026-10-20', items: ['可以匯出好友名單和互動紀錄', '新增紀錄時用下拉選單選好友'] },
  { version: '1.3.0', date: '2026-10-19', items: ['統計補上對方寄來的明信片和他邀請我打蘑菇'] },
  {
    version: '1.2.0',
    date: '2026-10-18',
    items: ['新增紀錄後留在同一位好友，可以連續記錄', '日期改成年、月、日三個選單', '編輯紀錄時只顯示那位好友'],
  },
  { version: '1.1.1', date: '2026-10-06', items: ['帳號只保留用 Google 繼續'] },
  { version: '1.1.0', date: '2026-10-04', items: ['好友改成選擇國家', '重新整理後好友不會再消失'] },
  { version: '1.0.0', date: '2026-07-08', items: ['快速記錄、好友管理、統計和月曆，可以加到手機桌面使用'] },
]

export const APP_VERSION = CHANGELOG[0].version

const SEEN_KEY = 'piklog_changelog_seen'
const WHATS_NEW_MAX = 3

/** 版本號比較：a 比 b 新回傳正數，一樣回傳 0，比較舊回傳負數 */
export function compareVersions(a: string, b: string): number {
  const [x, y] = [a, b].map(v => v.split('.').map(Number))
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0)
  return 0
}

export function getLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}

/** 這個版本的更新紀錄還沒看過 */
export function hasUnseenChangelog(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) !== APP_VERSION
  } catch {
    return false
  }
}

export function markChangelogSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, APP_VERSION)
  } catch {
    /* 私密模式或容量滿時忽略 */
  }
}

/** 以前用過這個 App（有教學紀錄、好友或互動紀錄）。全新使用者不需要被告知「更新了什麼」 */
export function hasUsedBefore(): boolean {
  try {
    return ['piklog_tutorial_seen', 'piklog_people', 'piklog_records'].some(k => localStorage.getItem(k) !== null)
  } catch {
    return false
  }
}

/** 更新完成後要不要彈出「更新了什麼」：已經看過這版就不彈；全新使用者不彈 */
export function shouldShowWhatsNew(lastSeen: string | null, usedBefore: boolean): boolean {
  if (lastSeen === APP_VERSION) return false
  if (lastSeen === null && !usedBefore) return false
  return true
}

/**
 * 要告訴使用者的更新：上次看到的版本之後的每一筆，最多 3 筆（由新到舊），更早的請使用者到更新紀錄頁看。
 * 不知道上次看到哪一版（舊版使用者）就只給最新一筆。
 */
export function entriesSince(lastSeen: string | null, max = WHATS_NEW_MAX): ChangelogEntry[] {
  if (lastSeen === null) return CHANGELOG.slice(0, 1)
  return CHANGELOG.filter(e => compareVersions(e.version, lastSeen) > 0).slice(0, max)
}
