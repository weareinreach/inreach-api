require('babel-register')({
	presets: ['env']
});

const seedFunctions = require('./generateSeedFunction');
const faker = require('faker');
const mongoose = require('../../src/mongoose');

//Functions
const numberOfSuggestions = 1; //seedFunctions.getNumberBetween(8, 1);
const randNumber = seedFunctions.getNumberBetween(4, 1);

class SuggestionData {
	constructor(param) {
		(this.organizationId = param.organization_id),
			(this.serviceId = param.service_id),
			(this.field = Math.random() < 0.5 ? 'Description' : 'Location'),
			(this.userEmail = faker.internet.email()),
			(this.value = faker.lorem.sentences(randNumber));
	}
}

//Please ensure Orgs has been seeded already
//Execute Seeding
seedFunctions.generateSeedData(
	numberOfSuggestions,
	SuggestionData,
	mongoose.Suggestion,
	'Suggestion',
	seedFunctions.getOrgs()
);
