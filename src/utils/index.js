/**
 * Uses object shorthand to create a query based on if the values exist
 * @param  {[type]} organizationId [description]
 * @param  {[type]} serviceId      [description]
 * @return {[type]}                [description]
 */
export const getEntityQuery = ({organizationId, serviceId}) => {
  const query = {};

  if (organizationId) {
    query.organizationId = organizationId;
  }

  if (serviceId) {
    query.serviceId = serviceId;
  }

  return query;
};

export const handleBadRequest = res => {
  return res.status(400).json({error: true});
};

/**
 * [handleErr description]
 * @param  {[type]} err [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
export const handleErr = (err, res) => {
  console.error(err);

  return res.status(500).json({error: true});
};
