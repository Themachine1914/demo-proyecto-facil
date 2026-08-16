import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './contexts/AuthContext'
import { BoardPage } from './pages/BoardPage'
import { DashboardPage } from './pages/DashboardPage'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { LoginPage } from './pages/LoginPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { QuoteDetailPage } from './pages/QuoteDetailPage'
import { QuotesPage } from './pages/QuotesPage'
import { TechniciansPage } from './pages/TechniciansPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="tablero" element={<BoardPage />} />
              <Route path="proyectos/:projectId" element={<ProjectDetailPage />} />
              <Route path="cotizar" element={<QuotesPage />} />
              <Route path="cotizar/:quoteId" element={<QuoteDetailPage />} />
              <Route path="facturar" element={<InvoicesPage />} />
              <Route path="facturar/:invoiceId" element={<InvoiceDetailPage />} />
              <Route path="tecnicos" element={<TechniciansPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm',
          style: {
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgb(15 23 42 / 6%)',
          },
        }}
      />
    </AuthProvider>
  )
}
