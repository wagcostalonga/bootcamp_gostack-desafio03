import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import StartDeliveryController from './app/controllers/StartDeliveryController';
import EndDeliveryController from './app/controllers/EndDeliveryController';
import AvailableDeliveriesController from './app/controllers/AvailableDeliveriesController';
import ConcludedDeliveriesController from './app/controllers/ConcludedDeliveriesController';
import NotificationController from './app/controllers/NotificationController';
import ProblemController from './app/controllers/ProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients', RecipientController.index);

routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.get('/deliverymen', DeliverymanController.index);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.get('/deliveries', DeliveryController.index);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.put('/deliveries/:id/start', StartDeliveryController.update);
routes.put('/deliveries/:id/end', EndDeliveryController.update);

routes.get('/deliveryman/:id/deliveries', AvailableDeliveriesController.index);
routes.get('/deliveryman/:id/concluded', ConcludedDeliveriesController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/deliveries/:delivery_id/problems', ProblemController.store);
routes.get('/deliveries/problems', ProblemController.show);
routes.get('/delivery/:delivery_id/problems', ProblemController.index);
routes.delete('/delivery/:id/problems/cancel', ProblemController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
