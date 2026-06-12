import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronRight } from 'lucide-react'
import { useAnimals } from '../hooks/useAnimals'
import { useCurrentFarm } from '../store/currentFarm'
import { cn, daysToText } from '../lib/utils'
import { NovoAnimalModal } from '../components/animais/NovoAnimalModal'

export function AnimaisPage() {
  const { farmId } = useCurrentFarm()
  const { data: animals = [], isLoading } = useAnimals(farmId)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const filtered = animals.filter((a: any) =>
    a.brinco.toLowerCase().includes(search.toLowerCase()) ||
    (a.nome?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por brinco ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5 shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">Novo animal</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-600 text-sm">Nenhum animal encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((animal: any) => {
            const d = animal.activePregnancy?.daysRemaining
            const pregnancyColor =
              d !== undefined && d <= 3 ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
              d !== undefined && d <= 7 ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25' :
              'bg-green-500/15 text-green-400 border border-green-500/25'

            return (
              <button
                key={animal.id}
                onClick={() => navigate(`/animais/${animal.id}`)}
                className="card w-full flex items-center justify-between text-left hover:border-white/15 hover:bg-[#161f30] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                    {animal.brinco.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-100">
                      {animal.nome ? `${animal.nome} ` : ''}
                      <span className="text-slate-500 font-normal">#{animal.brinco}</span>
                    </p>
                    <p className="text-xs text-slate-600">{animal.raca ?? 'Raça não informada'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {animal.activePregnancy ? (
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', pregnancyColor)}>
                      {d !== undefined && d <= 0 ? 'DPP hoje' : `parto ${daysToText(d)}`}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">aberta</span>
                  )}
                  <ChevronRight size={15} className="text-slate-700" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <NovoAnimalModal
          fazendaId={farmId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
