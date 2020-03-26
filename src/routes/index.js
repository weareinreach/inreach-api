import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import {commentsGet, commentsUpdate, ratingsGet, ratingsUpdate} from './entity';
import {
  organizationDelete,
  organizationGet,
  organizationsGetCount,
  organizationsCreate,
  organizationsGet,
  organizationUpdate,
  serviceDelete,
  serviceGet,
  servicesCreate,
  servicesGet,
  serviceUpdate
} from './organizations';
import {
  authUser,
  checkUserToken,
  userDelete,
  userPasswordUpdate,
  userGet,
  usersCreate,
  usersGet,
  userUpdate
} from './users';
import swaggerDocument from '../swagger.json';

export const baseRouter = Router();
export const versionOneRouter = Router();

baseRouter.get('/', (req, res) => res.json({ok: true}));
baseRouter.use('/docs', swaggerUi.serve);
baseRouter.get('/docs', swaggerUi.setup(swaggerDocument));

// Auth
versionOneRouter.post('/auth', authUser);
versionOneRouter.post('/auth/check', checkUserToken);

// Organizations
versionOneRouter.get('/organizations', organizationsGet);
versionOneRouter.post('/organizations', organizationsCreate);
versionOneRouter.get('/organizations/count', organizationsGetCount);
versionOneRouter.get('/organizations/:orgId', organizationGet);
versionOneRouter.patch('/organizations/:orgId', organizationUpdate);
versionOneRouter.delete('/organizations/:orgId', organizationDelete);

// Services
versionOneRouter.get('/organizations/:orgId/services', servicesGet);
versionOneRouter.post('/organizations/:orgId/services', servicesCreate);
versionOneRouter.get('/organizations/:orgId/services/:serviceId', serviceGet);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId',
  serviceUpdate
);
versionOneRouter.delete(
  '/organizations/:orgId/services/:serviceId',
  serviceDelete
);

// Comments
versionOneRouter.get('/organizations/:orgId/comments', commentsGet);
versionOneRouter.patch('/organizations/:orgId/comments', commentsUpdate);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/comments',
  commentsGet
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/comments',
  commentsUpdate
);

// Ratings
versionOneRouter.get('/organizations/:orgId/ratings', ratingsGet);
versionOneRouter.patch('/organizations/:orgId/ratings', ratingsUpdate);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/ratings',
  ratingsGet
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/ratings',
  ratingsUpdate
);

// Users
versionOneRouter.get('/users', usersGet);
versionOneRouter.post('/users', usersCreate);
versionOneRouter.get('/users/:userId', userGet);
versionOneRouter.patch('/users/:userId', userUpdate);
versionOneRouter.delete('/users/:userId', userDelete);
versionOneRouter.patch('/users/:userId/password', userPasswordUpdate);
