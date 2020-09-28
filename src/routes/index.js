import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import {getToken} from './auth';
import {
  createSuggestions,
  deleteSuggestion,
  getComments,
  getRatings,
  getSuggestions,
  updateComments,
  updateRatings,
} from './entity';
import {
  approveOrgOwner,
  createOrg,
  createOrgOwner,
  deleteOrg,
  deleteOrgOwner,
  getOrg,
  getOrgBySlug,
  getOrgs,
  getOrgsCount,
  updateOrg,
  sendOrgOwnerStatus,
  getOrgsByName,
} from './organizations';
import {getReviews, createReview} from './reviews';
import {
  createService,
  deleteService,
  getService,
  getServiceBySlug,
  getServices,
  getServicesCount,
  updateService,
} from './services';
import {getStaticPage} from './static';
import {
  addUserListItem,
  authUser,
  checkUserToken,
  createUser,
  createUserList,
  deleteUser,
  getUser,
  getUsers,
  getUsersCount,
  removeUserListItem,
  updateUser,
  updateUserPassword,
} from './users';
import swaggerDocument from '../swagger.json';
import verifyToken from '../middleware/verifyToken';
import {generatePasswordResetMail} from '../utils/sendMail';

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
versionOneRouter.get('/organizations/name/:name', getOrgsByName);
versionOneRouter.patch('/organizations/:orgId', verifyToken, updateOrg);
versionOneRouter.delete('/organizations/:orgId', verifyToken, deleteOrg);
versionOneRouter.post(
  '/organizations/:orgId/owners',
  verifyToken,
  createOrgOwner
);
versionOneRouter.get(
  '/organizations/:orgId/owners/:userId/approve',
  verifyToken,
  approveOrgOwner
);
versionOneRouter.delete(
  '/organizations/:orgId/owners/:userId',
  verifyToken,
  deleteOrgOwner
);
versionOneRouter.post('/mail', sendOrgOwnerStatus);

// Services
versionOneRouter.get('/services/count', getServicesCount);
versionOneRouter.get('/organizations/:orgId/services', getServices);
versionOneRouter.post(
  '/organizations/:orgId/services',
  verifyToken,
  createService
);
versionOneRouter.get('/organizations/:orgId/services/:serviceId', getService);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId',
  verifyToken,
  updateService
);
versionOneRouter.delete(
  '/organizations/:orgId/services/:serviceId',
  verifyToken,
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
versionOneRouter.patch(
  '/organizations/:orgId/comments',
  verifyToken,
  updateComments
);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/comments',
  getComments
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/comments',
  verifyToken,
  updateComments
);

// Ratings
versionOneRouter.get('/organizations/:orgId/ratings', getRatings);
versionOneRouter.patch(
  '/organizations/:orgId/ratings',
  verifyToken,
  updateRatings
);
versionOneRouter.get(
  '/organizations/:orgId/services/:serviceId/ratings',
  getRatings
);
versionOneRouter.patch(
  '/organizations/:orgId/services/:serviceId/ratings',
  verifyToken,
  updateRatings
);

// Suggestions
versionOneRouter.get('/suggestions', getSuggestions);
versionOneRouter.post('/suggestions', createSuggestions);
versionOneRouter.delete('/suggestions/:suggestionId', deleteSuggestion);

// Users
versionOneRouter.get('/users', verifyToken, getUsers);
versionOneRouter.post('/users', verifyToken, createUser);
versionOneRouter.get('/users/count', verifyToken, getUsersCount);
versionOneRouter.get('/users/:userId', verifyToken, getUser);
versionOneRouter.patch('/users/:userId', verifyToken, updateUser);
versionOneRouter.delete('/users/:userId', verifyToken, deleteUser);
versionOneRouter.patch(
  '/users/:userId/password',
  verifyToken,
  updateUserPassword
);
versionOneRouter.post('/users/:userId/lists', verifyToken, createUserList);
versionOneRouter.post(
  '/users/:userId/lists/:listId/items',
  verifyToken,
  addUserListItem
);
versionOneRouter.delete(
  '/users/:userId/lists/:listId/items/:itemId',
  verifyToken,
  removeUserListItem
);
versionOneRouter.post('/users/forgotPassword', generatePasswordResetMail);

// Reviews
versionOneRouter.get('/reviews', getReviews);
versionOneRouter.post('/reviews', createReview);

// Static
versionOneRouter.get('/static/:pageId', getStaticPage);