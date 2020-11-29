import {Organization} from '../mongoose';
import {handleBadRequest, handleErr} from '../utils';

const createCountryQuery = (country) => {
  let countryString = `services.tags.${country}`;
  let queryString = {};
  queryString['$and'] = [];
  let exists = {},
    not = {},
    notEqual = {};
  exists[countryString] = {$exists: true};
  not[countryString] = {$not: {$size: 0}};
  notEqual[countryString] = {$ne: {}};
  queryString['$and'].push(exists);
  queryString['$and'].push(not);
  queryString['$and'].push(notEqual);
  queryString['$and'].push({is_published: true});
  return queryString;
};
export const getVerifiedOrgsCountryCount = async (req, res) => {
  if (!req?.params?.country) return handleBadRequest(res);
  try {
    const {country} = req.params;
    let queryString = createCountryQuery(country);
    const count = await Organization.countDocuments(queryString);
    return res.json({count: count || 0});
  } catch (err) {
    handleErr(err);
  }
};

export const getServicesCountryCount = async (req, res) => {
  if (!req?.params?.country) return handleBadRequest(res);
  try {
    const {country} = req.params;
    let queryString = createCountryQuery(country);
    const count = await Organization.aggregate([
      {$match: queryString},
      {$unwind: '$services'},
      {$count: 'services'},
    ]);
    return res.json({count: count[0].services || 0});
  } catch (err) {
    handleErr(err);
  }
};
