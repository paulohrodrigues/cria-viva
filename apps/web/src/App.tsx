import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { AnimaisPage } from './pages/AnimaisPage'
import { AnimalPage } from './pages/AnimalPage'
import { RelatoriosPage } from './pages/RelatoriosPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { LandingPage } from './pages/LandingPage'

function RotaPrivada({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-brand-500">Carregando...</span></div>
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function RootRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0a0e17]"><span className="text-brand-500">Carregando...</span></div>
  if (!user) return <LandingPage />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/onboarding" element={<RotaPrivada><OnboardingPage /></RotaPrivada>} />
      <Route path="/" element={<RotaPrivada><AppShell /></RotaPrivada>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="animais" element={<AnimaisPage />} />
        <Route path="animais/:id" element={<AnimalPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="configuracoes" element={<ConfiguracoesPage />} />
      </Route>
    </Routes>
  )
}
