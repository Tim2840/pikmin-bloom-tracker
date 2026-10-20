// 匯出好友名單與互動紀錄為 CSV（UTF-8 含 BOM，Excel / Google 試算表可直接開啟中文）
import { Person, RecordItem } from '../types'
import { ITEM_META, actionFullLabel } from './recordLabels'
import { countryName } from './countries'
import { resolvePersonName } from '../services/recordService'

// 欄位跳脫；開頭為 = + - @ 的文字加單引號，避免在試算表中被當成公式執行
export function csvEscape(value: string | number | undefined | null): string {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const toCsv = (rows: (string | number | undefined | null)[][]): string =>
  '﻿' + rows.map(row => row.map(csvEscape).join(',')).join('\r\n') + '\r\n'

export function buildPeopleCsv(people: Person[]): string {
  const sorted = [...people].sort((a, b) => a.sortOrder - b.sortOrder)
  return toCsv([
    ['姓名', '暱稱', '國家', '建立日期'],
    ...sorted.map(p => [p.name, p.nickname, countryName(p.country), p.createdAt?.slice(0, 10)]),
  ])
}

export function buildRecordsCsv(records: RecordItem[], people: Person[]): string {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  return toCsv([
    ['日期', '好友', '品項', '方向', '備註'],
    ...sorted.map(r => [
      r.date,
      resolvePersonName(r, people),
      ITEM_META[r.itemType].label,
      actionFullLabel(r.itemType, r.actionType),
      r.note,
    ]),
  ])
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
