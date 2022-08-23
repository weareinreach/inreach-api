/**********************************************************************************
  *  Release 2022-06-30
  *  Issue:  https://app.asana.com/0/1132189118126148/1202522027612226
  *  Description: This schema change will update the medical tag Abortion services to 
  *  Abortion Care.Abortion Providers across US, Mexico and Canadian regions. This will take care of the
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
var migrationFunctions = require('./migrationsFunctions');
var mongoose = require('../src/mongoose');

async function processOrganization(org) {
	console.log(org);
}

//Scripts
async function runMigrationScript() {
	const result = await mongoose.Organization.aggregate([
		{
			$match: {
				$and: [
					{
						'properties.service-national-united-states': {
							$exists: true
						}
					},
					{
						$or: [
							{
								'locations.lat': {
									$eq: null
								}
							},
							{
								'locations.lat': {
									$eq: ''
								}
							}
						]
					}
				]
			}
		},
		{
			$project: {
				id: 1,
				properties: 1,
				locations: 1
			}
		}
	]);
	let bulkOperations = [];
	result.forEach((org) => {
		processOrganization(org);
	});
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
