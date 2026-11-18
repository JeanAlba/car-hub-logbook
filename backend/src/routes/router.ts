import { Router, type Request, type Response } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middlewares/requireAuth';
import { validateLoginData } from '../middlewares/validateLoginData';
import { carRoutes } from './carRoutes';
import { serviceRecordRoutes } from './serviceRecordRoutes';
import { userRoutes } from './userRoutes';

export const routes = Router();

routes.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok' });
});
routes.post('/login', validateLoginData, userController.login);
routes.post('/logout', userController.logout);
routes.get('/me', requireAuth, userController.me);
routes.get('/dashboard', requireAuth, dashboardController.get);
routes.use('/users', userRoutes);
routes.use('/cars', requireAuth, carRoutes);
routes.use('/service-records', requireAuth, serviceRecordRoutes);
