export const normalizePlate = (plate: string): string => plate.replace(/[\s-]/g, '').toUpperCase();
