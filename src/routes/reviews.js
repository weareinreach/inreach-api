import {Review} from '../mongoose';
import {handleBadRequest, handleErr, parsePageQuery} from '../utils';

export const getReviews = async (req, res) => {
  const {page} = req?.query;
  const {limit, offset} = parsePageQuery(page);

  await Review.find({})
    .sort({created_at: -1})
    .skip(offset)
    .limit(limit)
    .then((reviews) => {
      return res.json({reviews});
    })
    .catch((err) => handleErr(err, res));
};

export const createReview = async (req, res) => {
  const body = req?.body;
  const review = new Review(body);

  if (!body) {
    return handleBadRequest(res);
  }

  await review
    .save()
    .then(() => {
      return res.json({created: true});
    })
    .catch((err) => handleErr(err, res));
};
