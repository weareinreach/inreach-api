require('babel-register')({
	presets: ['env']
});

const seedFunctions = require('./generateSeedFunction');
const faker = require('faker');
const mongoose = require('../../src/mongoose');

//Functions
const numberOfRatings = seedFunctions.getNumberBetween(8, 1);
const randNumber = seedFunctions.getNumberBetween(4, 1);

class RatingData {
	constructor(param) {
		(this.organizationId = param.organization_id),
			(this.serviceId = param.service_id),
			(this.is_deleted = Math.random() < 0.9),
			(this.ratings = seedFunctions.getArray(randNumber).map(() => {
				return {
					rating: faker.datatype.number(5),
					source: Math.random() < 0.5 ? 'catalog' : 'control-panel',
					userId: faker.datatype.number(9999)
				};
			}));
	}
}

//Please ensure Orgs has been seeded already
//Execute Seeding
seedFunctions.generateSeedData(
	numberOfRatings,
	RatingData,
	mongoose.Rating,
	'Rating',
	seedFunctions.getOrgs()
);
