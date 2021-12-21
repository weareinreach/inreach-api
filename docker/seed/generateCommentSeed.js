require('babel-register')({
	presets: ['env']
});

const seedFunctions = require('./generateSeedFunction');
const faker = require('faker');
const mongoose = require('../../src/mongoose');

//Functions
const numberOfComments = seedFunctions.getNumberBetween(8, 1);
const randNumber = seedFunctions.getNumberBetween(4, 1);

class CommentData {
	constructor(param) {
		(this.organizationId = param.organization_id),
			(this.serviceId = param.service_id),
			(this.is_deleted = Math.random() < 0.9),
			(this.comments = seedFunctions.getArray(randNumber).map(() => {
				return {
					comment: faker.lorem.sentence(),
					source: Math.random() < 0.5 ? 'catalog' : 'control-panel',
					userId: faker.datatype.number(9999)
				};
			}));
	}
}

//Please ensure Orgs has been seeded already
//Execute Seeding
seedFunctions.generateSeedData(
	numberOfComments,
	CommentData,
	mongoose.Comment,
	'Comment',
	seedFunctions.getOrgs()
);
