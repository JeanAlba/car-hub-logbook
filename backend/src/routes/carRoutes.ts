import { Router } from 'express';
import * as controller from '../controllers/carController';
import { authorizeCarFromParams } from '../middlewares/authorizeOwner';
import { validateCarData, validateCarId } from '../middlewares/validateCarData';

export const carRoutes = Router();

carRoutes.post('/', validateCarData, controller.create);
carRoutes.get('/', controller.list);
carRoutes.get('/:id/summary', validateCarId, authorizeCarFromParams, controller.summary);
carRoutes.get('/:id', validateCarId, authorizeCarFromParams, controller.getById);
carRoutes.put('/:id', validateCarId, authorizeCarFromParams, validateCarData, controller.update);
carRoutes.delete('/:id', validateCarId, authorizeCarFromParams, controller.remove);
