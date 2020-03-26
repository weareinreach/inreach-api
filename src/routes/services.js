import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {Organization} from '../mongoose';

export const getServices = async (req, res) => {
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

export const createService = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  await Organization.findById(orgId)
    .then(async organization => {
      if (!organization) {
        return handleNotFound(res);
      }

      organization.services.push(body);

      await organization
        .save()
        .then(() => {
          return res.json({created: true});
        })
        .catch(err => handleErr(err, res));
    })
    .catch(err => handleErr(err, res));
};

export const deleteService = async (req, res) => {
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

export const getService = async (req, res) => {
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

export const updateService = async (req, res) => {
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
