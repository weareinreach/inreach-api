import {handleErr} from '../utils';
import {Organization} from '../utils/mongoose';

export const organizationDelete = async (req, res) => {
  const {orgId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findByIdAndDelete(orgId)
    .then(() => {
      // TODO: check and send 404
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationGet = async (req, res) => {
  const {orgId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(organization => {
      // TODO: check and send 404
      return res.json(organization);
    })
    .catch(err => handleErr(err, res));
};

export const organizationUpdate = async (req, res) => {
  const {orgId} = req?.params;
  const body = req?.body;

  // TODO: check for bad req and send 401

  await Organization.findOneAndUpdate({_id: orgId}, {$set: body})
    .then(() => {
      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsCreate = async (req, res) => {
  const body = req?.body;
  const org = new Organization(body);

  // TODO: check for bad req and send 401

  await org
    .save()
    .then(organization => {
      // TODO: check and send 404
      return res.json({created: true, organization});
    })
    .catch(err => handleErr(err, res));
};

export const organizationsGet = async (req, res) => {
  // TODO: pagination and other query params
  // TODO: check for bad req and send 401

  await Organization.find({})
    .then(organizations => {
      // TODO: check and send 404
      return res.json({organizations});
    })
    .catch(err => handleErr(err, res));
};

export const serviceGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(organization => {
      const service = organization.services.id(serviceId);

      // TODO: check and send 404
      return res.json(service);
    })
    .catch(err => handleErr(err, res));
};

export const servicesGet = async (req, res) => {
  const {orgId} = req?.params;

  // TODO: check for bad req and send 401

  await Organization.findById(orgId)
    .then(({services = []}) => {
      // TODO: check and send 404
      return res.json({services});
    })
    .catch(err => handleErr(err, res));
};
