/**********************************************************************************
  *  Release 2022-06-30
  *  Issue:  https://app.asana.com/0/1132189118126148/1202522027612226
  *  Description: This schema change will update the medical tag Abortion services to 
  *  Abortion Care.Abortion Providers across US, Mexico and Canadian regions. This will take care of the
  *  Mexico Migration
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
require('../../src/db');
var migrationFunctions = require('../migrationsFunctions');
var mongoose = require('../../src/mongoose');

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
					'services.tags.mexico.Medical.Abortion services': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.mexico.Medical'
				}
			}
		]);
		let bulkOperations = [];
		result.forEach((org) => {
			//Account for both possibilities
			let updatedTags = {'Abortion Providers': 'true'};
			delete org.tags['Abortion services'];
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: org._id
					},
					update: {
						'services.$[elem].tags.mexico.Medical': org.tags,
						'services.$[elem].tags.mexico.Abortion Care': updatedTags
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
		console.log('Migration Mexico executed');
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
					'services.tags.mexico.Abortion Care.Abortion services': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.mexico.Abortion Care'
				}
			}
		]);
		let bulkOperations = [];
		result.forEach((org) => {
			let updatedTags = renameKeys(
				{
					'Abortion services': 'Abortion Providers'
				},
				org.tags
			);
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: org._id
					},
					update: {
						'services.$[elem].tags.mexico.Abortion Care': updatedTags
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
		console.log('Rollback Mexico executed');
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
				}
			});
			break;
		default:
			runRollbackScript();
			break;
	}
}
