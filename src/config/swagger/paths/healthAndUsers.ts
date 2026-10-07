import { badRequest, body, error, requestBody, serverError, tooLarge } from '../responses';

export const healthAndUsersPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Check that the API is running',
      responses: {
        200: {
          description: 'API is running',
          content: { 'application/json': { example: { status: 'ok' } } },
        },
      },
    },
  },
  '/users': {
    post: {
      tags: ['Users'],
      summary: 'Register a user',
      requestBody: requestBody('UserData', {
        name: 'Ana Silva',
        email: 'ana@example.com',
        password: 'secret123',
      }),
      responses: {
        201: body('User', 'User created'),
        400: badRequest('Invalid user data'),
        409: error('Email already in use', 'Email already registered'),
        413: tooLarge,
        500: serverError,
      },
    },
  },
  '/login': {
    post: {
      tags: ['Users'],
      summary: 'Log in with email and password (no token is issued)',
      requestBody: requestBody('LoginData', { email: 'ana@example.com', password: 'secret123' }),
      responses: {
        200: body('User', 'Credentials are valid'),
        400: badRequest('Invalid login data'),
        401: error('Unknown email or wrong password', 'Invalid credentials'),
        413: tooLarge,
        500: serverError,
      },
    },
  },
};
