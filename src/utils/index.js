import jwt from 'jsonwebtoken';
import _omit from 'lodash/omit';
import _orderBy from 'lodash/orderBy';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

import config from './config';

const {tokenSignature} = config;

export const formatService = (service, org) => {
	// eslint-disable-next-line no-unused-vars
	const {services, ...restOrg} = org;
	const formattedService = {
		...service,
		organization: {...restOrg}
	};

	return formattedService;
};

export const orderServices = (services) => {
	// TODO: places orgs with no value first
	return _orderBy(services, ['updated_at'], ['desc']);
};

/**
 * Remove sensitive user information
 * @param  {Object} user User info
 * @return {Object} Sanitized user info
 */
export const removeUserInfo = (user) => {
	return _omit(user, ['hash', 'password', 'salt']);
};

/**
 * Returns a 400 status
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleBadRequest = (res) => {
	return res.status(400).json({error: true});
};

/**
 * Returns a 404 status
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleNotFound = (res) => {
	return res.status(404).json({notFound: true});
};

/**
 * Logs the error and then return a 500 status
 * @param  {Object} err an error object
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleErr = (err, res) => {
	// eslint-disable-next-line
	const message = err.message ? err.message : 'Unspecified server error';
	return res.status(500).json({error: true, message: message});
};

/**
 * Generate a JWT with user information
 * @param  {Object} user
 * @return {String} jwt
 */
export const generateJWT = (user) => {
	const today = new Date();
	const expDate = new Date(today);

	expDate.setDate(today.getDate() + 14);

	return jwt.sign(
		{
			...user,
			exp: parseInt(expDate.getTime() / 1000)
		},
		tokenSignature
	);
};

/**
 * Verify JWT
 * @param  {String} token Token to verify
 * @return {Promise} Returns a promise since jwt.verify is async
 */
export const verifyJWT = (token) => {
	return new Promise((resolve) => {
		jwt.verify(token, tokenSignature, (err, decoded) => {
			if (err) {
				resolve({valid: false});
			}

			resolve({user: decoded, valid: true});
		});
	});
};

/**
 * Verify payload body is empty
 * @param {} body payload body object to verify if empty or not
 * @return {true|false} returns boolean, either is empty or not
 */
export const isBodyEmpty = (body) => {
	return Object.keys(body).length === 0;
};

/**
 * Verify that ID passed by is a valid ObjectID
 *  to be used in aggregate functions
 */
export const isValidObjectId = (id) => {
	return ObjectId.isValid(id);
};
