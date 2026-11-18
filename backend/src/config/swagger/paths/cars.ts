import {
  badRequest,
  body,
  error,
  idParameter,
  requestBody,
  serverError,
  tooLarge,
  unauthorized,
} from '../responses';

const carExample = {
  brand: 'Volkswagen',
  model: 'Golf GTI',
  year: 2018,
  plate: 'ABC-1D23',
  mileage: 45000,
  nickname: 'Daily',
};

const carNotFound = error('Car does not exist or belongs to another user', 'Car not found');
const carId = idParameter('Car id');
const invalidId = badRequest('Invalid identifier');

export const carPaths = {
  '/cars': {
    post: {
      tags: ['Cars'],
      summary: 'Create a car for the logged-in user (any userId in the body is ignored)',
      requestBody: requestBody('CarUpdateData', carExample),
      responses: {
        201: body('Car', 'Car created'),
        400: badRequest('Invalid car data'),
        404: error('User not found', 'User not found'),
        409: error('Plate already used by this user', 'Plate already registered for this user'),
        413: tooLarge,
        401: unauthorized,
        500: serverError,
      },
    },
    get: {
      tags: ['Cars'],
      summary: 'List the cars of the logged-in user (empty list when there are none)',
      responses: {
        200: {
          description: 'List of cars',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/Car' } },
            },
          },
        },
        401: unauthorized,
        500: serverError,
      },
    },
  },
  '/cars/{id}': {
    get: {
      tags: ['Cars'],
      summary: 'Get a car by id',
      parameters: [carId],
      responses: {
        200: body('Car'),
        400: invalidId,
        404: carNotFound,
        401: unauthorized,
        500: serverError,
      },
    },
    put: {
      tags: ['Cars'],
      summary: 'Replace the editable fields of a car. An omitted nickname is removed',
      parameters: [carId],
      requestBody: requestBody('CarUpdateData', carExample),
      responses: {
        200: body('Car', 'Car updated'),
        400: badRequest('Invalid identifier', 'Invalid car data'),
        404: carNotFound,
        409: error('Plate already used by this user', 'Plate already registered for this user'),
        413: tooLarge,
        401: unauthorized,
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
        401: unauthorized,
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
        401: unauthorized,
        500: serverError,
      },
    },
  },
};
