import {handleErr} from '../utils';
import {User} from '../utils/mongoose';

export const userDelete = async (req, res) => {
  const {userId} = req?.params;

  // TODO: check for bad req and send 401

  await User.findByIdAndDelete(userId)
    .then(() => {
      // TODO: check and send 404
      return res.json({deleted: true});
    })
    .catch(err => handleErr(err, res));
};

export const userGet = async (req, res) => {
  // TODO: do not return emails
  const {userId} = req?.params;

  // TODO: check for bad req and send 401

  await User.findById(userId)
    .then(user => {
      // TODO: check and send 404
      return res.json(user);
    })
    .catch(err => handleErr(err, res));
};

export const userUpdate = async (req, res) => {
  const {userId} = req?.params;

  // TODO: check for bad req and send 401

  res.json({udpated: true, userId});
};

export const userFavoritesUpdate = async (req, res) => {
  const {userId} = req?.params;

  // TODO: check for bad req and send 401

  // TODO: check and send 404
  res.json({services: {userId}});
};

export const usersCreate = async (req, res) => {
  const body = req?.body;
  const user = new User(body);

  // TODO: check for bad req and send 401

  await user
    .save()
    .then(user => {
      // TODO: check and send 404
      return res.json({created: true, user});
    })
    .catch(err => handleErr(err, res));
};

export const usersGet = async (req, res) => {
  // TODO: pagination and query
  // TODO: do not return emails
  await User.find({})
    .then(users => {
      // TODO: check and send 404
      return res.json({users});
    })
    .catch(err => handleErr(err, res));
};
