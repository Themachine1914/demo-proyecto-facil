import { LogOut } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { Button } from '../ui/Button'
import { AppNav } from './AppNav'
import { useAuth } from '../../contexts/AuthContext'

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-full max-h-dvh flex-col overflow-hidden bg-facil-bg">
      <header className="relative shrink-0 border-b border-facil-border bg-facil-surface pt-[env(safe-area-inset-top)]">
        <div className="flex h-12 items-center justify-between px-4 sm:h-14 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo height={28} className="sm:!h-8" />
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="hidden max-w-[160px] truncate text-sm text-facil-text-secondary md:inline">
              {user?.email}
            </span>
            <Button variant="ghost" onClick={() => void signOut()} className="!px-2.5 !py-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
        <div className="fa-gradient absolute inset-x-0 bottom-0 h-0.5" />
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>

      <AppNav />
    </div>
  )
}
