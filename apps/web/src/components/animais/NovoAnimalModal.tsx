import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateAnimal } from '../../hooks/useAnimals'
import { BOVINE_BREEDS } from '@cria-viva/shared'
import toast from 'react-hot-toast'

interface Props {
  fazendaId: string
  onClose: () => void
}

interface FormData {
  brinco: string
  nome: string
  raca: string
  nascimento: string
  pesoKg: string
}

export function NovoAnimalModal({ fazendaId, onClose }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const createAnimal = useCreateAnimal(fazendaId)

  async function onSubmit(data: FormData) {
    try {
      await createAnimal.mutateAsync({
        brinco: data.brinco,
        nome: data.nome || undefined,
        raca: data.raca || undefined,
        nascimento: data.nascimento || undefined,
        pesoKg: data.pesoKg ? parseFloat(data.pesoKg) : undefined,
      })
      toast.success('Animal cadastrado!')
      onClose()
    } catch {
      toast.error('Erro ao cadastrar animal')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#111827] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
          <h2 className="font-semibold">Novo animal</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div>
            <label className="label">Brinco / ID *</label>
            <input
              {...register('brinco', { required: 'Campo obrigatório' })}
              placeholder="Ex: 1234 ou BR001"
              className="input"
            />
            {errors.brinco && <p className="text-xs text-red-500 mt-1">{errors.brinco.message}</p>}
          </div>

          <div>
            <label className="label">Nome (opcional)</label>
            <input {...register('nome')} placeholder="Ex: Mimosa" className="input" />
          </div>

          <div>
            <label className="label">Raça</label>
            <select {...register('raca')} className="input">
              <option value="">Selecionar...</option>
              {BOVINE_BREEDS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nascimento</label>
              <input type="date" {...register('nascimento')} className="input" />
            </div>
            <div>
              <label className="label">Peso (kg)</label>
              <input type="number" step="0.1" {...register('pesoKg')} placeholder="450" className="input" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={createAnimal.isPending} className="btn-primary flex-1">
              {createAnimal.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
