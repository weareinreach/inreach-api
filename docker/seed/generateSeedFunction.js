require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({path: '.env'});
const mongoose = require('../../src/mongoose');
const fs = require('fs');
const seedPath = './docker/seedData';
const faker = require('faker');
require('../../src/db');

export const generateSeedData = async (
	numberOfDocuments,
	fakeData,
	mongooseModel,
	collection,
	param
) => {
	var data = [];
	console.log(`Generating ${collection} Seed Data...`);
	let i = 0;
	let parameters = await param;
	for (; i < numberOfDocuments; i++) {
		//I know its inneficient, I'm getting a random array item or i
		let input =
			param === null ? i : parameters[(parameters.length * Math.random()) | 0];
		var seedData = new fakeData(input);
		const model = new mongooseModel(seedData);
		try {
			let saved = await model.save();
			console.log(`${collection} with id: ${saved._id} Added`);
		} catch (err) {
			console.error(err);
			process.exit(1);
		}
		data.push(seedData);
	}
	//Write File
	console.log('Writing file...');
	//if path doest exist creates it
	if (!fs.existsSync(seedPath)) fs.mkdirSync(seedPath);
	fs.writeFile(
		`${seedPath}/${collection.toLowerCase()}.json`,
		JSON.stringify(data),
		'utf8',
		(err) => {
			if (err) console.error(`Error writing seed file: ${err}`);
			console.log(`${collection} seeding completed. Exiting...`);
			process.exit(0);
		}
	);
};

export const getOrgs = async function () {
	let final = [];
	try {
		let orgs = await mongoose.Organization.find();
		orgs.forEach((org) => {
			final.push({
				organization_id: org._id,
				service_id: Math.random() < 0.5 ? org.services[0]._id : ''
			});
		});
		return final;
	} catch (err) {
		console.err(err);
		process.exit(1);
	}
};

export const getNumberBetween = function (upperLimit, lowerLimit) {
	return Math.floor(Math.random() * (upperLimit - 1 + 1) + lowerLimit);
};

export const getArray = function (max) {
	return new Array(
		faker.datatype.number({
			min: 1,
			max: max
		})
	).fill();
};
