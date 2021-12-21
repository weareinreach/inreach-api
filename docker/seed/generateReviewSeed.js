require('babel-register')({
	presets: ['env']
});

const seedFunctions = require('./generateSeedFunction');
const faker = require('faker');
const mongoose = require('../../src/mongoose');

//Functions
const numberOfReviews = seedFunctions.getNumberBetween(8, 1);
const randNumber = seedFunctions.getNumberBetween(4, 1);

class ReviewData {
	constructor(param) {
		(this.comment = faker.lorem.sentence()),
			(this.hasAccount = Math.random() < 0.9),
			(this.hasLeftFeedbackBefore = Math.random() < 0.9),
			(this.negativeReasons = seedFunctions.getArray(randNumber).map(() => {
				return faker.lorem.sentence();
			}));
		this.rating = faker.datatype.number(5);
		this.source = Math.random() < 0.9 ? 'catalog' : 'control-panel';
	}
}

//Execute Seeding
seedFunctions.generateSeedData(
	numberOfReviews,
	ReviewData,
	mongoose.Review,
	'Review',
	null
);
