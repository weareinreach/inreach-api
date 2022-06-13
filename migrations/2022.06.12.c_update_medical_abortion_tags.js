/**********************************************************************************
  *  Release 2022-06-12
  *  Description: This schema change will update the medical tag Abprtion Services to 
  *  Abortion services across US, Mexico and Canadian regions. This will take care of the
  *  Canada Migration
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
var migrationFunctions = require('./migrationsFunctions');
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
					'services.tags.canada.Medical.Abortion Services': {
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
					'Abortion Services': 'Abortion services'
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
					arrayFilters: [
						{
							'elem._id': {
								$eq: org.service_id
							}
						}
					]
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
					'services.tags.canada.Medical.Abortion services': {
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
					'Abortion services': 'Abortion Services'
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
					arrayFilters: [
						{
							'elem._id': {
								$eq: org.service_id
							}
						}
					]
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
	switch (process.env.PROFILE) {
		case 'CI':
			migrationFunctions.checkIfMigrationHasRun().then((hasRun) => {
				if (!hasRun) {
					runMigrationScript();
					migrationFunctions.registerMigration();
				}
			});
			break;
		default:
			runMigrationScript();
			break;
	}
}

if (process.env.ROLLBACK) {
	switch (process.env.PROFILE) {
		case 'CI':
			migrationFunctions.checkIfMigrationHasRun().then((hasRun) => {
				if (!hasRun) {
					runRollbackScript();
					migrationFunctions.registerMigration();
				}
			});
			break;
		default:
			runRollbackScript();
			break;
	}
}
