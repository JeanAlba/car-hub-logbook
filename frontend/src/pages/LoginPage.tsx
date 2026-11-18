import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthField } from '@/components/auth/AuthField'
import { MonzaAuthCluster } from '@/components/auth/MonzaAuthCluster'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRevTelemetry } from '@/hooks/useRevTelemetry'
import { getErrorMessage } from '@/services/api'

const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/visao-geral'
  const { revBoost, authError, errorMessage, pulseRev, triggerError } = useRevTelemetry()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = getErrorMessage(error)
      triggerError(message)
      toast.error(message)
    }
  }

  const hasValidationErrors = Boolean(errors.email || errors.password)

  return (
    <MonzaAuthCluster
      mode="login"
      revBoost={revBoost}
      isSubmitting={isSubmitting}
      hasError={authError || hasValidationErrors}
    >
      <form
        onSubmit={handleSubmit(onSubmit, () => triggerError())}
        onInput={pulseRev}
        noValidate
      >
        <div className="mb-5 space-y-0.5">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Entrar no painel
          </h1>
          <p className="text-xs text-muted-foreground">
            Acesse sua garagem e histórico de serviços.
          </p>
        </div>

        <div className="space-y-1.5">
          <AuthField
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <AuthField
            id="password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-2 rounded-sm border border-[#dc2626] bg-[#2b0909] px-3 py-2 text-center text-xs font-medium text-[#fecaca]"
          >
            {errorMessage}
          </div>
        )}

        <div className="pt-5">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </div>
      </form>
    </MonzaAuthCluster>
  )
}
