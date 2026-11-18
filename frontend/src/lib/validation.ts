import { z } from 'zod'

export const requiredNumber = (requiredMessage: string) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ error: requiredMessage }).refine(Number.isFinite, requiredMessage),
  )

export const optionalInteger = (invalidMessage: string) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ error: invalidMessage }).int(invalidMessage).optional(),
  )
