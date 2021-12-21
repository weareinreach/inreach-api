require('babel-register')({
	presets: ['env']
});

const seedFunctions = require('./generateSeedFunction');
const faker = require('faker');
const mongoose = require('../../src/mongoose');
const crypto = require('crypto');

//Functions
const numberOfUsers = seedFunctions.getNumberBetween(6, 1);

//Create Fake Data
class UserData {
	constructor(param) {
		this.age = faker.datatype.number(99);
		this.currentLocation = faker.address.streetAddress();
		this.email = faker.internet.email();
		this.isAdminDataManager = Math.random() < 0.2 ? false : true;
		this.isDataManager = Math.random() < 0.8 ? false : true;
		this.name = faker.name.findName();
		this.salt = crypto.randomBytes(16).toString('hex');
		this.hash = crypto
			.pbkdf2Sync(faker.internet.password(), this.salt, 10000, 512, 'sha512')
			.toString('hex');
	}
}

//Execute Seeding
seedFunctions.generateSeedData(
	numberOfUsers,
	UserData,
	mongoose.User,
	'Users',
	null
);
