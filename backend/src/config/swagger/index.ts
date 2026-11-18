import { paths } from './paths';
import { schemas } from './schemas';

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'car-hub API',
    version: '1.0.0',
    description:
      'Car logbook: users, cars and service records with optional warranty. Log in with POST /login: the API sets an httpOnly JWT cookie, which Swagger UI sends automatically. Cars and service records belong to the logged-in user.',
  },
  security: [{ cookieAuth: [] }],
  paths,
  components: {
    schemas,
    securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' } },
  },
};
