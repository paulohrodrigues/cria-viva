import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cv_user')
    const token = localStorage.getItem('cv_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('cv_token', data.token)
    localStorage.setItem('cv_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('cv_token', data.token)
    localStorage.setItem('cv_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  async function updateProfile(name: string) {
    const { data } = await api.patch('/auth/me', { name })
    const updated = { ...user!, ...data }
    localStorage.setItem('cv_user', JSON.stringify(updated))
    setUser(updated)
    return data
  }

  function logout() {
    localStorage.removeItem('cv_token')
    localStorage.removeItem('cv_user')
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, login, register, logout, updateProfile }
}
