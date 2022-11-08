import {Comment, Rating, Suggestion} from '../mongoose';
import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {getEntityQuery, ITEM_PAGE_LIMIT} from '../utils/query';
import {isBodyEmpty} from '../utils/index';

export const getComments = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const query = getEntityQuery({organizationId: orgId, serviceId});

	await Comment.findOne(query)
		.then((doc) => {
			const {comments = []} = doc || {};

			return res.json({comments});
		})
		.catch((err) => handleErr(err, res));
};

export const getCommentsByUserId = async (req, res) => {
	const userId = req?.params.userId;
	// const query = [
	// 	{
	// 		$unwind: {
	// 			path: '$comments'
	// 		}
	// 	},
	// 	{
	// 		$match: {
	// 			'comments.userId': userId
	// 		}
	// 	}
	// ];

	const query = [
		{
			$unwind: {
				path: '$comments'
			}
		},
		{
			$match: {
				'comments.userId': '633cb7fe0c2967d66fbc9623'
			}
		},
		{
			$addFields: {
				orgObjectId: {
					$toObjectId: '$organizationId'
				},
				serviceObjectId: {
					$toObjectId: '$serviceId'
				}
			}
		},
		{
			$lookup: {
				from: 'organizations',
				localField: 'orgObjectId',
				foreignField: '_id',
				as: 'organization'
			}
		},
		{
			$unwind: {
				path: '$organization'
			}
		},
		{
			$addFields: {
				serviceObject: {
					$arrayElemAt: [
						'$organization.services',
						{
							$indexOfArray: ['$organization.services._id', '$serviceObjectId']
						}
					]
				}
			}
		},
		{
			$project: {
				_id: 1,
				organizationObjectId: 1,
				organizationName: '$organization.name',
				serviceObjectId: 1,
				serviceName: '$serviceObject.name',
				comments: 1
			}
		}
	];

	await Comment.aggregate(query)
		.then((data) => {
			return res.json({comments: data});
		})
		.catch((err) => handleErr(err, res));
};

export const deleteCommentById = async (req, res) => {
	const {orgId, serviceId, commentId} = req?.params;
	const query = getEntityQuery({organizationId: orgId, serviceId: serviceId});

	await Comment.findOne(query)
		.then((comments) => {
			comments.comments.id(commentId).remove();
			comments
				.save()
				.then(() => {
					return res.json({deleted: true});
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => {
			//console.log(err);
			return handleNotFound(res);
		});
};

export const updateCommentById = async (req, res) => {
	const {orgId, serviceId, commentId} = req?.params;
	const body = req?.body;
	body.updated_at = Date.now();

	if (isBodyEmpty(body)) {
		return handleBadRequest(res);
	}

	await Comment.findOneAndUpdate(
		{'comments._id': commentId},
		{$set: {'comments.$': {...body}}},
		{upsert: true, new: true}
	)
		.then((commentDoc) => {
			if (!commentDoc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => {
			console.log(err);
			handleErr(err, res);
		});
};

export const updateComments = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const {comment, source, userId, userLocation, isUserApproved} = req?.body;
	const query = getEntityQuery({organizationId: orgId, serviceId});

	if (!comment) {
		return handleBadRequest(res);
	}

	await Comment.updateOne(
		query,
		{
			$push: {comments: {comment, source, userId, userLocation, isUserApproved}}
		},
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
			const {ratings = []} = doc || {};
			let average = ratings.reduce((result, {rating}) => {
				result += rating;

				return result;
			}, 0);

			average = Math.ceil(average / ratings.length);

			return res.json({average_rating: average, ratings});
		})
		.catch((err) => handleErr(err, res));
};

export const deleteRatingById = async (req, res) => {
	const {orgId, serviceId, ratingId} = req?.params;
	const query = getEntityQuery({organizationId: orgId, serviceId: serviceId});

	await Rating.findOne(query)
		.then((ratings) => {
			ratings.ratings.id(ratingId).remove();
			ratings
				.save()
				.then(() => {
					return res.json({deleted: true});
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => {
			//console.log(err);
			return handleNotFound(res);
		});
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

export const createSuggestions = async (req, res) => {
	const {suggestions} = req?.body;

	const invalidSuggestions =
		suggestions?.length < 1 ||
		suggestions?.some(
			(suggestion) =>
				!suggestion?.organizationId ||
				!suggestion?.userEmail ||
				!suggestion?.field ||
				!suggestion?.value
		);

	if (!suggestions || invalidSuggestions) {
		return handleBadRequest(res);
	}

	await Suggestion.create(suggestions)
		.then((doc) => {
			if (!doc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => handleErr(err, res));
};

export const getSuggestions = async (req, res) => {
	await Suggestion.find({})
		.then((suggestions) => {
			return res.json(suggestions);
		})
		.catch((err) => handleErr(err, res));
};

export const getSuggestionsCount = async (req, res) => {
	await Suggestion.find({})
		.then((suggestions) => {
			const pages = Math.ceil(suggestions.length / ITEM_PAGE_LIMIT);

			return res.json({count: suggestions.length, pages});
		})
		.catch((err) => handleErr(err, res));
};

export const getUserSuggestionsByEmail = async (req, res) => {
	const {email} = req?.params;
	Suggestion.find({userEmail: email})
		.then((suggestions) => {
			return res.json(suggestions);
		})
		.catch((err) => {
			handleErr(err, res);
		});
};

export const deleteSuggestion = async (req, res) => {
	const {suggestionId} = req?.params;

	await Suggestion.findByIdAndDelete(suggestionId)
		.then(() => {
			return res.json({deleted: true});
		})
		.catch((err) => handleErr(err, res));
};
