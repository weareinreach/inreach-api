import {
  handleBadRequest,
  handleErr,
  handleNotFound,
  orderServices,
} from '../utils';
import {
  ITEM_PAGE_LIMIT,
  getOrganizationQuery,
  parsePageQuery,
} from '../utils/query';
import {Organization} from '../mongoose';

export const getOrgs = async (req, res) => {
  const {limit, offset} = parsePageQuery(req?.query?.page);
  const query = getOrganizationQuery(req?.query);
  const sortObjectArray = query['services']['$elemMatch']['$or'];

  var nestedNameArray = sortObjectArray.map(function (el) {
    return Object.getOwnPropertyNames(el);
  });
  var nameArray = nestedNameArray.flat([1]);
  var prioritySortArray = [];

  for (var i = 0; i < nameArray.length; i++) {
    if (nameArray[i].includes('county')) {
      if (nameArray.length > 0) {
        prioritySortArray[0] = nameArray[i];
      }
    } else if (nameArray[i].includes('state')) {
      if (nameArray.length > 1) {
        prioritySortArray[1] = nameArray[i];
      }
    } else if (nameArray[i].includes('national')) {
      if (nameArray.length > 2) {
        prioritySortArray[2] = nameArray[i];
      }
    }
  }
  var prioritySort = prioritySortArray.filter(function (el) {
    return el != null;
  });
  const obj = {};

  for (const key of prioritySort) {
    obj[key] = -1;
  }

  await Organization.find(query)
    .sort(obj)
    .skip(offset)
    .limit(limit)
    .then((organizations) => {
      return res.json({
        organizations,
      });
    })
    .catch((err) => handleErr(err, res));
};

export const getOrgsCount = async (req, res) => {
  const query = getOrganizationQuery(req?.query);

  await Organization.countDocuments(query)
    .then((count) => {
      const pages = Math.ceil(count / ITEM_PAGE_LIMIT);

      return res.json({count, pages});
    })
    .catch((err) => handleErr(err, res));
};

export const createOrg = async (req, res) => {
  const body = req?.body;
  const org = new Organization(body);

  if (!body) {
    return handleBadRequest(res);
  }

  await org
    .save()
    .then((organization) => {
      return res.json({created: true, organization});
    })
    .catch((err) => handleErr(err, res));
};

export const deleteOrg = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findByIdAndDelete(orgId)
    .then(() => {
      return res.json({deleted: true});
    })
    .catch((err) => handleErr(err, res));
};

export const getOrg = async (req, res) => {
  const {orgId} = req?.params;

  await Organization.findById(orgId)
    .then((organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      organization.services = orderServices(organization.services);

      return res.json(organization);
    })
    .catch((err) => handleErr(err, res));
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
    .then((doc) => {
      if (!doc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch((err) => handleErr(err, res));
};

export const getOrgBySlug = async (req, res) => {
  const {orgSlug} = req?.params;

  await Organization.findOne({slug: orgSlug})
    .then((organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      return res.json(organization);
    })
    .catch((err) => handleErr(err, res));
};

export const createOrgOwner = async (req, res) => {
  const {orgId} = req?.params;
  const {email, userId} = req?.body;

  if (!email || !userId) {
    return handleBadRequest(res);
  }

  await Organization.findById(orgId)
    .then(async (organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      const newOwner = {email, isApproved: false, userId};

      if (organization.owners) {
        organization.owners.push(newOwner);
      } else {
        organization.owners = [newOwner];
      }

      await organization
        .save()
        .then(() => res.json({created: true}))
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};

export const approveOrgOwner = async (req, res) => {
  const {orgId, userId} = req?.params;

  await Organization.findById(orgId)
    .then(async (organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      const ownerIndex = organization.owners.findIndex(
        (owner) => owner.userId === userId
      );

      if (ownerIndex === -1) {
        return handleNotFound(res);
      }

      organization.owners[ownerIndex].isApproved = true;

      await organization
        .save()
        .then(() => res.json({updated: true}))
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};

export const deleteOrgOwner = async (req, res) => {
  const {orgId, userId} = req?.params;

  await Organization.findById(orgId)
    .then(async (organization) => {
      if (!organization) {
        return handleNotFound(res);
      }

      const ownerIndex = organization.owners.findIndex(
        (owner) => owner.userId === userId
      );

      if (ownerIndex === -1) {
        return handleNotFound(res);
      }

      organization.owners[ownerIndex].remove();

      await organization
        .save()
        .then(() => res.json({deleted: true}))
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};
