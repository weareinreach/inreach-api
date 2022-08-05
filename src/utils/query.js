import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

/**
 * Uses object shorthand to create a query based on if the values exist
 * @param  {String} organizationId id of the organization
 * @param  {String} serviceId id of the service
 * @return {Object} A mongo query
 */
export const getEntityQuery = ({organizationId, serviceId} = {}) => {
	const query = {};

	if (organizationId) {
		query.organizationId = organizationId;
	}

	if (serviceId) {
		query.serviceId = serviceId;
	}

	return query;
};

export const ITEM_PAGE_LIMIT = 20;

export const parsePageQuery = (page = '1') => {
	const parsedPage = parseInt(page);
	const limit = ITEM_PAGE_LIMIT;
	const offset = limit * (parsedPage - 1);

	return {limit, offset};
};

/**
 * Format a query to retrieve organizations. Used for searching and count.
 * @param  {Object} params Query param input
 * @return {Object} A mongo query
 */
export const getOrganizationQuery = (params = {}) => {
	const {
		ids,
		name,
		owner,
		pending,
		deleted,
		serviceDeleted,
		pendingOwnership,
		properties,
		serviceArea,
		tagLocale,
		tags,
		long,
		lat
	} = params;
	let query = {};

	if (ids) {
		query._id = {
			$in: ids.split(',').map((id) => new ObjectId(id.trim()))
		};
	}

	// search by org name
	if (name && name.trim() !== '""') {
		query.$text = {$search: name.trim(), $caseSensitive: false};
	}

	if (owner) {
		query['owners.email'] = owner;
	}

	if (pendingOwnership) {
		query['owners.isApproved'] = false;
	} else {
		query['owners.isApproved'] = true;
	}

	if (deleted) {
		query.is_deleted = true;
	} else {
		query.is_deleted = false;
	}

	if (serviceDeleted) {
		query['services.is_deleted'] = true;
		//Overide deleted to get both deleted and non deleted orgs.
		query.is_deleted = {$in: [true, false]};
	}

	if (pending) {
		query.is_published = false;
	} else {
		query.is_published = true;
	}

	const queryOnProperties = properties;
	const queryOnTags = tagLocale && tags;
	const queryOnServiceAreaCoverage = serviceArea;

	/**
	 * For querying on an organizations services. Here is a plain english explanaiton of the logic:
	 *
	 * Show me organizations that offer services in New York City or New York (State) or Nation Wide
	 * IF they have at least one service that has one of the following tags "Community Support / Cultural Centers", "Food", "Housing / Drop-in centers for LGBTQ youth"
	 * AND they have at least one service that does not require any of the following: "Proof of residence" and "A referral"
	 */
	if (queryOnServiceAreaCoverage || queryOnProperties || queryOnTags) {
		let propertyQuery = null;
		let serviceAreaQuery = null;
		let tagQuery = null;

		if (queryOnProperties) {
			// Split the properties by if they are 'required' type properties
			const {requiredProps, regularProps} = properties.split(',').reduce(
				(result, prop) => {
					if (prop) {
						if (prop.includes('req-')) {
							result.requiredProps.push(prop);
						} else {
							result.regularProps.push(prop);
						}
					}
					return result;
				},
				{
					requiredProps: [],
					regularProps: []
				}
			);

			// Check the property values
			if (regularProps && regularProps?.length > 0) {
				propertyQuery = regularProps.reduce((result, prop) => {
					const [name, value] = prop.split('=');

					if (value === '$existsFalse') {
						result[`properties.${name}`] = {$exists: false};
					} else {
						result[`properties.${name}`] = value;
					}

					return result;
				}, propertyQuery || {});
			}

			// Check that the required property keys don't exist
			if (requiredProps && requiredProps?.length > 0) {
				propertyQuery = requiredProps.reduce((result, prop) => {
					const [name] = prop.split('=');

					result[`properties.${name}`] = {$exists: false};

					return result;
				}, propertyQuery || {});
			}
		}

		// map
		if (queryOnServiceAreaCoverage) {
			serviceAreaQuery = serviceArea
				.split(',')
				.reduce((result, coverageArea) => {
					result.push({
						[`properties.${coverageArea}`]: 'true'
					});

					return result;
				}, []);
		}

		if (queryOnTags) {
			tagQuery = tags.split(',').reduce((result, tag) => {
				result.push({
					[`tags.${tagLocale}.${tag}`]: 'true'
				});

				return result;
			}, []);
		}

		// Combine the queries
		let $elemMatch = {};

		// Apply searching on properties at the top level
		if (propertyQuery) {
			$elemMatch = {...propertyQuery};
		}

		// Either apply both queries or a single
		if (serviceAreaQuery && tagQuery) {
			$elemMatch.$and = [{$or: serviceAreaQuery}, {$or: tagQuery}];
		} else if (serviceAreaQuery) {
			$elemMatch.$or = serviceAreaQuery;
		} else if (tagQuery) {
			$elemMatch.$or = tagQuery;
		}

		query.services = {$elemMatch};
	}

	if (lat?.length && long?.length) {
		query = {
			$geoNear: {
				near: {type: 'Point', coordinates: [parseFloat(long), parseFloat(lat)]},
				distanceField: 'distance',
				query: {...query}
			}
		};
		return query;
	}
	return query;
};

/**
 * Format a query to retrieve iser. Used for searching and count.
 * @param  {Object} params Query param input
 * @return {Object} A mongo query
 */
export const getUserQuery = (params = {}) => {
	const {type} = params;
	let query = {};

	switch (type) {
		case 'adminDataManager':
			query.isAdminDataManager = true;
			break;
		case 'dataManager':
			query.isDataManager = true;
			break;
		case 'lawyer':
			query.catalogType = 'lawyer';
			break;
		case 'provider':
			query.catalogType = 'provider';
			break;
		case 'seeker':
			query.catalogType = 'seeker';
			break;
	}

	return query;
};
