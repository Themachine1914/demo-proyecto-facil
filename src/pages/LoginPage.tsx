import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Logo } from '../components/brand/Logo'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, loading, configured, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-facil-bg">
        <Spinner />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      toast.success('Sesión iniciada')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fa-scroll flex h-full items-center justify-center overflow-y-auto bg-facil-bg px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <Logo height={64} className="mb-4 sm:mb-6 sm:!h-20" />
          <p className="text-sm text-facil-text-secondary">
            Control de proyectos de terminaciones
          </p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="rounded-[10px] border border-facil-border bg-facil-surface p-6 shadow-[var(--fa-shadow)] sm:p-8"
        >
          {!configured && (
            <div className="mb-6 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Firebase aún no está configurado. Copia <code>.env.example</code> a{' '}
              <code>.env</code> y completa las variables.
            </div>
          )}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-facil-text">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[10px] border border-facil-border bg-white px-3 py-2.5 text-sm text-facil-text outline-none transition focus:border-facil-accent focus:ring-2 focus:ring-facil-accent/20"
              placeholder="tu@email.com"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-sm font-medium text-facil-text">
              Contraseña
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[10px] border border-facil-border bg-white px-3 py-2.5 text-sm text-facil-text outline-none transition focus:border-facil-accent focus:ring-2 focus:ring-facil-accent/20"
              placeholder="••••••••"
            />
          </label>

          <Button type="submit" className="w-full" disabled={submitting || !configured}>
            {submitting ? 'Entrando…' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}
