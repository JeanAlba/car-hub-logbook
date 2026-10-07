import { paths } from './paths';
import { schemas } from './schemas';

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'car-hub API',
    version: '1.0.0',
    description:
      'Car logbook: users, cars and service records with optional warranty. There is no token: clients send userId and carId themselves.',
  },
  paths,
  components: { schemas },
};
