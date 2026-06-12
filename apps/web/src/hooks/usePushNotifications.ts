import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const STORAGE_KEY = 'push_subscribed'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )
  const [subscribed, setSubscribed] = useState(() => !!localStorage.getItem(STORAGE_KEY))

  const supported = 'serviceWorker' in navigator && 'PushManager' in window

  async function subscribe() {
    if (!supported) return

    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const { data } = await api.get('/push/vapid-key')
      const appServerKey = urlBase64ToUint8Array(data.publicKey)

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      })

      const json = sub.toJSON()
      await api.post('/push/subscribe', {
        endpoint: json.endpoint,
        keys: json.keys,
      })

      localStorage.setItem(STORAGE_KEY, '1')
      setSubscribed(true)
    } catch (err) {
      console.error('Push subscribe failed:', err)
    }
  }

  async function unsubscribe() {
    if (!supported) return

    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      const sub = await reg?.pushManager.getSubscription()

      if (sub) {
        await api.delete('/push/subscribe', { data: { endpoint: sub.endpoint } })
        await sub.unsubscribe()
      }

      localStorage.removeItem(STORAGE_KEY)
      setSubscribed(false)
    } catch (err) {
      console.error('Push unsubscribe failed:', err)
    }
  }

  // Auto-register SW on mount (does not request permission)
  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [supported])

  return { supported, permission, subscribed, subscribe, unsubscribe }
}
