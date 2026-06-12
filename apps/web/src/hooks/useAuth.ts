import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  nome: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cv_usuario')
    const token = localStorage.getItem('cv_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  async function login(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('cv_token', data.token)
    localStorage.setItem('cv_usuario', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  async function register(nome: string, email: string, senha: string) {
    const { data } = await api.post('/auth/register', { nome, email, senha })
    localStorage.setItem('cv_token', data.token)
    localStorage.setItem('cv_usuario', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  async function updateProfile(nome: string) {
    const { data } = await api.patch('/auth/me', { nome })
    const updated = { ...user!, ...data }
    localStorage.setItem('cv_usuario', JSON.stringify(updated))
    setUser(updated)
    return data
  }

  function logout() {
    localStorage.removeItem('cv_token')
    localStorage.removeItem('cv_usuario')
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, login, register, logout, updateProfile }
}
