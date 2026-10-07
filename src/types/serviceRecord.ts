export const SERVICE_RECORD_TYPES = ['MAINTENANCE', 'REPAIR', 'MODIFICATION', 'OTHER'] as const;

export type ServiceRecordType = (typeof SERVICE_RECORD_TYPES)[number];
