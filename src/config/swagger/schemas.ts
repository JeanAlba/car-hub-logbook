const objectId = (example: string) => ({
  type: 'string',
  pattern: '^[a-fA-F0-9]{24}$',
  example,
});

const userId = '66c47aa12ea87f8123456701';
const carId = '66c47aa12ea87f8123456702';
const recordId = '66c47aa12ea87f8123456703';

const carFields = {
  brand: { type: 'string', example: 'Volkswagen' },
  model: { type: 'string', example: 'Golf GTI' },
  year: {
    type: 'integer',
    minimum: 1900,
    description: 'Between 1900 and the current year + 1',
    example: 2018,
  },
  plate: {
    type: 'string',
    description:
      'Normalized to uppercase without spaces or hyphens. 7 alphanumeric characters, unique per user',
    example: 'ABC1D23',
  },
  mileage: { type: 'number', minimum: 0, example: 45000 },
  nickname: {
    type: 'string',
    description: 'Optional. Removed when omitted in a PUT',
    example: 'Daily',
  },
};

const serviceRecordFields = {
  type: {
    type: 'string',
    enum: ['MAINTENANCE', 'REPAIR', 'MODIFICATION', 'OTHER'],
    example: 'MAINTENANCE',
  },
  description: { type: 'string', example: 'Oil change' },
  cost: { type: 'number', minimum: 0, example: 350.5 },
  date: { type: 'string', format: 'date', example: '2026-01-31' },
  mileage: { type: 'number', minimum: 0, example: 46000 },
  warrantyMonths: {
    type: 'integer',
    minimum: 1,
    maximum: 120,
    description: 'Optional. Removed, together with warrantyExpiresAt, when omitted in a PUT',
    example: 6,
  },
};

const serviceRecordRequired = ['type', 'description', 'cost', 'date', 'mileage'];

const spentByType = {
  type: 'object',
  properties: {
    MAINTENANCE: { type: 'number', example: 350.5 },
    REPAIR: { type: 'number', example: 0 },
    MODIFICATION: { type: 'number', example: 2000 },
    OTHER: { type: 'number', example: 0 },
  },
};

export const schemas = {
  Error: {
    type: 'object',
    properties: { message: { type: 'string', example: 'Internal server error' } },
  },
  UserData: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Ana Silva' },
      email: {
        type: 'string',
        format: 'email',
        description: 'Unique, stored in lowercase',
        example: 'ana@example.com',
      },
      password: { type: 'string', minLength: 6, example: 'secret123' },
    },
  },
  User: {
    type: 'object',
    properties: {
      id: objectId(userId),
      name: { type: 'string', example: 'Ana Silva' },
      email: { type: 'string', example: 'ana@example.com' },
    },
  },
  LoginData: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', example: 'ana@example.com' },
      password: { type: 'string', example: 'secret123' },
    },
  },
  CarData: {
    type: 'object',
    required: ['userId', 'brand', 'model', 'year', 'plate', 'mileage'],
    properties: { userId: objectId(userId), ...carFields },
  },
  CarUpdateData: {
    type: 'object',
    required: ['brand', 'model', 'year', 'plate', 'mileage'],
    properties: carFields,
  },
  Car: {
    type: 'object',
    properties: { id: objectId(carId), userId: objectId(userId), ...carFields },
  },
  ServiceRecordData: {
    type: 'object',
    required: ['carId', ...serviceRecordRequired],
    properties: { carId: objectId(carId), ...serviceRecordFields },
  },
  ServiceRecordUpdateData: {
    type: 'object',
    required: serviceRecordRequired,
    properties: serviceRecordFields,
  },
  ServiceRecord: {
    type: 'object',
    properties: {
      id: objectId(recordId),
      carId: objectId(carId),
      ...serviceRecordFields,
      warrantyExpiresAt: {
        type: 'string',
        format: 'date',
        description: 'Calculated by the backend. Present only when warrantyMonths is set',
        example: '2026-07-31',
      },
    },
  },
  CarSummary: {
    type: 'object',
    properties: {
      totalSpent: { type: 'number', example: 2350.5 },
      recordsCount: { type: 'integer', example: 2 },
      lastServiceDate: { type: 'string', format: 'date', nullable: true, example: '2026-04-02' },
      spentByType,
    },
  },
};
