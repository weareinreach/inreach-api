import {
	handleBadRequest,
	handleErr,
	handleNotFound,
	isBodyEmpty,
	isValidObjectId
} from '../utils';
import {
	ITEM_PAGE_LIMIT,
	getOrganizationQuery,
	parsePageQuery
} from '../utils/query';
import {sendEmail} from '../utils/mail';
import {shareResource} from '../utils/sendMail';
import {Organization, User} from '../mongoose';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

export const getOrgs = async (req, res) => {
	const {limit, offset} = parsePageQuery(req?.query?.page);
	const {query} = req;

	let dbQuery = getOrganizationQuery(query);
	var obj = {};

	if (query.lastVerified) {
		dbQuery = Object.assign(dbQuery, {
			verified_at: {$lte: new Date(query.lastVerified)}
		});
	}

	if (query.lastVerifiedStart) {
		dbQuery = Object.assign(dbQuery, {
			verified_at: {
				$gte: new Date(query.lastVerifiedStart),
				$lte: new Date(query.lastVerifiedEnd)
			}
		});
	}

	if (query.lastUpdated) {
		dbQuery = Object.assign(dbQuery, {
			updated_at: {$lte: new Date(query.lastUpdated)}
		});
	}

	if (query.lastUpdatedStart) {
		dbQuery = Object.assign(dbQuery, {
			updated_at: {
				$gte: new Date(query.lastUpdatedStart),
				$lte: new Date(query.lastUpdatedEnd)
			}
		});
	}

	if (query.createdAt) {
		dbQuery = Object.assign(dbQuery, {
			created_at: {$lte: new Date(query.createdAt)}
		});
	}

	if (query.createdAtStart) {
		dbQuery = Object.assign(dbQuery, {
			created_at: {
				$gte: new Date(query.createdAtStart),
				$lte: new Date(query.createdAtEnd)
			}
		});
	}

	try {
		if (dbQuery.$geoNear) {
			let organizations = await Organization.aggregate([
				dbQuery,
				{$skip: offset},
				{$limit: limit}
			]);
			return res.json({
				organizations
			});
		}
		if (dbQuery.$text) {
			// sorts results based on text match score
			obj = {score: {$meta: 'textScore'}};
		}
		const organizations = await Organization.find(dbQuery)
			.sort(obj)
			.skip(offset)
			.limit(limit);
		return res.json({
			organizations
		});
	} catch (err) {
		handleErr(err, res);
	}
};

// Query organizations by name
export const getOrgsByName = async (req, res) => {
	const query = req?.params?.name;
	const {offset} = parsePageQuery(req?.query?.page);

	await Organization.find({
		name: {$regex: `.*${query}.*`, $options: 'si'}
	})
		.sort({name: 1})
		.skip(offset)
		.limit(5)
		.then((organizations) => {
			return res.json({
				organizations
			});
		})
		.catch((err) => handleErr(err, res));
};

export const getOrgsCount = async (req, res) => {
	const query = getOrganizationQuery(req?.query);

	await Organization.countDocuments(query)
		.then((count) => {
			const pages = Math.ceil(count / ITEM_PAGE_LIMIT);

			return res.json({count, pages});
		})
		.catch((err) => handleErr(err, res));
};

export const createOrg = async (req, res) => {
	const body = req?.body;

	if (isBodyEmpty(body)) {
		return handleBadRequest(res);
	}

	const org = new Organization(body);
	if (org.locations?.length) {
		org.locations.map((location) => updateLocationGeolocation(location, res));
		//Validate Geolocation
		if (!validateLocationGeolocation(body.locations)) {
			handleErr({message: 'Longitude and Latitude are required fields'}, res);
			return;
		}
	}

	await org
		.save()
		.then((organization) => {
			return res.json({created: true, organization});
		})
		.catch((err) => handleErr(err, res));
};

export const deleteOrg = async (req, res) => {
	const {orgId} = req?.params;

	await Organization.findByIdAndDelete(orgId)
		.then(() => {
			return res.json({deleted: true});
		})
		.catch((err) => handleErr(err, res));
};

export const getOrg = async (req, res) => {
	const {orgId} = req?.params;

	//Validate ObjectId for aggregate use
	if (!isValidObjectId(orgId)) {
		return handleErr('Invalid Object ID format', res);
	}

	Organization.aggregate([
		{
			$match: {
				_id: new ObjectId(orgId)
			}
		},
		{
			$project: {
				org: '$$ROOT',
				services: {
					$filter: {
						input: '$$CURRENT.services',
						as: 'item',
						cond: {
							$eq: ['$$item.is_deleted', false]
						}
					}
				}
			}
		},
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [
						'$org',
						{
							services: '$services'
						}
					]
				}
			}
		}
	])
		.then((organization) => {
			if (organization.length === 0) {
				return handleNotFound(res);
			}
			return res.json(organization[0]);
		})
		.catch((err) => handleErr(err, res));
};

export const updateOrg = async (req, res) => {
	const {orgId} = req?.params;
	const body = req?.body;
	const updated_at = Date.now();

	if (isBodyEmpty(body)) {
		return handleBadRequest(res);
	}

	//Validate locations
	if (body.locations && body.locations.length > 0) {
		const primaryLocation = body.locations.filter((loc) => loc.is_primary);
		if (primaryLocation.length > 1) {
			handleErr(
				{message: 'Organization can only have one primary location'},
				res
			);
			return;
		} else if (primaryLocation.length === 0 && body.locations.length > 1) {
			handleErr({message: 'Organization must have a primary location'}, res);
			return;
		}
		if (primaryLocation.length === 0 && body.locations.length === 1) {
			body.locations[0].is_primary = true;
		}
		body.locations.map((location) => updateLocationGeolocation(location, res));
		//Validate Geolocation
		//commenting out - hot fix - https://app.asana.com/0/1132189118126148/1201710885977986
		// if (!validateLocationGeolocation(body.locations)) {
		// 	handleErr({message: 'Longitude and Latitude are required fields'}, res);
		// 	return;
		// }
	}

	await Organization.findOneAndUpdate(
		{_id: orgId},
		{$set: {...body, updated_at}}
	)
		.then((doc) => {
			if (!doc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => handleErr(err, res));
};

export const getOrgBySlug = async (req, res) => {
	const {orgSlug} = req?.params;

	await Organization.findOne({slug: orgSlug})
		.then((organization) => {
			if (!organization) {
				return handleNotFound(res);
			}

			return res.json(organization);
		})
		.catch((err) => handleErr(err, res));
};

export const createOrgOwner = async (req, res) => {
	try {
		const {orgId} = req?.params;
		const {email, userId} = req?.body;

		if (!email || !userId || !isValidObjectId(userId)) {
			return handleBadRequest(res);
		}
		const organization = await Organization.findById(orgId);
		if (!organization) {
			return handleNotFound(res);
		}
		if (
			organization.owners.length &&
			organization.owners.some((owner) => owner.email === email)
		) {
			return res
				.status(409)
				.send(
					'Affiliation request has already been received and/or approved for this user'
				);
		}

		const newOwner = {email, isApproved: false, userId};
		organization.owners.push(newOwner);
		await organization.save();
		return res.json({created: true});
	} catch (err) {
		handleErr(err, res);
	}
};

export const approveOrgOwner = async (req, res) => {
	const {orgId, userId} = req?.params;

	if (
		!orgId ||
		!userId ||
		!isValidObjectId(orgId) ||
		!isValidObjectId(userId)
	) {
		return handleBadRequest(res);
	}

	await Organization.findById(orgId)
		.then(async (organization) => {
			if (!organization) {
				return handleNotFound(res);
			}

			const ownerIndex = organization.owners.findIndex(
				(owner) => owner.userId === userId
			);

			if (ownerIndex === -1) {
				return handleNotFound(res);
			}

			organization.owners[ownerIndex].isApproved = true;

			await organization
				.save()
				.then(() => res.json({updated: true}))
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export const deleteOrgOwner = async (req, res) => {
	const {orgId, userId} = req?.params;

	if (
		!orgId ||
		!userId ||
		!isValidObjectId(orgId) ||
		!isValidObjectId(userId)
	) {
		return handleBadRequest(res);
	}
	//Check if user exists
	await User.findById(userId)
		.then(async (user) => {
			//Exit if user does not exist
			if (user === null) {
				return handleNotFound(res);
			}
			//Remove User
			await Organization.findById(orgId)
				.then(async (organization) => {
					if (!organization) {
						return handleNotFound(res);
					}
					Organization.updateOne(
						{_id: orgId},
						{
							$pull: {
								owners: {userId: userId}
							}
						}
					)
						.then((org) => res.json({deleted: true}))
						.catch((err) => handleErr(err, res));
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export let sendOrgOwnerStatus = async (req, res, next) => {
	const {ownerStatus, org, recipient} = req?.body;
	let subject;
	let message;
	let html;

	switch (ownerStatus) {
		case 'approve':
			subject = `You are now affiliated with ${org} on InReach`;
			message = `Thank you for requesting to join ${org} on the InReach App (https://InReach.org). Our team has approved your request and your InReach user account is now connected to ${org}'s profile page on InReach.\n\nBest,\nThe InReach Team`;
			html = `<html>Thank you for requesting to join ${org} on the <a href='https://InReach.org'>InReach App</a>. Our team has approved your request and your InReach user account is now connected to ${org}'s profile page on InReach.<br/><br/>Best,<br/>The InReach Team</html>`;
			break;
		case 'deny':
			subject = `Follow Up Re: Request to Join ${org} on InReach`;
			message = `Thank you for requesting to join ${org} on the InReach App <https://InReach.org>. Our team was not able to verify your connection to ${org} based on your initial registration information. Please reply to this email with more details on how exactly you are affiliated with ${org}.\n\nBest,\nThe InReach Team`;
			html = `<html>Thank you for requesting to join ${org} on the <a href='https://InReach.org'>InReach App</a>. Our team was not able to verify your connection to ${org} based on your initial registration information. Please reply to this email with more details on how exactly you are affiliated with ${org}.<br/><br/>Best,<br/>The InReach Team</html>`;
			break;
	}
	try {
		await sendEmail(recipient, subject, message, html);
		res.json({message: 'Your query has been sent'});
		await next();
	} catch (e) {
		await next(e);
	}
};

export const shareOrganization = async (req, res) => {
	const {orgId} = req?.params;
	const {email, shareType, shareUrl} = req?.body;
	if (!email || !shareType || !shareUrl || !orgId) {
		return handleBadRequest(res);
	}
	try {
		const org = await Organization.findById(orgId);
		if (!org) {
			return handleNotFound(res);
		}
		return shareResource(email, shareType, shareUrl, org, res);
	} catch (error) {
		handleErr(error, res);
	}
};

const updateLocationGeolocation = (location) => {
	location.geolocation = {
		type: 'Point',
		//hot fix https://app.asana.com/0/1132189118126148/1201710885977986
		// coordinates: [parseFloat(location.long), parseFloat(location.lat)]
		coordinates: [
			parseFloat(location.long ? location.long : 0),
			parseFloat(location.lat ? location.lat : 0)
		]
	};
	return location;
};

const validateLocationGeolocation = (locations) => {
	let valid = true;
	locations.forEach((location) => {
		if (!location.long || !location.lat) {
			valid = false;
		}
	});
	return valid;
};
