import { useCallback, useState } from 'react'

export type ClusterAccent = 'amber' | 'green'

const STORAGE_KEY = 'car-hub-accent'

function readStoredAccent(): ClusterAccent {
  return localStorage.getItem(STORAGE_KEY) === 'green' ? 'green' : 'amber'
}

export function useAccent() {
  const [accent, setAccent] = useState<ClusterAccent>(readStoredAccent)

  const toggleAccent = useCallback(() => {
    setAccent((current) => {
      const next: ClusterAccent = current === 'amber' ? 'green' : 'amber'
      document.documentElement.dataset.accent = next
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { accent, toggleAccent }
}
