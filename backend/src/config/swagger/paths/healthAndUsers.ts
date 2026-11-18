import {
  badRequest,
  body,
  error,
  requestBody,
  serverError,
  tooLarge,
  unauthorized,
} from '../responses';

export const healthAndUsersPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Check that the API is running',
      security: [],
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
      security: [],
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
      summary:
        'Log in with email and password. On success the API sets the httpOnly cookie "token" (JWT, 7 days)',
      security: [],
      requestBody: requestBody('LoginData', { email: 'ana@example.com', password: 'secret123' }),
      responses: {
        200: {
          ...body('User', 'Credentials are valid'),
          headers: {
            'Set-Cookie': {
              description: 'token=<jwt>; HttpOnly; SameSite=Lax; Path=/',
              schema: { type: 'string' },
            },
          },
        },
        400: badRequest('Invalid login data'),
        401: error('Unknown email or wrong password', 'Invalid credentials'),
        413: tooLarge,
        500: serverError,
      },
    },
  },
  '/logout': {
    post: {
      tags: ['Users'],
      summary: 'Log out by clearing the session cookie',
      security: [],
      responses: { 204: { description: 'Cookie cleared' }, 500: serverError },
    },
  },
  '/me': {
    get: {
      tags: ['Users'],
      summary: 'Get the user of the current session',
      responses: { 200: body('User'), 401: unauthorized, 500: serverError },
    },
  },
};
