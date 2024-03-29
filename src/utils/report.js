export async function getServiceNationalOrgs(model, country) {
	let national_property = `properties.service-national-${country}`;
	let result = await model.aggregate([
		{
			$match: {
				[national_property]: {
					$exists: true
				}
			}
		},
		{
			$count: 'count'
		}
	]);
	return result.length > 0
		? {
				country: country,
				count: result[0].count
		  }
		: {
				country: country,
				count: 0
		  };
}

export async function getServiceNationalServices(model, country) {
	let national_property_1 = `services.properties.service-national-${country}`;
	let national_property_2 = `properties.service-national-${country}`;
	let result = await model.aggregate([
		{
			$match: {
				[national_property_1]: {
					$exists: true
				}
			}
		},
		{
			$unwind: {
				path: '$services',
				preserveNullAndEmptyArrays: false
			}
		},
		{
			$match: {
				[national_property_2]: {
					$exists: true
				}
			}
		},
		{
			$count: 'count'
		}
	]);
	return result.length > 0
		? {
				country: country,
				count: result[0].count
		  }
		: {
				country: country,
				count: 0
		  };
}

export async function getServiceStateOrgs(states, model, country, resultArray) {
	let service_tags = `services.tags.${country}`;
	for (const state of states) {
		let result = await model.aggregate([
			{
				$match: {
					[service_tags]: {
						$exists: true
					}
				}
			},
			{
				$project: {
					_id: 0,
					name: 1,
					properties: 1,
					tags: {
						$objectToArray: '$properties'
					}
				}
			},
			{
				$unwind: {
					path: '$tags',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$group: {
					_id: '$name',
					tags: {
						$addToSet: '$tags.k'
					}
				}
			},
			{
				$sort: {
					_id: 1
				}
			},
			{
				$match: {
					tags: {
						$regex: state
					}
				}
			},
			{
				$count: 'count'
			}
		]);
		var value = result.length > 0 ? result[0].count : 0;
		resultArray.push({
			state: state,
			count: value
		});
	}
	return resultArray;
}

export async function getServiceStateServices(
	states,
	model,
	country,
	resultArray
) {
	let service_tags = `services.tags.${country}`;
	for (const state of states) {
		let result = await model.aggregate([
			{
				$match: {
					[service_tags]: {
						$exists: true
					}
				}
			},
			{
				$unwind: {
					path: '$services',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$project: {
					_id: 0,
					'services.name': 1,
					'services.properties': 1,
					tags: {
						$objectToArray: '$services.properties'
					}
				}
			},
			{
				$unwind: {
					path: '$tags',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$group: {
					_id: '$services.name',
					tags: {
						$addToSet: '$tags.k'
					}
				}
			},
			{
				$sort: {
					_id: 1
				}
			},
			{
				$match: {
					tags: {
						$regex: state
					}
				}
			},
			{
				$count: 'count'
			}
		]);
		var value = result.length > 0 ? result[0].count : 0;
		resultArray.push({
			state: state,
			count: value
		});
	}
	return resultArray;
}

export async function getServiceBySupportCategory(
	categories,
	model,
	country,
	resultArray
) {
	let service_tags = `services.tags.${country}`;
	for (const category of categories) {
		let result = await model.aggregate([
			{
				$match: {
					[service_tags]: {
						$exists: true
					}
				}
			},
			{
				$unwind: {
					path: '$services',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$project: {
					_id: 0,
					'services.name': 1,
					'services.properties': 1,
					tags: {
						$objectToArray: '$' + service_tags
					}
				}
			},
			{
				$unwind: {
					path: '$tags',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$group: {
					_id: '$services.name',
					tags: {
						$addToSet: '$tags.k'
					}
				}
			},
			{
				$match: {
					tags: {
						$regex: category
					}
				}
			},
			{
				$count: 'count'
			}
		]);
		var value = result.length > 0 ? result[0].count : 0;
		resultArray.push({
			category: category,
			count: value
		});
	}

	return resultArray;
}
