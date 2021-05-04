import {Organization, Review} from '../mongoose';
import {handleBadRequest, handleErr, isBodyEmpty} from '../utils';
import {parsePageQuery} from '../utils/query';

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

	if (isBodyEmpty(body)) {
		return handleBadRequest(res);
	}

	const review = new Review(body);

	await review
		.save()
		.then(() => {
			return res.json({created: true});
		})
		.catch((err) => handleErr(err, res));
};

export const deleteReviewById = async (req, res) => {
	const {reviewId} = req?.params;

	Review.findByIdAndDelete(reviewId)
		.then(() => {
			return res.json({deleted: true});
		})
		.catch((err) => handleErr(err, res));
};
