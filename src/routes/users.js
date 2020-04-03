import {
  generateJWT,
  handleBadRequest,
  handleErr,
  handleNotFound,
  parsePageQuery,
  removeUserInfo,
  verifyJWT,
} from '../utils';
import {User} from '../mongoose';

export const authUser = async (req, res) => {
  const {email, password} = req?.body;

  await User.findOne({email})
    .then((userDoc) => {
      if (!userDoc) {
        return handleNotFound(res);
      }

      const valid = userDoc.validPassword(password);

      if (!valid) {
        return handleBadRequest(res);
      }

      const user = removeUserInfo(userDoc.toJSON());
      const token = generateJWT(user);

      return res.json({valid, token});
    })
    .catch((err) => handleErr(err, res));
};

export const checkUserToken = async (req, res) => {
  const {token} = req.body;
  const {valid, user} = await verifyJWT(token);

  if (valid) {
    return res.json(user);
  }

  return handleBadRequest(res);
};

export const getUsers = async (req, res) => {
  const {isDataManager, page} = req?.query;
  const {limit, offset} = parsePageQuery(page);
  const query = {};

  if (isDataManager) {
    query.isDataManager = true;
  }

  await User.find(query)
    .sort({updated_at: -1})
    .skip(offset)
    .limit(limit)
    .then((userList) => {
      const users = userList.map((user) => removeUserInfo(user.toJSON()));

      return res.json({users});
    })
    .catch((err) => handleErr(err, res));
};

export const createUser = async (req, res) => {
  const {password, ...body} = req?.body;

  if (!body) {
    return handleBadRequest(res);
  }

  const user = new User(body);

  user.setPassword(password);

  await user
    .save()
    .then((userDoc) => {
      const userJSON = userDoc.toJSON();
      const token = userJSON.hash;
      const user = removeUserInfo(userJSON);

      return res.json({created: true, token, user});
    })
    .catch((err) => handleErr(err, res));
};

export const deleteUser = async (req, res) => {
  const {userId} = req?.params;

  await User.findByIdAndDelete(userId)
    .then(() => {
      return res.json({deleted: true});
    })
    .catch((err) => handleErr(err, res));
};

export const getUser = async (req, res) => {
  const {userId} = req?.params;

  await User.findById(userId)
    .then((userDoc) => {
      if (!userDoc) {
        return handleNotFound(res);
      }

      const user = removeUserInfo(userDoc.toJSON());

      return res.json(user);
    })
    .catch((err) => handleErr(err, res));
};

export const updateUser = async (req, res) => {
  const {userId} = req?.params;
  const body = req?.body;
  const updated_at = Date.now();

  if (!body) {
    return handleBadRequest(res);
  }

  await User.findOneAndUpdate({_id: userId}, {$set: {...body, updated_at}})
    .then((userDoc) => {
      if (!userDoc) {
        return handleNotFound(res);
      }

      return res.json({updated: true});
    })
    .catch((err) => handleErr(err, res));
};

export const updateUserPassword = async (req, res) => {
  const {userId} = req?.params;
  const {password} = req?.body;

  if (!password) {
    return handleBadRequest(res);
  }

  await User.findById(userId)
    .then(async (user) => {
      if (!user) {
        return handleNotFound(res);
      }

      user.setPassword(password);

      await user
        .save()
        .then(() => res.json({updated: true}))
        .catch((err) => handleErr(err, res));
    })
    .catch((err) => handleErr(err, res));
};
