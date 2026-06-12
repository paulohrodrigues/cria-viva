import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cv_farm_id'

let listeners: Array<(id: string) => void> = []
let currentId = localStorage.getItem(STORAGE_KEY) ?? ''

function subscribe(fn: (id: string) => void) {
  listeners.push(fn)
  return () => { listeners = listeners.filter((l) => l !== fn) }
}

function emit(id: string) {
  listeners.forEach((l) => l(id))
}

export function useCurrentFarm() {
  const [farmId, setLocal] = useState(currentId)

  useEffect(() => subscribe((id) => setLocal(id)), [])

  function setFarm(id: string) {
    currentId = id
    localStorage.setItem(STORAGE_KEY, id)
    emit(id)
  }

  return { farmId, setFarm }
}
