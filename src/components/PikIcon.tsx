import { ItemType } from '../types'
import { ITEM_ICON, PikIconName, PikMood, pikIcon } from '../lib/pikIcons'

interface Props {
  name: PikIconName
  mood?: PikMood
  /** 以 Tailwind 控制大小，例如 "w-8 h-8" */
  className?: string
}

// 圖示內容是程式內建的固定 SVG，不含任何使用者輸入
export default function PikIcon({ name, mood, className = 'w-8 h-8' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: pikIcon(name, mood) }}
    />
  )
}

export function ItemIcon({ type, className }: { type: ItemType; className?: string }) {
  return <PikIcon name={ITEM_ICON[type]} className={className} />
}
