import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './swagger.json';
import {commentsCreate, commentsGet} from './comments';
import {
  organizationDelete,
  organizationGet,
  organizationsCreate,
  organizationsGet,
  organizationUpdate
} from './organizations';
import {ratingsCreate, ratingsGet} from './ratings';
import {
  serviceDelete,
  serviceGet,
  servicesCreate,
  servicesGet,
  serviceUpdate
} from './services';
import {
  userDelete,
  userFavoritesUpdate,
  userGet,
  usersCreate,
  usersGet,
  userUpdate
} from './users';

const router = Router();

router.get('/', (req, res) => res.json({ok: true}));
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

// Organizations
router.get('/organizations', organizationsGet);
router.post('/organizations', organizationsCreate);
router.get('/organizations/:id', organizationGet);
router.patch('/organizations/:id', organizationUpdate);
router.delete('/organizations/:id', organizationDelete);

// Services
router.get('/organizations/:id/services', servicesGet);
router.post('/organizations/:id/services', servicesCreate);
router.get('/organizations/:id/services/:id', serviceGet);
router.patch('/organizations/:id/services/:id', serviceUpdate);
router.delete('/organizations/:id/services/:id', serviceDelete);

// Users
router.get('/users', usersGet);
router.post('/users', usersCreate);
router.get('/users/:id', userGet);
router.patch('/users/:id', userUpdate);
router.delete('/users/:id', userDelete);
router.patch('/users/:id/favorites', userFavoritesUpdate);

// Comments
router.get('/comments/:id', commentsGet);
router.post('/comments/:id', commentsCreate);

// Ratings
router.get('/ratings/:id', ratingsGet);
router.post('/ratings/:id', ratingsCreate);

export default router;
