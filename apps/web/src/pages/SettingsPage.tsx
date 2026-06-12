import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LogOut, User, Bell, BellOff, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePushNotifications } from '../hooks/usePushNotifications'
import toast from 'react-hot-toast'

interface ProfileForm {
  name: string
}

export function SettingsPage() {
  const { user, logout, updateProfile } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { supported, permission, subscribed, subscribe, unsubscribe } = usePushNotifications()

  async function handleNotificationToggle() {
    if (subscribed) {
      await unsubscribe()
      toast.success('Notificações desativadas')
    } else {
      await subscribe()
      if (Notification.permission === 'denied') {
        toast.error('Permissão de notificação bloqueada. Habilite nas configurações do navegador.')
      } else if (Notification.permission === 'granted') {
        toast.success('Notificações ativadas!')
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">Configurações</h1>

      <div className="card">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.07]">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="pt-4 space-y-1">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <User size={18} className="text-slate-500" />
            <span className="text-sm font-medium">Editar perfil</span>
          </button>

          {supported && (
            <button
              onClick={handleNotificationToggle}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {subscribed ? (
                  <Bell size={18} className="text-brand-400" />
                ) : (
                  <BellOff size={18} className="text-slate-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Notificações de parto</p>
                  <p className="text-xs text-slate-600">
                    {permission === 'denied'
                      ? 'Bloqueado pelo navegador'
                      : subscribed
                      ? 'Ativado neste dispositivo'
                      : 'Receba alertas de pré-parto'}
                  </p>
                </div>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${subscribed ? 'bg-brand-500' : 'bg-white/10'} relative`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${subscribed ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left text-red-500"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>

      {showProfileModal && (
        <EditProfileModal
          user={user!}
          onSave={updateProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  )
}

function EditProfileModal({
  user,
  onSave,
  onClose,
}: {
  user: { name: string }
  onSave: (name: string) => Promise<any>
  onClose: () => void
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    defaultValues: { name: user.name },
  })

  async function onSubmit(data: ProfileForm) {
    try {
      await onSave(data.name)
      toast.success('Perfil atualizado!')
      onClose()
    } catch {
      toast.error('Erro ao atualizar perfil')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#111827] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
          <h2 className="font-semibold">Editar perfil</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div>
            <label className="label">Nome *</label>
            <input {...register('name', { required: true })} className="input" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
