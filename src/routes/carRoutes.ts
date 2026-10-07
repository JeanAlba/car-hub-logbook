import { Router } from 'express';
import * as controller from '../controllers/carController';
import {
  validateCarData,
  validateCarId,
  validateCarUserId,
  validateCarUserIdQuery,
} from '../middlewares/validateCarData';

export const carRoutes = Router();

carRoutes.post('/', validateCarUserId, validateCarData, controller.create);
carRoutes.get('/', validateCarUserIdQuery, controller.list);
carRoutes.get('/:id', validateCarId, controller.getById);
carRoutes.put('/:id', validateCarId, validateCarData, controller.update);
carRoutes.delete('/:id', validateCarId, controller.remove);
