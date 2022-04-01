import {Router} from 'express';
import swaggerUi from 'swagger-ui-express';

import {getToken} from './auth';
import {
	createSuggestions,
	deleteSuggestion,
	getComments,
	getRatings,
	deleteRatingById,
	getSuggestions,
	getUserSuggestionsByEmail,
	updateComments,
	deleteCommentById,
	updateRatings
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
	shareOrganization
} from './organizations';
import {getReviews, createReview, deleteReviewById} from './reviews';
import {
	createService,
	deleteService,
	getService,
	getServiceBySlug,
	getServices,
	getServicesCount,
	updateService
} from './services';
import {getStaticPage} from './static';
import {
	addUserListItem,
	authUser,
	checkUserToken,
	createUser,
	createUserList,
	deleteUserList,
	deleteUser,
	getUser,
	getUsers,
	getUsersCount,
	removeUserListItem,
	updateUser,
	updateUserPassword,
	addSharedUser,
	getuserList
} from './users';
import swaggerDocument from '../swagger.json';
import verifyToken from '../middleware/verifyToken';
import {generatePasswordResetMail} from '../utils/sendMail';
import {
	getVerifiedOrgsCountryCount,
	getServicesCountryCount,
	getOrgsWithNationalServices,
	getServicesWithNationalServices,
	getOrgsByStateInCountry,
	getServicesByStateInCountry,
	getServicesByCategories
} from './reporting';
export const baseRouter = Router();
export const versionOneRouter = Router();

//Basic/Swagger - Automation Tested
baseRouter.get('/', (req, res) => res.json({ok: true}));
baseRouter.use('/docs', swaggerUi.serve);
baseRouter.get('/docs', swaggerUi.setup(swaggerDocument));

// Auth - Automation Tested
versionOneRouter.post('/auth', authUser);
versionOneRouter.post('/auth/check', checkUserToken);
versionOneRouter.get('/auth/token', getToken);

// Organizations - Automation Tested
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
versionOneRouter.post(
	'/organizations/:orgId/share',
	verifyToken,
	shareOrganization
);
versionOneRouter.get(
	'/organizations/:orgId/owners/:userId/approve',
	verifyToken,
	approveOrgOwner
); //This should be a patch, not a get
versionOneRouter.delete(
	'/organizations/:orgId/owners/:userId',
	verifyToken,
	deleteOrgOwner
);
versionOneRouter.post('/mail', sendOrgOwnerStatus);

// Services - Automation Tested
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

// Slug - Automation tested
versionOneRouter.get('/slug/organizations/:orgSlug', getOrgBySlug);
versionOneRouter.get(
	'/slug/organizations/:orgSlug/services/:serviceSlug',
	getServiceBySlug
);

// Comments - Partially Automation tested
versionOneRouter.get('/organizations/:orgId/comments', getComments);
versionOneRouter.patch(
	'/organizations/:orgId/comments',
	verifyToken,
	updateComments
);
versionOneRouter.delete(
	'/organizations/:orgId/comments/:commentId',
	deleteCommentById
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
versionOneRouter.delete(
	'/organizations/:orgId/services/:serviceId/comments/:commentId',
	deleteCommentById
);

// Ratings - Automation tested
versionOneRouter.get('/organizations/:orgId/ratings', getRatings);
versionOneRouter.delete(
	'/organizations/:orgId/ratings/:ratingId',
	deleteRatingById
);
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

// Suggestions - Automated Tested
versionOneRouter.get('/suggestions', getSuggestions);
versionOneRouter.post('/suggestions', createSuggestions);
versionOneRouter.delete('/suggestions/:suggestionId', deleteSuggestion);
versionOneRouter.get('/suggestions/:email', getUserSuggestionsByEmail);

// Users - Automated Tested
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
versionOneRouter.delete(
	'/users/:userId/lists/:listId',
	verifyToken,
	deleteUserList
);
versionOneRouter.post(
	'/users/:userId/lists/:listId/items',
	verifyToken,
	addUserListItem
);
versionOneRouter.post(
	'/users/:userId/lists/:listId/share',
	verifyToken,
	addSharedUser
);
versionOneRouter.delete(
	'/users/:userId/lists/:listId/items/:itemId',
	verifyToken,
	removeUserListItem
);
versionOneRouter.get('/users/lists/:listId', verifyToken, getuserList);
versionOneRouter.post('/users/forgotPassword', generatePasswordResetMail);

//Reporting- Automation Tested
versionOneRouter.get(
	'/reporting/:country/organizations/count',
	getVerifiedOrgsCountryCount
);
versionOneRouter.get(
	'/reporting/:country/services/count',
	getServicesCountryCount
);
versionOneRouter.get(
	'/reporting/:country/nationalOrgs',
	getOrgsWithNationalServices
);
versionOneRouter.get(
	'/reporting/:country/nationalServices',
	getServicesWithNationalServices
);
versionOneRouter.get(
	'/reporting/:country/orgsByState',
	getOrgsByStateInCountry
);
versionOneRouter.get(
	'/reporting/:country/servicesByState',
	getServicesByStateInCountry
);
versionOneRouter.get('/reporting/:country/categories', getServicesByCategories);

// Reviews - Partially Automation Tested
versionOneRouter.get('/reviews', getReviews);
versionOneRouter.post('/reviews', createReview);
versionOneRouter.delete('/reviews/:reviewId', deleteReviewById);

// Static -  Automation Tested
versionOneRouter.get('/static/:pageId', getStaticPage);
