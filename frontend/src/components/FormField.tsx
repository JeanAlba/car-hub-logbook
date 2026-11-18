import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}  

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs leading-4 text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs leading-4 text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
