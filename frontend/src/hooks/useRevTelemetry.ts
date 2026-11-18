import { useCallback, useEffect, useRef, useState } from 'react'

export function useRevTelemetry() {
  const [revBoost, setRevBoost] = useState(0)
  const [authError, setAuthError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const decayTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (decayTimer.current !== undefined) {
        window.clearTimeout(decayTimer.current)
      }
    }
  }, [])

  const pulseRev = useCallback(() => {
    setAuthError(false)
    setErrorMessage(null)
    setRevBoost((prev) => Math.min(14, prev + 2))

    if (decayTimer.current !== undefined) {
      window.clearTimeout(decayTimer.current)
    }

    decayTimer.current = window.setTimeout(() => {
      setRevBoost(0)
    }, 650)
  }, [])

  const triggerError = useCallback((message?: string) => {
    setRevBoost(0)
    setAuthError(true)
    if (typeof message === 'string') {
      setErrorMessage(message)
    }
  }, [])

  return { revBoost, authError, errorMessage, pulseRev, triggerError }
}
