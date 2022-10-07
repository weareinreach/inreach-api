/**********************************************************************************
  *  Release 2022-10-01
  *  Issue:  https://app.asana.com/0/1202317426899416/1202920064990508
  *  This migration uses two provided .json files:
  *  1. services-keep-property.json to identify the organizations that should keep the 
  *  "commuinity-asylum-seeker" property and updates those that do not have the property.
  *  
  *  2. services-remove-property.json to identify the services that need the 
  *  "community-asylum-seeker" property removed, and if the associated organization
  *  has no services that do have the property, the organization itself will have
  *  this property removed from it as well.
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
var servicesRemove = require('./services-remove-property.json');
var servicesKeep = require('./services-keep-property.json');
var organizations = require('./all_services.json');
const {sort} = require('ramda');
const ObjectID = require('mongodb').ObjectID;
var allOrgs = [];
var keepService = [];
var removeService = [];

for (var j in servicesKeep) {
	keepService.push(servicesKeep[j].id);
}

for (var k in servicesRemove) {
	removeService.push(servicesRemove[k].id);
}

for (var i in organizations) {
	if (
		removeService.includes(organizations[i].service) ||
		keepService.includes(organizations[i].service)
	) {
		allOrgs.push(new ObjectID.createFromHexString(organizations[i].org));
	}
}

//Scripts
async function runMigrationScript() {
	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$organizations',
					preserveNullAndEmptyArrays: true
				}
			},

			{
				$match: {
					_id: {$in: allOrgs}
				}
			},

			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties',
					org_property: '$properties'
				}
			}
		]);

		let bulkOperations = [];
		let updateOne = {};

		result.forEach((org) => {
			for (let i in org.service_id) {
				if (keepService.includes(org.service_id[i].toString())) {
					// updateOne = {
					// 	filter: {
					// 		_id: org._id
					// 	},
					// 	update: {
					// 		$set: {
					// 			'services.[elem].properties.community-asylum-seeker':'true'
					// 		}
					// 	},
					// 	arrayFilters: [{'elem._id': {$eq: org.service_id}}]
					// };
				} else if (removeService.includes(org.service_id[i].toString())) {
					console.log(org.service_id[i].toString());
					console.log(' ');
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id
						},
						update: {
							$unset: {
								'services.$.properties.community-asylum-seeker': ''
							}
						}
					};
				}
				bulkOperations.push({
					updateOne
				});
			}
		});

		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);

		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Migration to add the "Trans Health - Hormone Therapy" tag and rename "Trans health" to "Trans Health - Primary Care" complete'
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
					path: '$organizations',
					preserveNullAndEmptyArrays: true
				}
			},

			{
				$match: {
					_id: {$in: allOrgs}
				}
			},

			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties',
					org_property: '$properties'
				}
			}
		]);

		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			for (let i in org.service_id) {
				if (keepService.includes(org.service_id[i].toString())) {
					// updateOne = {
					// 	filter: {
					// 		_id: org._id
					// 	},
					// 	update: {
					// 		$set: {
					// 			'services.[elem].properties.community-asylum-seeker':'true'
					// 		}
					// 	},
					// 	arrayFilters: [{'elem._id': {$eq: org.service_id}}]
					// };
				} else if (removeService.includes(org.service_id[i].toString())) {
					updateOne = {
						filter: {
							_id: org._id
						},
						update: {
							$set: {
								'services.$[elem].properties.community-asylum-seeker': ''
							}
						},
						arrayFilters: [{'elem._id': {$eq: org.service_id}}]
					};
				}
			}

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
			'Rollback to remove the "Trans Health - Hormone Therapy" tag and rename "Trans Health - Primary Care" to "Trans health" complete'
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
