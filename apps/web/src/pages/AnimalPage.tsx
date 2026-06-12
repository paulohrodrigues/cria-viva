import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Baby, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatDate, daysToText } from '../lib/utils'
import { EVENT_TYPE_LABELS, PREGNANCY_STATUS_LABELS, calculateRemainingDays } from '@cria-viva/shared'
import { NovoEventoModal } from '../components/eventos/NovoEventoModal'
import { useCurrentFarm } from '../store/currentFarm'
import toast from 'react-hot-toast'

export function AnimalPage() {
  const { id } = useParams<{ id: string }>()
  const { farmId } = useCurrentFarm()
  const navigate = useNavigate()
  const [eventModal, setEventModal] = useState(false)
  const qc = useQueryClient()

  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: async () => {
      const { data } = await api.get(`/fazendas/${farmId}/animais/${id}`)
      return data
    },
    enabled: !!id && !!farmId,
  })

  const deleteEvent = useMutation({
    mutationFn: async (eventoId: string) => {
      await api.delete(`/animais/${id}/eventos/${eventoId}`)
    },
    onSuccess: () => {
      toast.success('Evento removido')
      qc.invalidateQueries({ queryKey: ['animal', id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['animais'] })
    },
    onError: () => toast.error('Erro ao remover evento'),
  })

  const registerBirth = useMutation({
    mutationFn: async () => {
      await api.post(`/animais/${id}/eventos`, {
        tipo: 'PARTO',
        dataEvento: new Date().toISOString().split('T')[0],
        resultado: true,
      })
    },
    onSuccess: () => {
      toast.success('Parto registrado!')
      qc.invalidateQueries({ queryKey: ['animal', id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  if (isLoading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-14 bg-white/5 rounded-2xl" />
      <div className="h-24 bg-white/5 rounded-2xl" />
      <div className="h-40 bg-white/5 rounded-2xl" />
    </div>
  )
  if (!animal) return null

  const activePregnancy = animal.gestacoes?.find((g: any) => ['SUSPEITA', 'CONFIRMADA'].includes(g.status))
  const daysRemaining = activePregnancy ? calculateRemainingDays(new Date(activePregnancy.dpp)) : null

  const urgency =
    daysRemaining !== null && daysRemaining <= 3 ? 'critical' :
    daysRemaining !== null && daysRemaining <= 7 ? 'warning' : 'normal'

  const urgencyStyle = {
    critical: 'border-l-red-500 bg-red-500/10',
    warning:  'border-l-orange-500 bg-orange-500/10',
    normal:   'border-l-green-500 bg-green-500/10',
  }[urgency]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft size={18} className="text-slate-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg text-white leading-tight truncate">
            {animal.nome ?? animal.brinco}
          </h1>
          <p className="text-sm text-slate-500">Brinco #{animal.brinco} · {animal.raca ?? 'Raça não informada'}</p>
        </div>
      </div>

      {/* Status da gestação */}
      {activePregnancy && (
        <div className={`card border-l-4 ${urgencyStyle}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white">
                {PREGNANCY_STATUS_LABELS[activePregnancy.status]}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                DPP: <span className="text-white font-medium">{formatDate(activePregnancy.dpp)}</span>
                {daysRemaining !== null && (
                  <span className="ml-2 text-slate-500">({daysToText(daysRemaining)})</span>
                )}
              </p>
            </div>
            {daysRemaining !== null && daysRemaining <= 7 && (
              <button
                onClick={() => registerBirth.mutate()}
                disabled={registerBirth.isPending}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
              >
                <Baby size={14} />
                Registrar parto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <button
        onClick={() => setEventModal(true)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Registrar evento
      </button>

      {/* Histórico */}
      <div className="card">
        <h2 className="font-semibold text-white mb-3">Histórico reprodutivo</h2>
        {animal.eventos?.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">Nenhum evento registrado</p>
        ) : (
          <div className="space-y-1">
            {animal.eventos?.map((evento: any) => (
              <div key={evento.id} className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {EVENT_TYPE_LABELS[evento.tipo] ?? evento.tipo}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-slate-600">{formatDate(evento.dataEvento)}</p>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remover "${EVENT_TYPE_LABELS[evento.tipo] ?? evento.tipo}"?\n\nOs efeitos deste evento serão desfeitos (gestação, alertas).`)) {
                            deleteEvent.mutate(evento.id)
                          }
                        }}
                        disabled={deleteEvent.isPending}
                        className="p-1 text-slate-700 hover:text-red-400 transition-colors rounded"
                        title="Remover evento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {evento.tipo === 'DIAGNOSTICO_GESTACAO' && evento.resultado !== null && evento.resultado !== undefined && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Resultado: {evento.resultado ? '✅ Positivo' : '❌ Negativo'}
                    </p>
                  )}
                  {evento.observacoes && (
                    <p className="text-xs text-slate-600 mt-0.5">{evento.observacoes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {eventModal && (
        <NovoEventoModal
          animalId={id!}
          fazendaId={farmId}
          onClose={() => setEventModal(false)}
        />
      )}
    </div>
  )
}
