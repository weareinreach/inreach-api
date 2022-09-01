/**********************************************************************************
  *  Release 2022-06-30
  *  Issue:  https://app.asana.com/0/1132189118126148/1202522027612226
  *  Description: This schema change will update US orgs with state info, lacking coordinates and add
  *  default coordinates to the capital of the state
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
const usStateInfo = require('../resources/unites-states-capital-geolocation.json');

async function assignStateCoords(location) {
	usStateInfo.forEach((state) => {
		if (
			location.state.trim() == state.properties.stateShort ||
			location.state.trim() == state.properties.stateLong
		) {
			location.long = state.geometry.coordinates[0];
			location.lat = state.geometry.coordinates[1];
			location.geolocation.coordinates = state.geometry.coordinates;
		}
	});
}

async function processOrganizations(orgs, goodCount, badCount, badCountArray) {
	orgs.forEach((org) => {
		org.locations.forEach((location) => {
			if (location.state) {
				location = assignStateCoords(location);
				goodCount++;
			} else {
				badCount++;
				badCountArray.push(location._id);
			}
		});
	});
	return orgs;
}

//Scripts
async function runMigrationScript() {
	try {
		let update = await mongoose.Organization.updateOne(
			{'locations._id': '62c63c0d178f1100164f504a'},
			{
				'locations.$.city': 'Oakland',
				'locations.$.state': 'CA',
				'locations.$.address': ''
			}
		);

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
		let processedOrgs = await processOrganizations(result, 0, 0, []);
		processedOrgs.forEach((org) => {
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: org._id
					},
					update: {
						locations: org.locations
					}
				}
			});
		});
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log('Migration United States executed');
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
