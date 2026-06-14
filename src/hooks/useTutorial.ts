import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'piklog_tutorial_seen'

function getSeen(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function markSeen(pageKey: string) {
  const seen = getSeen()
  seen[pageKey] = true
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seen))
}

export function useTutorial(pageKey: string, totalSteps: number) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // 第一次進頁面自動啟動
  useEffect(() => {
    const seen = getSeen()
    if (!seen[pageKey]) {
      const timer = setTimeout(() => setIsOpen(true), 700)
      return () => clearTimeout(timer)
    }
  }, [pageKey])

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
    setIsComplete(false)
    setIsOpen(true)
  }, [])

  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1)
    } else {
      setIsComplete(true)
    }
  }, [currentStep, totalSteps])

  const skip = useCallback(() => {
    setIsOpen(false)
    setIsComplete(false)
    markSeen(pageKey)
  }, [pageKey])

  const closeComplete = useCallback(() => {
    setIsOpen(false)
    setIsComplete(false)
    markSeen(pageKey)
  }, [pageKey])

  return { isOpen, currentStep, isComplete, startTutorial, next, skip, closeComplete }
}
