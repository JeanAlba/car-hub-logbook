import { Router, type Request, type Response } from 'express';
import * as userController from '../controllers/userController';
import { validateLoginData } from '../middlewares/validateLoginData';
import { carRoutes } from './carRoutes';
import { serviceRecordRoutes } from './serviceRecordRoutes';
import { userRoutes } from './userRoutes';

export const routes = Router();

routes.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok' });
});
routes.post('/login', validateLoginData, userController.login);
routes.use('/users', userRoutes);
routes.use('/cars', carRoutes);
routes.use('/service-records', serviceRecordRoutes);
