import {Comment, Rating} from '../mongoose';
import {
  getEntityQuery,
  handleBadRequest,
  handleErr,
  handleNotFound,
} from '../utils';

export const getComments = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  await Comment.findOne(query)
    .then((doc) => {
      if (!doc) {
        return handleNotFound(res);
      }

      const {comments = []} = doc;

      if (!doc) {
        return handleNotFound(res);
      }
      return res.json({comments});
    })
    .catch((err) => handleErr(err, res));
};

export const updateComments = async (req, res) => {
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
    .then((doc) => {
      if (!doc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch((err) => handleErr(err, res));
};

export const getRatings = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  await Rating.findOne(query)
    .then((doc) => {
      if (!doc) {
        return handleNotFound(res);
      }

      const average = 0;
      const {ratings = []} = doc;

      return res.json({average_rating: average, ratings});
    })
    .catch((err) => handleErr(err, res));
};

export const updateRatings = async (req, res) => {
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
    .then((doc) => {
      if (!doc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch((err) => handleErr(err, res));
};
