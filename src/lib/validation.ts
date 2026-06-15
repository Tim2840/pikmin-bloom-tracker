import { RecordFormValues } from '../types'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateRecord(values: RecordFormValues): ValidationResult {
  if (!values.personId) return { valid: false, error: '請選擇好友' }
  if (!values.date) return { valid: false, error: '請選擇日期' }
  if (!values.itemType) return { valid: false, error: '請選擇品項' }
  if (!values.actionType) return { valid: false, error: '請選擇動作' }
  return { valid: true }
}
