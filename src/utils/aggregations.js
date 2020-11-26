import {handleErr} from '.';
import {Organization} from '../mongoose';

export const getVerifiedOrgsByCountryCount = async (country) => {
  try {
    if (country.trim() !== '') {
      let query = {};
      query[`services.tags.${country}`] = {$exists: true};
      query['is_published'] = true;
      const result = await Organization.aggregate([
        {
          $match: query,
        },
        {
          $project: {
            _id: 0,
            name: 1,
            properties: 1,
            'service-area': {
              $objectToArray: '$properties',
            },
          },
        },
        {
          $unwind: {path: '$service-area'},
        },
        {
          $match: {
            'service-area.k': {
              $regex: '^service-*',
              $options: 'i',
            },
          },
        },
        {
          $group: {
            _id: '$name',
            areas: {
              $addToSet: '$service-area.k',
            },
          },
        },
        {
          $count: 'count',
        },
      ]);
      return result;
    } else handleErr();
  } catch (err) {
    handleErr();
  }
};
