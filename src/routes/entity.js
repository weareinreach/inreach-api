import {Comment, Rating, Suggestion} from '../mongoose';
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
      const {comments = []} = doc || {};

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
  const {orgId, serviceId} = req?.params;
  const {email, suggestions} = req?.body;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  if (!email || !suggestions || suggestions?.length < 1) {
    return handleBadRequest(res);
  }

  const newSuggestions = suggestions?.map((update) => ({
    ...update,
    userEmail: email,
  }));

  await Suggestion.updateOne(
    query,
    {$push: {suggestions: {$each: newSuggestions}}},
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

export const getSuggestions = async (req, res) => {
  const {orgId, serviceId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  await Suggestion.findOne(query)
    .then((doc) => {
      const {suggestions = []} = doc || {};

      return res.json(suggestions);
    })
    .catch((err) => handleErr(err, res));
};

export const deleteSuggestion = async (req, res) => {
  const {orgId, serviceId, suggestionId} = req?.params;
  const query = getEntityQuery({organizationId: orgId, serviceId});

  await Suggestion.findOne(query)
    .then(async (suggestion) => {
      const suggestionIndex = suggestion.suggestions.findIndex(
        (doc) => doc._id === suggestionId
      );

      if (suggestionIndex === -1) {
        return handleNotFound(res);
      }

      suggestion.suggestions[suggestionIndex].remove();

      await suggestion
        .save()
        .then(() => res.json({deleted: true}))
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};
