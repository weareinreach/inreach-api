import {User} from '../mongoose';
import {
	generateJWT,
	handleBadRequest,
	handleErr,
	handleNotFound,
	removeUserInfo,
	verifyJWT
} from '../utils';
import {ITEM_PAGE_LIMIT, getUserQuery, parsePageQuery} from '../utils/query';

export const authUser = async (req, res) => {
	const {email, password} = req?.body;

	if (!password) {
		return res.status(400).send('Please provide a valid password.');
	}

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
	const {limit, offset} = parsePageQuery(req?.query?.page);
	const query = getUserQuery(req?.query);

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

export const getUsersCount = async (req, res) => {
	const query = getUserQuery(req?.query);

	await User.countDocuments(query)
		.then((count) => {
			const pages = Math.ceil(count / ITEM_PAGE_LIMIT);

			return res.json({count, pages});
		})
		.catch((err) => handleErr(err, res));
};

export const createUser = async (req, res) => {
	try {
		const {password, ...body} = req?.body;

		if (!body) {
			return handleBadRequest(res);
		}
		// query if user already exists
		const existingUser = await User.find({email: body.email.trim()});
		if (existingUser.length) {
			return res.status(409).send('User already exists.');
		}
		const user = new User(body);

		user.setPassword(password);

		const userDoc = await user.save();
		const userJSON = userDoc.toJSON();
		const token = userJSON.hash;
		const userInfo = removeUserInfo(userJSON);
		return res.json({created: true, token, userInfo});
	} catch (err) {
		handleErr(err, res);
	}
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

export const createUserList = async (req, res) => {
	const {userId} = req?.params;
	const {name} = req?.body;

	if (!name || !userId) {
		return handleBadRequest(res);
	}

	await User.findById(userId)
		.then(async (user) => {
			if (!user) {
				return handleNotFound(res);
			}

			const newList = {name};

			if (user.lists) {
				user.lists.push(newList);
			} else {
				user.lists = [newList];
			}

			await user
				.save()
				.then((result) => {
					const list = result.lists.find((list) => list.name === name).toJSON();
					return res.json({created: true, list});
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export const addUserListItem = async (req, res) => {
	const {listId, userId} = req?.params;
	const {itemId, orgId} = req?.body;

	if (!itemId || !listId || !userId) {
		return handleBadRequest(res);
	}

	await User.findById(userId)
		.then(async (user) => {
			if (!user) {
				return handleNotFound(res);
			}

			const list = user.lists.id(listId);

			if (!list) {
				return handleNotFound(res);
			}

			const newItem = {fetchable_id: itemId, orgId};

			if (list.items) {
				list.items.push(newItem);
			} else {
				list.items = [newItem];
			}

			await user
				.save()
				.then(() => res.json({updated: true}))
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export const removeUserListItem = async (req, res) => {
	const {itemId, listId, userId} = req?.params;

	await User.findById(userId)
		.then(async (user) => {
			if (!user) {
				return handleNotFound(res);
			}

			const list = user.lists.id(listId);

			if (!list) {
				return handleNotFound(res);
			}

			const itemIndex = list.items.findIndex(
				(item) => item.fetchable_id === itemId
			);

			if (itemIndex === -1) {
				return handleNotFound(res);
			}

			list.items[itemIndex].remove();

			await user
				.save()
				.then(() => res.json({deleted: true}))
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};
