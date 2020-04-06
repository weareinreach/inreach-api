import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import {getComments, getRatings, updateComments, updateRatings} from './entity';
import {
  createOrg,
  deleteOrg,
  getOrg,
  getOrgBySlug,
  getOrgs,
  getOrgsCount,
  updateOrg,
} from './organizations';
import {getReviews, createReview} from './reviews';
import {
  createService,
  deleteService,
  getService,
  getServiceBySlug,
  getServices,
  updateService,
} from './services';
import {getStaticPage} from './static';
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

export const baseRouter = Router();
export const versionOneRouter = Router();

baseRouter.get('/', (req, res) => res.json({ok: true}));
baseRouter.use('/docs', swaggerUi.serve);
baseRouter.get('/docs', swaggerUi.setup(swaggerDocument));

// Auth
versionOneRouter.post('/auth', authUser);
versionOneRouter.post('/auth/check', checkUserToken);

// Organizations
versionOneRouter.get('/organizations', getOrgs);
versionOneRouter.post('/organizations', createOrg);
versionOneRouter.get('/organizations/count', getOrgsCount);

versionOneRouter.get('/organizations/:orgId', getOrg);
versionOneRouter.patch('/organizations/:orgId', updateOrg);
versionOneRouter.delete('/organizations/:orgId', deleteOrg);

// Services
versionOneRouter.get('/organizations/:orgId/services', getServices);
versionOneRouter.post('/organizations/:orgId/services', createService);
versionOneRouter.get('/organizations/:orgId/services/:serviceId', getService);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId',
  updateService
);
versionOneRouter.delete(
  '/organizations/:orgId/services/:serviceId',
  deleteService
);

// Slug
versionOneRouter.get('/slug/organizations/:orgSlug', getOrgBySlug);
versionOneRouter.get(
  '/slug/organizations/:orgSlug/services/:serviceSlug',
  getServiceBySlug
);

// Comments
versionOneRouter.get('/organizations/:orgId/comments', getComments);
versionOneRouter.patch('/organizations/:orgId/comments', updateComments);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/comments',
  getComments
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/comments',
  updateComments
);

// Ratings
versionOneRouter.get('/organizations/:orgId/ratings', getRatings);
versionOneRouter.patch('/organizations/:orgId/ratings', updateRatings);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/ratings',
  getRatings
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/ratings',
  updateRatings
);

// Users
versionOneRouter.get('/users', getUsers);
versionOneRouter.post('/users', createUser);
versionOneRouter.get('/users/:userId', getUser);
versionOneRouter.patch('/users/:userId', updateUser);
versionOneRouter.delete('/users/:userId', deleteUser);
versionOneRouter.patch('/users/:userId/password', updateUserPassword);

// Reviews
versionOneRouter.get('/reviews', getReviews);
versionOneRouter.post('/reviews', createReview);

// Static
versionOneRouter.get('/static/:pageId', getStaticPage);
