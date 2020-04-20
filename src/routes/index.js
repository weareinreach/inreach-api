import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import {getComments, getRatings, updateComments, updateRatings} from './entity';
import {
  createOrg,
  deleteOrg,
  getOrg,
  getOrgs,
  getOrgsCount,
  updateOrg,
} from './organizations';
import {getReviews, createReview} from './reviews';
import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from './services';
import {
  authUser,
  checkUserToken,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserPassword,
} from './users';
import swaggerDocument from '../swagger.json';
import verifyToken from '../middleware/verifyToken.js';
import {getToken} from './auth.js';

export const baseRouter = Router();
export const versionOneRouter = Router();

baseRouter.get('/', (req, res) => res.json({ok: true}));
baseRouter.use('/docs', swaggerUi.serve);
baseRouter.get('/docs', swaggerUi.setup(swaggerDocument));

// Auth
versionOneRouter.post('/auth', authUser);
versionOneRouter.post('/auth/check', checkUserToken);
versionOneRouter.get('/auth/token', getToken);

// Organizations
versionOneRouter.get('/organizations', getOrgs);
versionOneRouter.post('/organizations', verifyToken, createOrg);
versionOneRouter.get('/organizations/count', getOrgsCount);
versionOneRouter.get('/organizations/:orgId', getOrg);
versionOneRouter.patch('/organizations/:orgId', verifyToken, updateOrg);
versionOneRouter.delete('/organizations/:orgId', verifyToken, deleteOrg);

// Services
versionOneRouter.get('/organizations/:orgId/services', getServices);
versionOneRouter.post('/organizations/:orgId/services', verifyToken, createService);
versionOneRouter.get('/organizations/:orgId/services/:serviceId', getService);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId',
   verifyToken, updateService
);
versionOneRouter.delete(
  '/organizations/:orgId/services/:serviceId',
  verifyToken, deleteService
);

// Comments
versionOneRouter.get('/organizations/:orgId/comments', getComments);
versionOneRouter.patch('/organizations/:orgId/comments', verifyToken, updateComments);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/comments',
  getComments
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/comments',
  verifyToken, updateComments
);

// Ratings
versionOneRouter.get('/organizations/:orgId/ratings', getRatings);
versionOneRouter.patch('/organizations/:orgId/ratings', verifyToken, updateRatings);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/ratings',
  getRatings
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/ratings',
  verifyToken, updateRatings
);

// Users
versionOneRouter.get('/users', getUsers);
versionOneRouter.post('/users', verifyToken, createUser);
versionOneRouter.get('/users/:userId', getUser);
versionOneRouter.patch('/users/:userId', verifyToken, updateUser);
versionOneRouter.delete('/users/:userId', verifyToken, deleteUser);
versionOneRouter.patch('/users/:userId/password', verifyToken, updateUserPassword);

// Ratings
versionOneRouter.get('/reviews', getReviews);
versionOneRouter.post('/reviews', createReview);
