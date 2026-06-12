import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useCurrentFarm } from '../store/currentFarm'
import { formatDate } from '../lib/utils'

export function ReportsPage() {
  const { farmId } = useCurrentFarm()

  const { data: efficiency } = useQuery({
    queryKey: ['report-efficiency', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/farms/${farmId}/reports/efficiency`)
      return data
    },
    enabled: !!farmId,
  })

  const { data: openCows = [] } = useQuery({
    queryKey: ['report-open-cows', farmId],
    queryFn: async () => {
      const { data } = await api.get(`/farms/${farmId}/reports/open-cows`)
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
            <Stat label="Total de coberturas" value={efficiency.totalBreedings} />
            <Stat label="Diagnósticos positivos" value={efficiency.positiveDiagnoses} />
            <Stat label="Taxa de concepção" value={`${efficiency.conceptionRate}%`} highlight />
            <Stat label="Vacas abertas" value={efficiency.openCows} />
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-3">Vacas abertas ({openCows.length})</h2>
        {openCows.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhuma vaca em aberto</p>
        ) : (
          <div className="space-y-2">
            {openCows.map((cow: any) => (
              <div key={cow.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{cow.name ?? cow.earTag}</p>
                  {cow.lastEvent && (
                    <p className="text-xs text-gray-500">Último evento: {formatDate(cow.lastEvent)}</p>
                  )}
                </div>
                {cow.daysOpen !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cow.daysOpen > 90 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {cow.daysOpen}d em aberto
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

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-brand-50' : 'bg-gray-50'}`}>
      <p className={`text-2xl font-bold ${highlight ? 'text-brand-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
