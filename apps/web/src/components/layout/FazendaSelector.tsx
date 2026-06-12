import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFarms } from '../../hooks/useFarm'
import { useCurrentFarm } from '../../store/currentFarm'

export function FazendaSelector() {
  const { data: farms = [] } = useFarms()
  const { farmId, setFarm } = useCurrentFarm()
  const [open, setOpen] = useState(false)

  const current = farms.find((f: any) => f.id === farmId)

  if (farms.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
      >
        <span className="max-w-[140px] truncate">{current?.nome ?? 'Selecionar fazenda'}</span>
        <ChevronDown size={14} className="text-slate-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-[#1a2133] rounded-xl shadow-2xl border border-white/10 min-w-[180px] z-20 overflow-hidden">
            {farms.map((f: any) => (
              <button
                key={f.id}
                onClick={() => { setFarm(f.id); setOpen(false) }}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
              >
                {f.nome}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
