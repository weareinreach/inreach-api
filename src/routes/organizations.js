import {
  ITEM_PAGE_LIMIT,
  getOrganizationQuery,
  handleBadRequest,
  handleErr,
  handleNotFound
} from '../utils';
import {Organization} from '../mongoose';

export const getOrgs = async (req, res) => {
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

export const getOrgsCount = async (req, res) => {
  const {query} = getOrganizationQuery(req?.query);

  await Organization.countDocuments(query)
    .then(count => {
      const pages = Math.ceil(count / ITEM_PAGE_LIMIT);

      return res.json({count, pages});
    })
    .catch(err => handleErr(err, res));
};

export const createOrg = async (req, res) => {
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

export const deleteOrg = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findByIdAndDelete(orgId)
    .then(() => {
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const getOrg = async (req, res) => {
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

export const updateOrg = async (req, res) => {
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
