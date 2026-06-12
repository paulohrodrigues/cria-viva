import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface FormData {
  name: string
  email: string
  password: string
}

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    try {
      await registerUser(data.name, data.email, data.password)
      navigate('/onboarding')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao criar conta')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-2xl mx-auto mb-3">🐄</div>
          <h1 className="text-2xl font-bold text-white">CriaViva</h1>
          <p className="text-sm text-slate-500 mt-1">Crie sua conta gratuita</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nome *</label>
              <input
                {...register('name', { required: 'Informe seu nome' })}
                placeholder="João Silva"
                className="input"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                {...register('email', { required: 'Informe o email' })}
                placeholder="seu@email.com"
                className="input"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Senha *</label>
              <input
                type="password"
                {...register('password', { required: true, minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                placeholder="Mínimo 8 caracteres"
                className="input"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand-400 font-medium hover:text-brand-300">Entrar</Link>
        </p>
        <p className="text-center text-xs text-slate-700 mt-3">
          <Link to="/" className="hover:text-slate-500 transition-colors">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
