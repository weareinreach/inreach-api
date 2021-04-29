import {
	handleBadRequest,
	handleErr,
	handleNotFound,
	orderServices
} from '../utils';
import {
	ITEM_PAGE_LIMIT,
	getOrganizationQuery,
	parsePageQuery
} from '../utils/query';
import {sendEmail} from '../utils/mail';
import {shareResource} from '../utils/sendMail';
import {Organization} from '../mongoose';

export const getOrgs = async (req, res) => {
	const {limit, offset} = parsePageQuery(req?.query?.page);
	const query = getOrganizationQuery(req?.query);
	var sortObjectArray = '';
	var obj = {};

	if (query['services']) {
		if (query['services']['$elemMatch']['$or']) {
			sortObjectArray = query['services']['$elemMatch']['$or'];

			var nestedNameArray = sortObjectArray.map(function (el) {
				return Object.getOwnPropertyNames(el);
			});
			var nameArray = nestedNameArray.flat([1]);
			var prioritySortArray = [];

			for (var i = 0; i < nameArray.length; i++) {
				if (nameArray[i].includes('county')) {
					if (nameArray.length > 0) {
						prioritySortArray[0] = nameArray[i];
					}
				} else if (nameArray[i].includes('state')) {
					if (nameArray.length > 1) {
						prioritySortArray[1] = nameArray[i];
					}
				} else if (nameArray[i].includes('national')) {
					if (nameArray.length > 2) {
						prioritySortArray[2] = nameArray[i];
					}
				}
			}
			var prioritySort = prioritySortArray.filter(function (el) {
				return el != null;
			});

			for (const key of prioritySort) {
				obj[key] = -1;
			}
		} else if (query['services']['$elemMatch']['$and']) {
			sortObjectArray = query['services']['$elemMatch']['$and'][0]['$or'];
			var nestedTagNameArray = sortObjectArray.map(function (el) {
				return Object.getOwnPropertyNames(el);
			});
			var nameTagArray = nestedTagNameArray.flat([1]);
			var priorityTagSortArray = [];

			for (var a = 0; a < nameTagArray.length; a++) {
				if (nameTagArray[a].includes('county')) {
					if (nameTagArray.length > 0) {
						priorityTagSortArray[0] = nameTagArray[a];
					}
				} else if (nameTagArray[a].includes('state')) {
					if (nameTagArray.length > 1) {
						priorityTagSortArray[1] = nameTagArray[a];
					}
				} else if (nameTagArray[a].includes('national')) {
					if (nameTagArray.length > 2) {
						priorityTagSortArray[2] = nameTagArray[a];
					}
				}
			}
			var priorityTagSort = priorityTagSortArray.filter(function (el) {
				return el != null;
			});

			for (const key of priorityTagSort) {
				obj[key] = -1;
			}
		}
	}

	await Organization.find(query)
		.sort(obj)
		.skip(offset)
		.limit(limit)
		.then((organizations) => {
			return res.json({
				organizations
			});
		})
		.catch((err) => handleErr(err, res));
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
	const org = new Organization(body);

	if (!body) {
		return handleBadRequest(res);
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

	await Organization.findById(orgId)
		.then((organization) => {
			if (!organization) {
				return handleNotFound(res);
			}

			organization.services = orderServices(organization.services);

			return res.json(organization);
		})
		.catch((err) => handleErr(err, res));
};

export const updateOrg = async (req, res) => {
	const {orgId} = req?.params;
	const body = req?.body;
	const updated_at = Date.now();

	if (!body) {
		return handleBadRequest(res);
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

		if (!email || !userId) {
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

			organization.owners[ownerIndex].remove();

			await organization
				.save()
				.then(() => res.json({deleted: true}))
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export let sendOrgOwnerStatus = async (req, res, next) => {
	const {ownerStatus, org, recipient} = req?.body;
	let subject;
	let message;
	let html;

	console.log(recipient);
	console.log(ownerStatus);

	switch (ownerStatus) {
		case 'approve':
			subject = `You are now affiliated with ${org} on AsylumConnect`;
			message = `Thank you for requesting to join ${org} on the AsylumConnect Catalog (https://asylumconnect.org). Our team has approved your request and your AsylumConnect user account is now connected to ${org}\'s profile page on AsylumConnect.\n\nBest,\nThe AsylumConnect Team`;
			html = `<html>Thank you for requesting to join ${org} on the <a href='https://asylumconnect.org'>AsylumConnect Catalog</a>. Our team has approved your request and your AsylumConnect user account is now connected to ${org}'s profile page on AsylumConnect.<br/><br/>Best,<br/>The AsylumConnect Team</html>`;
			break;
		case 'deny':
			subject = `Follow Up Re: Request to Join ${org} on AsylumConnect`;
			message = `Thank you for requesting to join ${org} on the AsylumConnect Catalog <https://asylumconnect.org>. Our team was not able to verify your connection to ${org} based on your initial registration information. Please reply to this email with more details on how exactly you are affiliated with ${org}.\n\nBest,\nThe AsylumConnect Team`;
			html = `<html>Thank you for requesting to join ${org} on the <a href='https://asylumconnect.org'>AsylumConnect Catalog</a>. Our team was not able to verify your connection to ${org} based on your initial registration information. Please reply to this email with more details on how exactly you are affiliated with ${org}.<br/><br/>Best,<br/>The AsylumConnect Team</html>`;
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
