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

const carExample = {
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'ABC-1D23',
  mileage: 45000,
  nickname: 'Daily',
};

const carNotFound = error('Car not found', 'Car not found');
const carId = idParameter('Car id');
const invalidId = badRequest('Invalid identifier');

export const carPaths = {
  '/cars': {
    post: {
      tags: ['Cars'],
      summary: 'Create a car',
      requestBody: requestBody('CarData', { userId: '66c47aa12ea87f8123456701', ...carExample }),
      responses: {
        201: body('Car', 'Car created'),
        400: badRequest('Invalid identifier', 'Invalid car data'),
        404: error('User not found', 'User not found'),
        409: error('Plate already used by this user', 'Plate already registered for this user'),
        413: tooLarge,
        500: serverError,
      },
    },
    get: {
      tags: ['Cars'],
      summary: 'List the cars of a user (empty list when the user has none)',
      parameters: [queryParameter('userId', 'Owner of the cars')],
      responses: {
        200: {
          description: 'List of cars',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/Car' } },
            },
          },
        },
        400: error('Missing or malformed userId', 'Invalid identifier'),
        500: serverError,
      },
    },
  },
  '/cars/{id}': {
    get: {
      tags: ['Cars'],
      summary: 'Get a car by id',
      parameters: [carId],
      responses: { 200: body('Car'), 400: invalidId, 404: carNotFound, 500: serverError },
    },
    put: {
      tags: ['Cars'],
      summary:
        'Replace the editable fields of a car. userId cannot be changed and is ignored. An omitted nickname is removed',
      parameters: [carId],
      requestBody: requestBody('CarUpdateData', carExample),
      responses: {
        200: body('Car', 'Car updated'),
        400: badRequest('Invalid identifier', 'Invalid car data'),
        404: carNotFound,
        409: error('Plate already used by this user', 'Plate already registered for this user'),
        413: tooLarge,
        500: serverError,
      },
    },
    delete: {
      tags: ['Cars'],
      summary: 'Delete a car and all of its service records',
      parameters: [carId],
      responses: {
        204: { description: 'Car deleted' },
        400: invalidId,
        404: carNotFound,
        500: serverError,
      },
    },
  },
  '/cars/{id}/summary': {
    get: {
      tags: ['Cars'],
      summary: 'Spending summary and metrics of a car',
      parameters: [carId],
      responses: {
        200: body('CarSummary'),
        400: invalidId,
        404: carNotFound,
        500: serverError,
      },
    },
  },
};
