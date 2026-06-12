import { Link } from 'react-router-dom'
import { Bell, Github, Shield, Zap, CalendarCheck, AlertTriangle } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-sm">🐄</div>
          <span className="font-bold text-white text-lg tracking-tight">CriaViva</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
            Entrar
          </Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">
            Criar conta grátis
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Shield size={12} />
            100% gratuito · Open source
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Nunca perca um parto
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Gestão reprodutiva do seu rebanho com alertas automáticos via notificação.
            Simples, gratuito e funciona no celular.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-6 py-3 rounded-xl">
              Começar agora — é grátis
            </Link>
            <a
              href="https://github.com/paulohr-abreu/cria-viva"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base px-6 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Github size={17} />
              Ver no GitHub
            </a>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-12">
          <h2 className="text-xl font-bold text-white text-center mb-8">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard
              icon={<CalendarCheck size={22} className="text-brand-400" />}
              iconBg="bg-brand-500/10"
              step="01"
              title="Registre coberturas"
              desc="Cadastre IAs e montas. O sistema calcula automaticamente o DPP com base em 283 dias de gestação."
            />
            <FeatureCard
              icon={<Bell size={22} className="text-orange-400" />}
              iconBg="bg-orange-500/10"
              step="02"
              title="Receba alertas"
              desc="Notificação no browser em D-13, D-7, D-3 e no dia do parto. Funciona mesmo com a aba fechada."
            />
            <FeatureCard
              icon={<Zap size={22} className="text-blue-400" />}
              iconBg="bg-blue-500/10"
              step="03"
              title="Acompanhe o rebanho"
              desc="Diagnósticos de gestação, histórico reprodutivo, taxa de concepção e vacas abertas em um só lugar."
            />
          </div>
        </section>

        {/* Regras reprodutivas */}
        <section className="py-12">
          <div className="card border-white/[0.07]">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Lógica veterinária embutida</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  O sistema bloqueia eventos impossíveis — como registrar uma monta com gestação ativa,
                  parto com menos de 240 dias após cobertura, ou cio durante prenhez confirmada.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {['Gestação ativa protegida', 'Parto mínimo 240 dias', 'Cio bloqueado na prenhez', 'Diagnóstico validado'].map(r => (
                <div key={r} className="bg-white/[0.04] rounded-xl p-3 text-xs text-slate-400 text-center border border-white/[0.05]">
                  {r}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open source */}
        <section className="py-12 text-center">
          <div className="bg-[#111827] border border-white/[0.07] rounded-2xl p-8">
            <Github size={32} className="text-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Open Source, forever free</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              CriaViva é open source. Sem planos pagos, sem limite de animais, sem pegadinha.
              Pode usar, pode modificar, pode contribuir.
            </p>
            <Link to="/register" className="btn-primary px-6 py-2.5">
              Criar conta grátis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] py-6 text-center text-xs text-slate-600">
        CriaViva · Open Source · Feito para o agro brasileiro
      </footer>
    </div>
  )
}

function FeatureCard({ icon, iconBg, step, title, desc }: {
  icon: React.ReactNode
  iconBg: string
  step: string
  title: string
  desc: string
}) {
  return (
    <div className="bg-[#111827] border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-xs font-mono text-slate-700">{step}</span>
      </div>
      <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}
