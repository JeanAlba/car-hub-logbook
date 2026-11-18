import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="tabular text-sm text-brand">404</p>
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">O endereço acessado não existe.</p>
      <Button asChild variant="outline" size="sm">
        <Link to="/visao-geral">Voltar para a visão geral</Link>
      </Button>
    </main>
  )
}
