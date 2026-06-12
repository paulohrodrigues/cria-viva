import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useCreateEvent } from '../../hooks/useAnimals'
import { EVENT_TYPE_LABELS } from '@cria-viva/shared'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

interface Props {
  animalId: string
  farmId: string
  onClose: () => void
}

interface FormData {
  type: string
  eventDate: string
  result: string
  notes: string
  bull: string
}

const TYPES_WITH_RESULT = ['PREGNANCY_DIAGNOSIS']
const TYPES_WITH_BULL = ['INSEMINATION', 'NATURAL_BREEDING']

export function NewEventModal({ animalId, farmId, onClose }: Props) {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { eventDate: dayjs().format('YYYY-MM-DD') },
    shouldUnregister: true,
  })
  const createEvent = useCreateEvent(animalId, farmId)
  const selectedType = watch('type')

  async function onSubmit(data: FormData) {
    try {
      await createEvent.mutateAsync({
        type: data.type,
        eventDate: data.eventDate,
        result: data.result !== '' ? data.result === 'true' : undefined,
        notes: data.notes || undefined,
        extraData: data.bull ? { bull: data.bull } : undefined,
      })

      const specialMessages: Record<string, string> = {
        INSEMINATION: 'IA registrada! DPP calculado automaticamente.',
        NATURAL_BREEDING: 'Monta registrada! DPP calculado automaticamente.',
        CALVING: 'Parto registrado com sucesso!',
      }
      toast.success(specialMessages[data.type] ?? 'Evento registrado!')
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao registrar evento'
      toast.error(msg, { duration: 6000 })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#111827] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
          <h2 className="font-semibold">Registrar evento</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div>
            <label className="label">Tipo de evento *</label>
            <select {...register('type', { required: true })} className="input">
              <option value="">Selecionar...</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data *</label>
            <input type="date" {...register('eventDate', { required: true })} className="input" />
          </div>

          {TYPES_WITH_RESULT.includes(selectedType) && (
            <div>
              <label className="label">Resultado</label>
              <select {...register('result')} className="input">
                <option value="">Inconclusivo</option>
                <option value="true">Positivo (prenha)</option>
                <option value="false">Negativo (vazia)</option>
              </select>
            </div>
          )}

          {TYPES_WITH_BULL.includes(selectedType) && (
            <div>
              <label className="label">Touro / Sêmen</label>
              <input {...register('bull')} placeholder="Ex: Touro Resistente XYZ" className="input" />
            </div>
          )}

          <div>
            <label className="label">Observações</label>
            <textarea {...register('notes')} rows={2} placeholder="Notas adicionais..." className="input resize-none" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={createEvent.isPending} className="btn-primary flex-1">
              {createEvent.isPending ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
