/**********************************************************************************
  *  Release 2022-02-01
  *  Issue:  https://app.asana.com/0/1132189118126148/1201694772812876
  *  Description: This schema change will update the medical tag Women's Health to 
  *  OBGYN Services across US, Mexico and Canadian regions. This will take care of the
  *  US Migration
  * ********************************************************************************
  

 /* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({
	path: '.env'
});
// Import DB Connection
require('../src/db');

var mongoose = require('../src/mongoose');
//Helper Function
let renameKeys = (keysMap, object) =>
	Object.keys(object).reduce(
		(acc, key) => ({
			...acc,
			...{
				[keysMap[key] || key]: object[key]
			}
		}),
		{}
	);

//Scripts
async function runMigrationScript() {
	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$services',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					"services.tags.canada.Medical.Women's health": {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.canada.Medical'
				}
			}
		]);
		let bulkOperations = [];
		result.forEach((org) => {
			//Account for both possibilities
			let updatedTags = renameKeys(
				{
					"Women's health": 'OBGYN services'
				},
				org.tags
			);
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: org._id
					},
					update: {
						'services.$[elem].tags.canada.Medical': updatedTags
					},
					arrayFilters: [{'elem._id': {$eq: org.service_id}}]
				}
			});
		});
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log('Migration Canada executed');
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

//Rollback Script
async function runRollbackScript() {
	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$services',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					'services.tags.canada.Medical.OBGYN services': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.canada.Medical'
				}
			}
		]);
		let bulkOperations = [];
		result.forEach((org) => {
			let updatedTags = renameKeys(
				{
					'OBGYN services': "Women's health"
				},
				org.tags
			);
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: org._id
					},
					update: {
						'services.$[elem].tags.canada.Medical': updatedTags
					},
					arrayFilters: [{'elem._id': {$eq: org.service_id}}]
				}
			});
		});
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log('Rollback Canada executed');
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

if (process.env.MIGRATION) {
	runMigrationScript();
}

if (process.env.ROLLBACK) {
	runRollbackScript();
}
