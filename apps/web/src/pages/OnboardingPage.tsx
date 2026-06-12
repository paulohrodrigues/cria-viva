import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCreateFarm } from '../hooks/useFarm'
import { useCurrentFarm } from '../store/currentFarm'
import toast from 'react-hot-toast'

const ESTADOS_BR = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

interface FormData {
  nome: string
  cidade: string
  estado: string
  tipo: string
}

export function OnboardingPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { tipo: 'CORTE' },
  })
  const createFarm = useCreateFarm()
  const { setFarm } = useCurrentFarm()
  const navigate = useNavigate()

  async function onSubmit(data: FormData) {
    try {
      const farm = await createFarm.mutateAsync(data)
      setFarm(farm.id)
      toast.success('Fazenda criada! Vamos começar.')
      navigate('/dashboard')
    } catch {
      toast.error('Erro ao criar fazenda')
    }
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏡</div>
          <h1 className="text-xl font-bold text-gray-900">Cadastre sua fazenda</h1>
          <p className="text-sm text-gray-500 mt-1">Você pode alterar isso depois</p>
        </div>

        <div className="card shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nome da fazenda *</label>
              <input
                {...register('nome', { required: true })}
                placeholder="Ex: Fazenda Boa Esperança"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cidade</label>
                <input {...register('cidade')} placeholder="Uberaba" className="input" />
              </div>
              <div>
                <label className="label">Estado</label>
                <select {...register('estado')} className="input">
                  <option value="">--</option>
                  {ESTADOS_BR.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Tipo de pecuária</label>
              <select {...register('tipo')} className="input">
                <option value="CORTE">Corte</option>
                <option value="LEITE">Leite</option>
                <option value="MISTO">Misto</option>
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Criando...' : 'Criar fazenda e começar →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
