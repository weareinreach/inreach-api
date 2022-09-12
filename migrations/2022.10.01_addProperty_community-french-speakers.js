/**********************************************************************************
  *  Release 2022-09-12
  *  Issue:  https://app.asana.com/0/1132189118126148/1202920064990500
  *  add the new 'community-{language}-speakers' property to all existing service pages 
  *  that already have these language properties
  *  'lang-spanish' - community-spanish-speakers
  *  'lang-french' - community-french-speakers
  *  'lang-arabic' - community-arabic-speakers
  *  'lang-russian' - community-russian-speakers
  * This file will add the community-french-speakers property
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
					'services.properties.lang-french': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties.lang-french'
				}
			}
		]);
		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			updateOne = {
				filter: {
					_id: org._id
				},
				update: {
					$set: {
						'services.$[elem].properties.community-french-speakers': 'true'
					}
				},
				arrayFilters: [{'elem._id': {$eq: org.service_id}}]
			};
			bulkOperations.push({
				updateOne
			});
		});

		console.log(bulkOperations.length);
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);

		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Migration to add the property community-french-speakers has executed'
		);
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

// Rollback Script
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
					'services.properties.lang-spanish': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties.lang-french'
				}
			}
		]);
		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			updateOne = {
				filter: {
					_id: org._id
				},
				update: {
					$unset: {
						'services.$[elem].properties.community-french-speakers': 'true'
					}
				},
				arrayFilters: [{'elem._id': {$eq: org.service_id}}]
			};
			bulkOperations.push({
				updateOne
			});
		});
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Rollback to remove the property community-french-speakers has executed'
		);
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
