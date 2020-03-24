import {handleBadRequest, handleErr} from '../utils';
import {User} from '../mongoose';

export const userDelete = async (req, res) => {
  const {userId} = req?.params;

  await User.findByIdAndDelete(userId)
    .then(() => {
      // TODO: check and send 404
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const userGet = async (req, res) => {
  const {userId} = req?.params;

  await User.findById(userId)
    .then(user => {
      // TODO: do not return user's emails
      // TODO: check and send 404
      return res.json(user);
    })
    .catch(err => handleErr(err, res));
};

export const userUpdate = async (req, res) => {
  const {userId} = req?.params;
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  // TODO: check and send 404
  res.json({udpated: true, userId});
};

export const userFavoritesUpdate = async (req, res) => {
  const {userId} = req?.params;
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  // TODO: check and send 404
  res.json({services: {userId}});
};

export const usersCreate = async (req, res) => {
  const body = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  const user = new User(body);

  await user
    .save()
    .then(user => {
      return res.json({created: true, user});
    })
    .catch(err => handleErr(err, res));
};

export const usersGet = async (req, res) => {
  // TODO: pagination and query
  await User.find({})
    .then(users => {
      // TODO: do not return user's emails
      return res.json({users});
    })
    .catch(err => handleErr(err, res));
};
