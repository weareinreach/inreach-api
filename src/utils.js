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

export const ORG_PAGE_LIMIT = 20;

/**
 * Format a query to retrieve organizations
 * @param  {Object} name Name of organation
 * @param  {Object} page Page to retrieve
 * @param  {Object} properties Properties to search on
 * @return {Object} A mongo query for organizations
 */
export const getOrganizationQuery = ({name, page = '1', properties} = {}) => {
  const parsedPage = parseInt(page);
  const limit = ORG_PAGE_LIMIT;
  const offset = limit * (parsedPage - 1);

  let query = {};

  if (name) {
    query.$text = {$search: name};
  }

  if (properties) {
    const props = properties.split(',').reduce((result, prop) => {
      result[`properties.${prop}`] = 'true';

      return result;
    }, {});

    query.services = {$elemMatch: props};
  }

  return {params: {limit, offset}, query};
};

/**
 * Returns a 400 status
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleBadRequest = res => {
  return res.status(400).json({error: true});
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
