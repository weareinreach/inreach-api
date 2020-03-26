import {
  ITEM_PAGE_LIMIT,
  getOrganizationQuery,
  handleBadRequest,
  handleErr,
  handleNotFound
} from '../utils';
import {Organization} from '../mongoose';

export const organizationDelete = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findByIdAndDelete(orgId)
    .then(() => {
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationGet = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findById(orgId)
    .then(organization => {
      if (!organization) {
        return handleNotFound(res);
      }

      return res.json(organization);
    })
    .catch(err => handleErr(err, res));
};

export const organizationUpdate = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;
  const updated_at = Date.now();

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findOneAndUpdate(
    {_id: orgId},
    {$set: {...body, updated_at}}
  )
    .then(doc => {
      if (!doc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsCreate = async (req, res) => {
  const body = req?.body;
  const org = new Organization(body);

  if (!body) {
    return handleBadRequest(res);
  }

  await org
    .save()
    .then(organization => {
      return res.json({created: true, organization});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsGet = async (req, res) => {
  const {params, query} = getOrganizationQuery(req?.query);

  await Organization.find(query)
    .sort({updated_at: -1})
    .skip(params.offset)
    .limit(params.limit)
    .then(organizations => {
      return res.json({organizations});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsGetCount = async (req, res) => {
  const {query} = getOrganizationQuery(req?.query);

  await Organization.countDocuments(query)
    .then(count => {
      const pages = Math.ceil(count / ITEM_PAGE_LIMIT);

      return res.json({count, pages});
    })
    .catch(err => handleErr(err, res));
};

export const serviceDelete = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  await Organization.findById(orgId)
    .then(organization => {
      if (!organization) {
        return handleNotFound(res);
      }

      return organization.services
        .id(serviceId)
        .remove()
        .then(() => {
          return res.json({deleted: true});
        })
        .catch(err => handleErr(err, res));
    })
    .catch(err => handleErr(err, res));
};

export const serviceGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  await Organization.findById(orgId)
    .then(orgDoc => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      const serviceDoc = orgDoc.services.id(serviceId);

      if (!serviceDoc) {
        return handleNotFound(res);
      }

      const service = {
        ...(serviceDoc?.toJSON() || {}),
        organization: {
          ...(orgDoc?.toJSON() || {}),
          services: undefined
        }
      };

      return res.json(service);
    })
    .catch(err => handleErr(err, res));
};

export const serviceUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const body = req?.body;
  const updated_at = Date.now();

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findOneAndUpdate(
    {_id: orgId, 'services._id': serviceId},
    {$set: {'services.$': {...body, _id: serviceId, updated_at}}}
  )
    .then(orgDoc => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const servicesCreate = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findById(orgId)
    .then(organization => {
      if (!organization) {
        return handleNotFound(res);
      }

      organization.services.push(body);

      return organization
        .save()
        .then(() => {
          return res.json({created: true});
        })
        .catch(err => handleErr(err, res));
    })
    .catch(err => handleErr(err, res));
};

export const servicesGet = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findById(orgId)
    .then(orgDoc => {
      if (!orgDoc) {
        return handleNotFound(res);
      }

      const services = orgDoc?.services || [];

      return res.json({services});
    })
    .catch(err => handleErr(err, res));
};
