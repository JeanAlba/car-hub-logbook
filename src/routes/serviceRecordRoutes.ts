import { Router } from 'express';
import * as controller from '../controllers/serviceRecordController';
import {
  validateServiceRecordCarId,
  validateServiceRecordCarIdQuery,
  validateServiceRecordData,
  validateServiceRecordId,
} from '../middlewares/validateServiceRecordData';

export const serviceRecordRoutes = Router();

serviceRecordRoutes.post(
  '/',
  validateServiceRecordCarId,
  validateServiceRecordData,
  controller.create,
);
serviceRecordRoutes.get('/', validateServiceRecordCarIdQuery, controller.list);
serviceRecordRoutes.get('/:id', validateServiceRecordId, controller.getById);
serviceRecordRoutes.put(
  '/:id',
  validateServiceRecordId,
  validateServiceRecordData,
  controller.update,
);
serviceRecordRoutes.delete('/:id', validateServiceRecordId, controller.remove);
