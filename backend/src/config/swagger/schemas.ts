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
  MonthlySpend: {
    type: 'object',
    properties: {
      month: { type: 'string', example: '2026-04' },
      total: { type: 'number', example: 350.5 },
    },
  },
  CarSummary: {
    type: 'object',
    properties: {
      totalSpent: { type: 'number', example: 2350.5 },
      recordsCount: { type: 'integer', example: 2 },
      lastServiceDate: { type: 'string', format: 'date', nullable: true, example: '2026-04-02' },
      costPerKm: { type: 'number', nullable: true, example: 0.05 },
      spentByType,
      spentByMonth: {
        type: 'array',
        items: { $ref: '#/components/schemas/MonthlySpend' },
      },
    },
  },
  WarrantyAlert: {
    type: 'object',
    properties: {
      id: objectId(recordId),
      carId: objectId(carId),
      carName: { type: 'string', example: 'Volkswagen Golf GTI' },
      carPlate: { type: 'string', example: 'ABC1D23' },
      description: { type: 'string', example: 'Brake pads replacement' },
      warrantyExpiresAt: { type: 'string', format: 'date', example: '2026-11-28' },
      daysRemaining: { type: 'integer', example: 12 },
      status: { type: 'string', enum: ['EXPIRING', 'EXPIRED'], example: 'EXPIRING' },
    },
  },
  CarSpendItem: {
    type: 'object',
    properties: {
      carId: objectId(carId),
      carName: { type: 'string', example: 'Volkswagen Golf GTI' },
      carPlate: { type: 'string', example: 'ABC1D23' },
      totalSpent: { type: 'number', example: 2350.5 },
      recordsCount: { type: 'integer', example: 4 },
    },
  },
  DashboardRecentRecord: {
    allOf: [
      { $ref: '#/components/schemas/ServiceRecord' },
      {
        type: 'object',
        properties: {
          carName: { type: 'string', example: 'Volkswagen Golf GTI' },
          carPlate: { type: 'string', example: 'ABC1D23' },
        },
      },
    ],
  },
  DashboardSummary: {
    type: 'object',
    properties: {
      carsCount: { type: 'integer', example: 2 },
      recordsCount: { type: 'integer', example: 12 },
      totalSpent: { type: 'number', example: 14250.4 },
      spentLast30Days: { type: 'number', example: 909.9 },
      warranties: {
        type: 'object',
        properties: {
          activeCount: { type: 'integer', example: 4 },
          expiringCount: { type: 'integer', example: 1 },
          expiredCount: { type: 'integer', example: 1 },
          alerts: { type: 'array', items: { $ref: '#/components/schemas/WarrantyAlert' } },
        },
      },
      spentByCar: { type: 'array', items: { $ref: '#/components/schemas/CarSpendItem' } },
      recentRecords: {
        type: 'array',
        items: { $ref: '#/components/schemas/DashboardRecentRecord' },
      },
    },
  },
};
