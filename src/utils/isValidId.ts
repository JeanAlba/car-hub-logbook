export const isValidId = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
