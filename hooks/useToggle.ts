import { useState, useCallback } from 'react'

export const useToggle = (initial = false) => {
  const [on, setOn] = useState<boolean>(initial)
  const toggle = useCallback(() => setOn(o => !o), [])
  const set = useCallback((v: boolean) => setOn(v), [])
  return { on, toggle, set }
}
