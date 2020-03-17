import {handleErr} from '../utils';
import {Organization} from '../utils/mongoose';

export const organizationDelete = async (req, res) => {
  const {orgId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findByIdAndDelete(orgId)
    .then(() => {
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationGet = async (req, res) => {
  const {orgId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(organization => {
      return res.json(organization);
    })
    .catch(err => handleErr(err, res));
};

export const organizationUpdate = async (req, res) => {
  const {orgId} = req?.params;

  // TODO: check for bad req and send 401

  res.json({udpated: true});
};

export const organizationsCreate = async (req, res) => {
  const body = req?.body;
  const org = new Organization(body);

  // TODO: check for bad req and send 401

  await org
    .save()
    .then(organization => {
      return res.json({created: true, organization});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsGet = async (req, res) => {
  // TODO: pagination and other query params
  // TODO: check for bad req and send 401

  await Organization.find({})
    .then(organizations => {
      return res.json(organizations);
    })
    .catch(err => handleErr(err, res));
};

export const serviceDelete = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(organization => {
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

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(organization => {
      const service = organization.services.id(serviceId);

      return res.json(service);
    })
    .catch(err => handleErr(err, res));
};

export const serviceUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const body = req?.body;

  // TODO: check for bad req and send 401

  await Organization.findOneAndUpdate(
    {_id: orgId, 'services._id': serviceId},
    {$set: body}
  )
    .then(organization => {
      return organization.services
        .push(body)
        .save()
        .then(() => {
          return res.json({updated: true});
        })
        .catch(err => handleErr(err, res));
    })
    .catch(err => handleErr(err, res));
};

export const servicesCreate = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(organization => {
      return organization.services
        .push(body)
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

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(({services = []}) => {
      return res.json({services});
    })
    .catch(err => handleErr(err, res));
};
