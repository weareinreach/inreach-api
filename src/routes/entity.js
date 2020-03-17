import {getEntityQuery, handleErr} from '../utils';
import {Comment, Rating} from '../utils/mongoose';

export const commentsGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  // TODO: check for bad req and send 401

  await Comment.findOne(query)
    .then(({comments = []}) => {
      return res.json({comments});
    })
    .catch(err => handleErr(err, res));
};

export const commentsUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const {comment, source, userId} = req?.body;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  // TODO: check for bad req and send 401

  await Comment.updateOne(
    query,
    {$push: {comments: {comment, source, userId}}},
    {upsert: true}
  )
    .then(() => {
      res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const ratingsGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  // TODO: check for bad req and send 401

  await Rating.findOne(query)
    .then(({ratings = []}) => {
      const average = 0;
      // TODO: return the average rating
      return res.json({rating: average, ratings});
    })
    .catch(err => handleErr(err, res));
};

export const ratingsUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const {rating, source, userId} = req?.body;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  // TODO: check for bad req and send 401

  await Rating.updateOne(
    query,
    {$push: {ratings: {rating, source, userId}}},
    {upsert: true}
  )
    .then(() => {
      res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};
