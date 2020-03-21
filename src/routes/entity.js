import {getEntityQuery, handleBadRequest, handleErr} from '../utils';
import {Comment, Rating} from '../utils/mongoose';

export const commentsGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  await Comment.findOne(query)
    .then(({comments = []}) => {
      // TODO: check and send 404
      return res.json({comments});
    })
    .catch(err => handleErr(err, res));
};

export const commentsUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const {comment, source, userId} = req?.body;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  if (!comment) {
    return handleBadRequest(res);
  }

  await Comment.updateOne(
    query,
    {$push: {comments: {comment, source, userId}}},
    {upsert: true}
  )
    .then(() => {
      // TODO: check and send 404
      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};

export const ratingsGet = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  await Rating.findOne(query)
    .then(({ratings = []}) => {
      const average = 0;
      // TODO: check and send 404
      // TODO: return the average rating
      return res.json({average_rating: average, ratings});
    })
    .catch(err => handleErr(err, res));
};

export const ratingsUpdate = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const {rating, source, userId} = req?.body;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  if (!rating) {
    return handleBadRequest(res);
  }

  await Rating.updateOne(
    query,
    {$push: {ratings: {rating, source, userId}}},
    {upsert: true}
  )
    .then(() => {
      // TODO: check and send 404
      return res.json({updated: true});
    })
    .catch(err => handleErr(err, res));
};
