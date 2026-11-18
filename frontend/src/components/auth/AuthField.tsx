import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthFieldProps extends ComponentProps<typeof Input> {
  id: string
  label: string
  error?: string
}

export function AuthField({ id, label, error, ...inputProps }: AuthFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Input id={id} className="h-9 bg-black px-3 text-sm dark:bg-black" {...inputProps} />
      <p className="min-h-4 text-[11px] leading-4 text-destructive">{error ?? ''}</p>
    </div>
  )
}
