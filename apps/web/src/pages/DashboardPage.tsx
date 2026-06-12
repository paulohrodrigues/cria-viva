import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Baby, Calendar, Leaf } from 'lucide-react'
import { useDashboard } from '../hooks/useFarm'
import { useCurrentFarm } from '../store/currentFarm'
import { cn, formatDate, daysToText, urgencyToBadge } from '../lib/utils'

export function DashboardPage() {
  const { farmId } = useCurrentFarm()
  const { data, isLoading } = useDashboard(farmId)
  const navigate = useNavigate()

  if (!farmId) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm">Selecione uma fazenda para começar</p>
      </div>
    )
  }

  if (isLoading) return <DashboardSkeleton />

  const summary = data ?? {
    totalActive: 0, totalPregnant: 0, birthsThisWeek: 0,
    birthsThisMonth: 0, totalOpen: 0, upcomingBirths: [],
  }

  const urgent = summary.upcomingBirths.filter((p: any) => p.daysRemaining <= 7)

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Leaf size={16} />}
          label="Prenhas"
          value={summary.totalPregnant}
          iconClass="bg-green-500/15 text-green-400"
          accentClass="border-l-green-500/60"
        />
        <StatCard
          icon={<Baby size={16} />}
          label="Parindo esta semana"
          value={summary.birthsThisWeek}
          iconClass="bg-red-500/15 text-red-400"
          accentClass="border-l-red-500/60"
          glow={summary.birthsThisWeek > 0}
        />
        <StatCard
          icon={<AlertTriangle size={16} />}
          label="Abertas"
          value={summary.totalOpen}
          iconClass="bg-orange-500/15 text-orange-400"
          accentClass="border-l-orange-500/60"
        />
        <StatCard
          icon={<Calendar size={16} />}
          label="Total ativo"
          value={summary.totalActive}
          iconClass="bg-blue-500/15 text-blue-400"
          accentClass="border-l-blue-500/60"
        />
      </div>

      {/* Atenção agora */}
      {urgent.length > 0 && (
        <div className="card border-red-500/20">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
            <AlertTriangle size={15} className="text-red-400" />
            Atenção agora
          </h2>
          <div className="space-y-2">
            {urgent.map((birth: any) => (
              <button
                key={birth.animalId}
                onClick={() => navigate(`/animais/${birth.animalId}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-sm text-slate-100">
                    {birth.animalName ? `${birth.animalName} ` : ''}
                    <span className="text-slate-500 font-normal">#{birth.earTag}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">DPP: {formatDate(birth.dpp)}</p>
                </div>
                <span className={urgencyToBadge(birth.urgency)}>
                  {daysToText(birth.daysRemaining)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Próximos partos */}
      <div className="card">
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
          <Calendar size={15} className="text-brand-400" />
          Próximos partos
        </h2>
        {summary.upcomingBirths.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">Nenhum parto agendado</p>
        ) : (
          <div className="space-y-0">
            {summary.upcomingBirths.map((birth: any) => (
              <button
                key={birth.animalId}
                onClick={() => navigate(`/animais/${birth.animalId}`)}
                className="w-full flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0 text-left hover:bg-white/[0.03] transition-colors rounded-lg px-1"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {birth.animalName ?? birth.earTag}
                  </p>
                  <p className="text-xs text-slate-600">{formatDate(birth.dpp)}</p>
                </div>
                <span className={cn('text-xs font-semibold', {
                  'text-red-400': birth.daysRemaining <= 3,
                  'text-orange-400': birth.daysRemaining <= 7 && birth.daysRemaining > 3,
                  'text-slate-400': birth.daysRemaining > 7,
                })}>
                  {daysToText(birth.daysRemaining)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, iconClass, accentClass, glow }: {
  icon: React.ReactNode
  label: string
  value: number
  iconClass: string
  accentClass: string
  glow?: boolean
}) {
  return (
    <div className={cn(
      'bg-[#111827] rounded-2xl p-4 flex flex-col gap-3 border border-white/[0.07] border-l-2 shadow-xl transition-all',
      accentClass,
      glow && 'ring-1 ring-red-500/30 shadow-red-500/10',
    )}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconClass)}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white tracking-tight leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1.5 leading-tight">{label}</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
      </div>
      <div className="h-40 bg-white/5 rounded-2xl" />
    </div>
  )
}
