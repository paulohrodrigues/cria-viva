import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface FormData {
  email: string
  senha: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.senha)
      navigate('/dashboard')
    } catch {
      toast.error('Email ou senha incorretos')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-2xl mx-auto mb-3">🐄</div>
          <h1 className="text-2xl font-bold text-white">CriaViva</h1>
          <p className="text-sm text-slate-500 mt-1">Nunca perca um parto</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Informe o email' })}
                placeholder="seu@email.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                {...register('senha', { required: 'Informe a senha' })}
                placeholder="••••••••"
                className="input"
                autoComplete="current-password"
              />
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-center mt-2">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-4">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-brand-400 font-medium hover:text-brand-300">
            Criar conta grátis
          </Link>
        </p>
        <p className="text-center text-xs text-slate-700 mt-3">
          <Link to="/" className="hover:text-slate-500 transition-colors">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
