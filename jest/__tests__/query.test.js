import {
	ITEM_PAGE_LIMIT,
	getEntityQuery,
	getOrganizationQuery,
	getUserQuery,
	parsePageQuery
} from '../../src/utils/query';

describe('getEntityQuery', () => {
	it('should default to empty', () => {
		const result = getEntityQuery();

		expect(result).toEqual({});
	});

	it('should return organizationId', () => {
		const result = getEntityQuery({organizationId: 'test'});

		expect(result).toEqual({organizationId: 'test'});
	});

	it('should return serviceId', () => {
		const result = getEntityQuery({serviceId: 'test'});

		expect(result).toEqual({serviceId: 'test'});
	});

	it('should return both values', () => {
		const result = getEntityQuery({organizationId: 'test', serviceId: 'test'});

		expect(result).toEqual({organizationId: 'test', serviceId: 'test'});
	});
});

describe('getOrganizationQuery', () => {
	it('should check defaults', () => {
		const result = getOrganizationQuery();
		expect(result).toEqual({
			is_published: true,
			is_deleted: false
		});
	});

	// without coordinates
	it('should apply params and match snapshot', () => {
		const result = getOrganizationQuery({
			ids: '5e7e4be1d54f1760921a557e, 5e7e4bdfd54f1760921a4fbf',
			name: 'test',
			owner: 'test@asylumconnect.com',
			pending: 'true',
			deleted: 'true',
			serviceDeleted: 'true',
			properties: 'hello=true,world=true,foo=$existsFalse,req-id=true',
			serviceArea: 'city,state,other-place',
			tagLocale: 'en_us',
			tags: 'Food,Medical.Check Up,Legal'
		});
		expect(result).toMatchSnapshot();
	});

	// with coordinates
	it('should apply geoNear query and match snapshot', () => {
		const result = getOrganizationQuery({
			deleted: 'false',
			serviceDeleted: 'false',
			serviceArea: 'city,state',
			tagLocale: 'en_us',
			tags: 'Food,Legal',
			lat: '11',
			long: '-11'
		});
		expect(result).toMatchSnapshot();
	});

	it('should configure how the $elemMatch field', () => {
		const propertiesResult = getOrganizationQuery({
			properties: 'hello=true,world=true'
		});
		const serviceArgs = {
			serviceArea: 'city,state,other-place'
		};
		const tagArgs = {
			tagLocale: 'en_us',
			tags: 'Food,Medical.Check Up,Legal'
		};
		const serviceResult = getOrganizationQuery({
			...serviceArgs
		});
		const tagResult = getOrganizationQuery({
			...tagArgs
		});
		const serviceAndTagResult = getOrganizationQuery({
			...serviceArgs,
			...tagArgs
		});
		const serviceOr = {
			$or: [
				{'properties.city': 'true'},
				{'properties.state': 'true'},
				{'properties.other-place': 'true'}
			]
		};
		const tagOr = {
			$or: [
				{'tags.en_us.Food': 'true'},
				{'tags.en_us.Medical.Check Up': 'true'},
				{'tags.en_us.Legal': 'true'}
			]
		};

		expect(propertiesResult.services.$elemMatch).toEqual({
			'properties.hello': 'true',
			'properties.world': 'true'
		});
		expect(serviceResult.services.$elemMatch).toEqual(serviceOr);
		expect(tagResult.services.$elemMatch).toEqual(tagOr);
		expect(serviceAndTagResult.services.$elemMatch).toEqual({
			$and: [
				{
					$or: [
						{'properties.city': 'true'},
						{'properties.state': 'true'},
						{'properties.other-place': 'true'},
						{'tags.en_us.Food': 'true'},
						{'tags.en_us.Medical.Check Up': 'true'},
						{'tags.en_us.Legal': 'true'}
					]
				},
				{
					$or: [
						{'tags.en_us.Food': 'true'},
						{'tags.en_us.Medical.Check Up': 'true'},
						{'tags.en_us.Legal': 'true'}
					]
				}
			]
		});
	});

	//claimed status options
	it('should apply claimed status filter - "claimed"', () => {
		const result = getOrganizationQuery({
			claimedStatus: 'claimed'
		});
		expect(result).toEqual({
			is_published: true,
			is_deleted: false,
			'owners.isApproved': true
		});
	});

	it('should apply claimed status filter - "not claimed"', () => {
		const result = getOrganizationQuery({
			claimedStatus: 'notClaimed'
		});
		expect(result).toEqual({
			is_published: true,
			is_deleted: false,
			$or: [
				{'owners.isApproved': {$in: [null]}},
				{'owners.isApproved': {$exists: false}}
			]
		});
	});

	it('should apply claimed status filter - "pending"', () => {
		const result = getOrganizationQuery({
			claimedStatus: 'pending'
		});
		expect(result).toEqual({
			is_published: true,
			is_deleted: false,
			'owners.isApproved': false
		});
	});

	it('should not apply claimed status filter -  "all"', () => {
		const result = getOrganizationQuery({
			claimedStatus: 'all'
		});
		expect(result).toEqual({
			is_published: true,
			is_deleted: false
		});
	});
});

describe('getUserQuery', () => {
	it('should check defaults', () => {
		const query = getUserQuery();

		expect(query).toEqual({});
	});

	it('should apply different types', () => {
		const adminDataManagerQuery = getUserQuery({type: 'adminDataManager'});
		const dataManagerQuery = getUserQuery({type: 'dataManager'});
		const lawyerQuery = getUserQuery({type: 'lawyer'});
		const providerQuery = getUserQuery({type: 'provider'});
		const seekerQuery = getUserQuery({type: 'seeker'});
		const reviewerQuery = getUserQuery({type: 'reviewer'});
		const unknownTypeQuery = getUserQuery({type: 'foo'});

		expect(adminDataManagerQuery.isAdminDataManager).toEqual(true);
		expect(dataManagerQuery.isDataManager).toEqual(true);
		expect(lawyerQuery.catalogType).toEqual('lawyer');
		expect(providerQuery.catalogType).toEqual('provider');
		expect(seekerQuery.catalogType).toEqual('seeker');
		expect(reviewerQuery.catalogType).toEqual('reviewer');
		expect(unknownTypeQuery).toEqual({});
	});
});

describe('parsePageQuery', () => {
	it('should default to the first page', () => {
		const result = parsePageQuery();

		expect(result).toEqual({limit: 20, offset: 0});
	});

	it('should generate a correct limit and offset', () => {
		const result = parsePageQuery('2');

		expect(result).toEqual({limit: 20, offset: 20});
	});
});
