import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthField } from '@/components/auth/AuthField'
import { MonzaAuthCluster } from '@/components/auth/MonzaAuthCluster'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRevTelemetry } from '@/hooks/useRevTelemetry'
import { getErrorMessage } from '@/services/api'

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { revBoost, authError, errorMessage, pulseRev, triggerError } = useRevTelemetry()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser(values)
      toast.success('Conta criada.')
      navigate('/visao-geral', { replace: true })
    } catch (error) {
      const message = getErrorMessage(error)
      triggerError(message)
      toast.error(message)
    }
  }

  const hasValidationErrors = Boolean(errors.name || errors.email || errors.password)

  return (
    <MonzaAuthCluster
      mode="register"
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
          <h1 className="text-base font-semibold tracking-tight text-foreground">Criar conta</h1>
          <p className="text-xs text-muted-foreground">
            Cadastre-se para gerenciar seus veículos e serviços.
          </p>
        </div>

        <div className="space-y-1">
          <AuthField
            id="name"
            label="Nome"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register('name')}
          />

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
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-1 mb-3 rounded-sm border border-[#dc2626] bg-[#2b0909] px-3 py-2 text-center text-xs font-medium text-[#fecaca]"
          >
            {errorMessage}
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </div>
      </form>
    </MonzaAuthCluster>
  )
}
