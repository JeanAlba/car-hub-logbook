import { Car, Gauge, LogOut, Palette, User } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SevenSegmentWordmark } from '@/components/auth/SevenSegmentChar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAccent } from '@/hooks/useAccent'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    '-mb-px inline-flex items-center gap-1.5 border-b-2 px-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-sm',
    isActive
      ? 'border-brand text-brand'
      : 'border-transparent text-muted-foreground hover:text-foreground',
  )

export function AppLayout() {
  const { user, logout } = useAuth()
  const { accent, toggleAccent } = useAccent()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
    toast.success('Você saiu da sua conta.')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-black">
        <div className="mx-auto flex h-14 w-full max-w-[1300px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link to="/visao-geral" aria-label="car-hub" className="shrink-0">
            <SevenSegmentWordmark />
          </Link>
          <nav className="flex h-full flex-1 items-stretch gap-1">
            <NavLink to="/visao-geral" className={navLinkClass}>
              <Gauge className="size-4 shrink-0" />
              Geral
            </NavLink>
            <NavLink to="/carros" className={navLinkClass}>
              <Car className="size-4 shrink-0" />
              Carros
            </NavLink>
          </nav>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={user?.name ?? 'Conta'}
                className="max-w-44 gap-2 text-sm font-semibold sm:max-w-60"
              >
                <User className="size-4 shrink-0 text-muted-foreground" />
                <span className="hidden truncate sm:inline">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={toggleAccent}>
                <Palette />
                <span>Painel: {accent === 'amber' ? 'Âmbar GM' : 'Verde fósforo'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
