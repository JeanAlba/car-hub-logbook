import { Router } from 'express';
import * as controller from '../controllers/serviceRecordController';
import {
  authorizeCarFromBody,
  authorizeCarFromQuery,
  authorizeServiceRecordFromParams,
} from '../middlewares/authorizeOwner';
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
  authorizeCarFromBody,
  validateServiceRecordData,
  controller.create,
);
serviceRecordRoutes.get(
  '/',
  validateServiceRecordCarIdQuery,
  authorizeCarFromQuery,
  controller.list,
);
serviceRecordRoutes.get(
  '/:id',
  validateServiceRecordId,
  authorizeServiceRecordFromParams,
  controller.getById,
);
serviceRecordRoutes.put(
  '/:id',
  validateServiceRecordId,
  authorizeServiceRecordFromParams,
  validateServiceRecordData,
  controller.update,
);
serviceRecordRoutes.delete(
  '/:id',
  validateServiceRecordId,
  authorizeServiceRecordFromParams,
  controller.remove,
);
