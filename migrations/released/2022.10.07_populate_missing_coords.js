/**********************************************************************************
  *  Release 2022-10-06
  *  Issue:  https://app.asana.com/0/0/1202920064990499/f
  *  Description: This schema change will update orgs missing coordinates
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
const updatedData = require('../lib/2022-10-07_missing_coords/out.json');

//Scripts
async function runMigrationScript() {
	try {
		const bulkOperations = updatedData.map((org) => ({
			updateOne: {
				filter: {
					_id: org._id.$oid,
					'locations._id': org.loc_id.$oid
				},
				update: {
					$set: {
						'locations.$.lat': org.lat,
						'locations.$.long': org.long
					}
				}
			}
		}));

		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log('Migration executed - Update lat/long for orgs missing data.');
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

//Rollback Script
async function runRollbackScript() {}

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
