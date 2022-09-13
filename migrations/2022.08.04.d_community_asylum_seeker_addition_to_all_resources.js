/**********************************************************************************
  *  Release 2022-08-04
  *  Issue:  https://app.asana.com/0/1202317426899416/1202595327250094
  *  Description: This schema change will add the "community-asylum-seeker" property
  * to all existing resources
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
			//Account for both possibilities
			let updatedTags = {'Abortion Providers': 'true'};
			delete org.tags['Abortion services'];
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: org._id
					},
					update: {
						'services.$[elem].tags.canada.Medical': org.tags,
						'services.$[elem].tags.canada.Abortion Care': updatedTags
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
		console.log('Migration Canda executed');
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
					'services.tags.canada.Abortion Care.Abortion services': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.canada.Abortion Care'
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
						'services.$[elem].tags.canada.Abortion Care': updatedTags
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
		console.log('Rollback Canda executed');
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
