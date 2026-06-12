import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCurrentFarm } from '../store/currentFarm'
import { formatDate } from '../lib/utils'

export function RelatoriosPage() {
  const { farmId } = useCurrentFarm()

  const { data: efficiency } = useQuery({
    queryKey: ['relatorio-eficiencia', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/fazendas/${farmId}/relatorios/eficiencia`)
      return data
    },
    enabled: !!farmId,
  })

  const { data: openCows = [] } = useQuery({
    queryKey: ['relatorio-abertas', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/fazendas/${farmId}/relatorios/vacas-abertas`)
      return data
    },
    enabled: !!farmId,
  })

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">Relatórios</h1>

      {efficiency && (
        <div className="card">
          <h2 className="font-semibold mb-3">Eficiência reprodutiva</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total de coberturas" valor={efficiency.totalIAs} />
            <Stat label="Diagnósticos positivos" valor={efficiency.diagnosticosPositivos} />
            <Stat label="Taxa de concepção" valor={`${efficiency.conceptionRate}%`} destaque />
            <Stat label="Vacas abertas" valor={efficiency.openCows} />
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-3">Vacas abertas ({openCows.length})</h2>
        {openCows.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhuma vaca em aberto</p>
        ) : (
          <div className="space-y-2">
            {openCows.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{v.nome ?? v.brinco}</p>
                  {v.ultimoEvento && (
                    <p className="text-xs text-gray-500">Último evento: {formatDate(v.ultimoEvento)}</p>
                  )}
                </div>
                {v.diasAberta !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.diasAberta > 90 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {v.diasAberta}d em aberto
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, valor, destaque }: { label: string; valor: string | number; destaque?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${destaque ? 'bg-brand-50' : 'bg-gray-50'}`}>
      <p className={`text-2xl font-bold ${destaque ? 'text-brand-700' : 'text-gray-900'}`}>{valor}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
