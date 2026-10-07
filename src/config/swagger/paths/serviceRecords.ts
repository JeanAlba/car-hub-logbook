import {
  badRequest,
  body,
  error,
  idParameter,
  queryParameter,
  requestBody,
  serverError,
  tooLarge,
} from '../responses';

const recordExample = {
  type: 'MAINTENANCE',
  description: 'Oil change',
  cost: 350.5,
  date: '2026-01-31',
  mileage: 46000,
  warrantyMonths: 6,
};

const recordNotFound = error('Service record not found', 'Service record not found');
const recordId = idParameter('Service record id');
const invalidId = badRequest('Invalid identifier');

export const serviceRecordPaths = {
  '/service-records': {
    post: {
      tags: ['Service records'],
      summary:
        'Create a service record. warrantyExpiresAt is calculated from date and warrantyMonths',
      requestBody: requestBody('ServiceRecordData', {
        carId: '66c47aa12ea87f8123456702',
        ...recordExample,
      }),
      responses: {
        201: body('ServiceRecord', 'Service record created'),
        400: badRequest('Invalid identifier', 'Invalid service record data'),
        404: error('Car not found', 'Car not found'),
        413: tooLarge,
        500: serverError,
      },
    },
    get: {
      tags: ['Service records'],
      summary: 'List the service records of a car, most recent first',
      parameters: [queryParameter('carId', 'Car that owns the records')],
      responses: {
        200: {
          description: 'List of service records',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/ServiceRecord' } },
            },
          },
        },
        400: error('Missing or malformed carId', 'Invalid identifier'),
        500: serverError,
      },
    },
  },
  '/service-records/{id}': {
    get: {
      tags: ['Service records'],
      summary: 'Get a service record by id',
      parameters: [recordId],
      responses: {
        200: body('ServiceRecord'),
        400: invalidId,
        404: recordNotFound,
        500: serverError,
      },
    },
    put: {
      tags: ['Service records'],
      summary:
        'Replace a service record. carId cannot be changed. The warranty is recalculated, or removed when warrantyMonths is omitted',
      parameters: [recordId],
      requestBody: requestBody('ServiceRecordUpdateData', recordExample),
      responses: {
        200: body('ServiceRecord', 'Service record updated'),
        400: badRequest('Invalid identifier', 'Invalid service record data'),
        404: recordNotFound,
        413: tooLarge,
        500: serverError,
      },
    },
    delete: {
      tags: ['Service records'],
      summary: 'Delete a service record',
      parameters: [recordId],
      responses: {
        204: { description: 'Service record deleted' },
        400: invalidId,
        404: recordNotFound,
        500: serverError,
      },
    },
  },
};
