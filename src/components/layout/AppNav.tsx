import { FileText, LayoutDashboard, LayoutGrid, Receipt, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-medium transition sm:flex-row sm:gap-1.5 sm:text-sm ${
    isActive ? 'text-facil-primary' : 'text-facil-text-secondary hover:text-facil-text'
  }`

export function AppNav() {
  return (
    <nav className="shrink-0 border-t border-facil-border bg-facil-surface pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      <div className="flex">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard className="h-5 w-5" />
          Inicio
        </NavLink>
        <NavLink to="/tablero" className={linkClass}>
          <LayoutGrid className="h-5 w-5" />
          Tablero
        </NavLink>
        <NavLink to="/cotizar" className={linkClass}>
          <FileText className="h-5 w-5" />
          Cotizar
        </NavLink>
        <NavLink to="/facturar" className={linkClass}>
          <Receipt className="h-5 w-5" />
          Facturar
        </NavLink>
        <NavLink to="/tecnicos" className={linkClass}>
          <Users className="h-5 w-5" />
          Técnicos
        </NavLink>
      </div>
    </nav>
  )
}
