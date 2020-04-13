import jwt from 'jsonwebtoken';
import _omit from 'lodash/omit';

const TOKEN_SIGNATURE = process.env.TOKEN_SIGNATURE || 'ssshhh';

/**
 * Uses object shorthand to create a query based on if the values exist
 * @param  {String} organizationId id of the organization
 * @param  {String} serviceId id of the service
 * @return {Object} A mongo query for entity fields
 */
export const getEntityQuery = ({organizationId, serviceId} = {}) => {
  const query = {};

  if (organizationId) {
    query.organizationId = organizationId;
  }

  if (serviceId) {
    query.serviceId = serviceId;
  }

  return query;
};

export const ITEM_PAGE_LIMIT = 20;

export const parsePageQuery = (page = '1') => {
  const parsedPage = parseInt(page);
  const limit = ITEM_PAGE_LIMIT;
  const offset = limit * (parsedPage - 1);

  return {limit, offset};
};

/**
 * Format a query to retrieve organizations
 * @param  {Object} name Name of organation
 * @param  {Object} page Page to retrieve
 * @param  {Object} properties Properties to search on
 * @return {Object} A mongo query for organizations
 */
export const getOrganizationQuery = ({name, page = '1', properties} = {}) => {
  const {limit, offset} = parsePageQuery(page);
  let query = {};

  if (name) {
    query.$text = {$search: name};
  }

  if (properties) {
    const props = properties.split(',').reduce((result, prop) => {
      const [name, value] = prop.split('=');

      result[`properties.${name}`] = value;

      return result;
    }, {});

    query.services = {$elemMatch: props};
  }

  return {params: {limit, offset}, query};
};

/**
 * Generate the slug of an item from its name
 * @param  {String} name
 * @return {String} slug
 */
export const generateSlug = (name) =>
  name?.split(' ')?.join('-')?.toLowerCase() || '';

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
  console.error(err);

  return res.status(500).json({error: true});
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
      exp: parseInt(expDate.getTime() / 1000),
    },
    TOKEN_SIGNATURE
  );
};

/**
 * Verify JWT
 * @param  {String} token Token to verify
 * @return {Promise} Returns a promise since jwt.verify is async
 */
export const verifyJWT = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, TOKEN_SIGNATURE, (err, decoded) => {
      if (err) {
        resolve({valid: false});
      }

      resolve({user: decoded, valid: true});
    });
  });
};

/*
Get JSON Web Token
*/
export const getToken = (req, res) => {
  var secret = 'secretkey';
  jwt.sign({id: req.id}, secret, {expiresIn: 86400}, (error, token) => { //jwt.sign(payload, secretOrPrivateKey, [options, callback])
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(token);
    };
  });
};
