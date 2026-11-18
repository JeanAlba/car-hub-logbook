import { Router } from 'express';
import * as controller from '../controllers/userController';
import { validateUserData } from '../middlewares/validateUserData';

export const userRoutes = Router();

userRoutes.post('/', validateUserData, controller.create);
