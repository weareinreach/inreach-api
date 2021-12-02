import _reduce from 'lodash/reduce';

import {
	formatService,
	handleBadRequest,
	handleErr,
	handleNotFound,
	isBodyEmpty,
	isValidObjectId
} from '../utils';
import {getOrganizationQuery} from '../utils/query';
import {Organization} from '../mongoose';
import {auditEdit} from './editLogs';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

export const getServicesCount = async (req, res) => {
	const query = getOrganizationQuery(req?.query);
	await Organization.aggregate([
		{$match: query},
		{$unwind: '$services'},
		{$group: {_id: 0, total: {$sum: 1}}}
	])
		.then((resp) => {
			return res.json({count: resp[0].total});
		})
		.catch((err) => handleErr(err, res));
};

// FIX THIS LIKE ORGS
export const getServices = async (req, res) => {
	const {orgId} = req?.params;

	//Validate ObjectId for aggregate use
	isValidObjectId(orgId)
		? console.log('Valid objectId')
		: handleErr('Invalid Object ID format', res);

	Organization.aggregate([
		{
			$match: {
				_id: ObjectId(orgId)
			}
		},
		{
			$unwind: {
				path: '$services',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$match: {
				$or: [
					{
						'services.is_deleted': {
							$exists: false
						}
					},
					{
						$and: [
							{
								'services.is_deleted': {
									$exists: true
								}
							},
							{
								'services.is_deleted': false
							}
						]
					}
				]
			}
		},
		{
			$group: {
				_id: '$_id',
				services: {
					$push: '$$CURRENT.services'
				},
				organization: {
					$first: '$$ROOT'
				}
			}
		},
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [
						'$organization',
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
			return res.json(organization[0].services);
		})
		.catch((err) => handleErr(err, res));
};

export const createService = async (req, res) => {
	const {orgId} = req?.params;
	const body = req?.body;
	const {userId, service} = body;

	if (isBodyEmpty(body)) {
		return handleBadRequest(res);
	}

	if (userId && service) {
		return createServiceAudit(req, res);
	}

	await Organization.findById(orgId)
		.then(async (organization) => {
			if (!organization) {
				return handleNotFound(res);
			}

			organization.services.push(body);

			await organization
				.save()
				.then(() => {
					return res.json({created: true});
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

const createServiceAudit = async (req, res) => {
	const {orgId} = req?.params;
	const body = req?.body;
	const {userId, service} = body;

	if (isBodyEmpty(service)) {
		return handleBadRequest(res);
	}

	await Organization.findById(orgId)
		.then(async (organization) => {
			if (!organization) {
				return handleNotFound(res);
			}

			if (!organization.services) {
				organization.services = [];
			}
			const before = [...organization.services];
			organization.services.push(service);

			await organization
				.save()
				.then(() => {
					auditEdit(userId, 'SERVICE', before, organization.services, 'ADDED');
					return res.json({created: true});
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export const deleteService = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const {authorId} = req?.body;

	await Organization.findById(orgId)
		.then((organization) => {
			if (!organization) {
				return handleNotFound(res);
			}

			const before = [...organization.services];
			organization.services.id(serviceId).remove();

			organization
				.save()
				.then(() => {
					if (authorId) {
						auditEdit(
							authorId,
							'SERVICE',
							before,
							organization.services,
							'DELETED'
						);
					}
					return res.json({deleted: true});
				})
				.catch((err) => handleErr(err, res));
		})
		.catch((err) => handleErr(err, res));
};

export const getService = async (req, res) => {
	const {orgId, serviceId} = req?.params;

	await Organization.findById(orgId)
		.then((orgDoc) => {
			if (!orgDoc) {
				return handleNotFound(res);
			}

			const serviceDoc = orgDoc.services.id(serviceId);

			if (!serviceDoc) {
				return handleNotFound(res);
			}

			const service = formatService(
				serviceDoc?.toJSON() || {},
				orgDoc?.toJSON() || {}
			);

			return res.json(service);
		})
		.catch((err) => handleErr(err, res));
};

export const updateService = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const body = req?.body;
	const {userId, service} = body;
	const updated_at = Date.now();

	if (isBodyEmpty(body)) {
		return handleBadRequest(res);
	}

	if (userId && service) {
		return updateServiceAudit(req, res);
	}

	const updates = _reduce(
		body,
		(result, value, key) => {
			result[`services.$.${key}`] = value;

			return result;
		},
		{
			'services.$._id': serviceId,
			'services.$.updated_at': updated_at
		}
	);

	await Organization.findOneAndUpdate(
		{_id: orgId, 'services._id': serviceId},
		{$set: updates}
	)
		.then((orgDoc) => {
			if (!orgDoc) {
				return handleNotFound(res);
			}

			return res.json({updated: true});
		})
		.catch((err) => handleErr(err, res));
};

const updateServiceAudit = async (req, res) => {
	const {orgId, serviceId} = req?.params;
	const {userId, service} = req?.body;
	const updated_at = Date.now();

	if (isBodyEmpty(service)) {
		return handleBadRequest(res);
	}

	const updates = _reduce(
		service,
		(result, value, key) => {
			result[`services.$.${key}`] = value;

			return result;
		},
		{
			'services.$._id': serviceId,
			'services.$.updated_at': updated_at
		}
	);

	await Organization.findById(orgId).then(async (organization) => {
		if (!organization) {
			return handleNotFound(res);
		}

		await Organization.findOneAndUpdate(
			{_id: orgId, 'services._id': serviceId},
			{$set: updates},
			{new: true}
		)
			.then((orgDoc) => {
				if (!orgDoc) {
					return handleNotFound(res);
				}

				auditEdit(
					userId,
					'SERVICE',
					organization.services,
					orgDoc.services,
					'UPDATED'
				);
				return res.json({updated: true});
			})
			.catch((err) => handleErr(err, res));
	});
};

export const getServiceBySlug = async (req, res) => {
	const {orgSlug, serviceSlug} = req?.params;

	await Organization.findOne({slug: orgSlug})
		.then((orgDoc) => {
			if (!orgDoc) {
				return handleNotFound(res);
			}

			const serviceDoc = orgDoc.services.find(
				(service) => service.slug === serviceSlug
			);

			if (!serviceDoc) {
				return handleNotFound(res);
			}

			const service = {
				...(serviceDoc?.toJSON() || {}),
				organization: {
					...(orgDoc?.toJSON() || {}),
					services: undefined
				}
			};

			return res.json(service);
		})
		.catch((err) => handleErr(err, res));
};
